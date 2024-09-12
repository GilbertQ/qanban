import React, { useState, useEffect } from 'react';

// Helper to get tasks from localStorage
const getStoredTasks = () => {
  const storedTasks = localStorage.getItem('kanbanTasks');
  return storedTasks ? JSON.parse(storedTasks) : { todo: [], doing: [], done: [] };
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useState(getStoredTasks());
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  // Save tasks to localStorage whenever tasks state changes
  useEffect(() => {
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Add a new task to the Todo list
  const addTask = () => {
    if (newTask.trim() === '') return;
    const updatedTasks = { ...tasks, todo: [...tasks.todo, newTask] };
    setTasks(updatedTasks);
    setNewTask('');
  };

  // Edit an existing task
  const updateTask = (listName, taskIndex, updatedText) => {
    const updatedList = [...tasks[listName]];
    updatedList[taskIndex] = updatedText;
    setTasks({ ...tasks, [listName]: updatedList });
  };

  // Delete a task with confirmation
  const deleteTask = (listName, taskIndex) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    const updatedList = tasks[listName].filter((_, idx) => idx !== taskIndex);
    setTasks({ ...tasks, [listName]: updatedList });
  };

  // Move task between Todo, Doing, and Done
  const moveTask = (sourceList, destList, taskIndex) => {
    const taskToMove = tasks[sourceList][taskIndex];
    const updatedSourceList = tasks[sourceList].filter((_, idx) => idx !== taskIndex);
    const updatedDestList = [...tasks[destList], taskToMove];
    setTasks({ ...tasks, [sourceList]: updatedSourceList, [destList]: updatedDestList });
  };

  return (
    <div className="kanban-board">
      {/* Input to add new task */}
      <div>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task"
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      {/* Task Lists */}
      <div className="kanban-lists">
        {['todo', 'doing', 'done'].map((listName) => (
          <div key={listName} className="kanban-list">
            <h2>{listName.toUpperCase()}</h2>
            {tasks[listName].map((task, index) => (
              <div key={index} className="kanban-task">
                {editingTask === `${listName}-${index}` ? (
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => updateTask(listName, index, e.target.value)}
                    onBlur={() => setEditingTask(null)}
                  />
                ) : (
                  <>
                    <span onClick={() => setEditingTask(`${listName}-${index}`)}>{task}</span>
                    <button onClick={() => deleteTask(listName, index)}>Delete</button>
                    {listName === 'todo' && (
                      <button onClick={() => moveTask('todo', 'doing', index)}>Move to Doing</button>
                    )}
                    {listName === 'doing' && (
                      <button onClick={() => moveTask('doing', 'done', index)}>Move to Done</button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
