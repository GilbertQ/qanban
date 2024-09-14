import React, { useState, useEffect } from 'react';
import {
  Container, Paper, TextField, List, ListItem,
  ListItemText, IconButton,
  Dialog, DialogActions, Grid, DialogContent, DialogContentText,
  DialogTitle, Button, Radio, RadioGroup, FormControlLabel, FormControl
} from '@mui/material';
import { Delete, ArrowForward, ArrowBack } from '@mui/icons-material';

const KanbanTodo = () => {
  const [newTask, setNewTask] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedList, setSelectedList] = useState('doing');

  const [tasks, setTasks] = useState(() => {
    const storedTasks = localStorage.getItem('kanbanTasks');
    return storedTasks ? JSON.parse(storedTasks) : { todo: [], doing: [], done: [] };
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleNewTaskSubmit = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks(prev => ({
        ...prev,
        todo: [...prev.todo, { id: Date.now(), text: newTask }]
      }));
      setNewTask('');
      setSelectedList('todo'); // Switch to "To Do" list after adding a new task
    }
  };

  const handleTaskEdit = (updatedTask) => {
    setTasks(prev => ({
      ...prev,
      [editTask.list]: prev[editTask.list].map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    }));
    setEditTask(null);
  };

  const handleTaskDelete = () => {
    setTasks(prev => ({
      ...prev,
      [deleteConfirm.list]: prev[deleteConfirm.list].filter(task => task.id !== deleteConfirm.id)
    }));
    setDeleteConfirm(null);
  };

  const handleTaskMove = (id, fromList, toList) => {
    const taskToMove = tasks[fromList].find(task => task.id === id);
    setTasks(prev => ({
      ...prev,
      [fromList]: prev[fromList].filter(task => task.id !== id),
      [toList]: [...prev[toList], taskToMove]
    }));
    setSelectedList(toList);
  };

  const TaskList = ({ tasks, onEdit, onDelete, onMoveForward, onMoveBack }) => (
    <Paper elevation={3} style={{ padding: '1rem', height: '100%' }}>
      <h2>{tasks.title}</h2>
      <List>
        {tasks.tasks.map(task => (
          <ListItem key={task.id}>
            <ListItemText primary={task.text} onClick={() => onEdit(task)} />
            {onMoveBack && (
              <IconButton edge="start" onClick={() => onMoveBack(task.id)}>
                <ArrowBack />
              </IconButton>
            )}
            <IconButton edge="end" onClick={() => onDelete(task.id)}>
              <Delete />
            </IconButton>
            {onMoveForward && (
              <IconButton edge="end" onClick={() => onMoveForward(task.id)}>
                <ArrowForward />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  const EditTaskDialog = ({ open, task, onSave, onClose }) => {
    const [taskText, setTaskText] = useState(task.text);
  
    useEffect(() => {
      setTaskText(task.text);
    }, [task]);
  
    const handleSave = () => {
      onSave({ ...task, text: taskText });
    };
  
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    );
  };
  

  const DeleteConfirmationDialog = ({ open, onClose, onConfirm }) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete this task?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="secondary">Delete</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container>
      <form onSubmit={handleNewTaskSubmit}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Add a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          margin="normal"
        />
      </form>

      <FormControl component="fieldset" margin="normal">
        <RadioGroup
          row
          value={selectedList}
          onChange={(e) => setSelectedList(e.target.value)}
        >
          <FormControlLabel value="todo" control={<Radio />} label="To Do" />
          <FormControlLabel value="doing" control={<Radio />} label="Doing" />
          <FormControlLabel value="done" control={<Radio />} label="Done" />
        </RadioGroup>
      </FormControl>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {selectedList === 'todo' && (
            <TaskList
              tasks={{ title: 'Todo', tasks: tasks.todo }}
              onEdit={(task) => setEditTask({ ...task, list: 'todo' })}
              onDelete={(id) => setDeleteConfirm({ id, list: 'todo' })}
              onMoveForward={(id) => handleTaskMove(id, 'todo', 'doing')}
            />
          )}
          {selectedList === 'doing' && (
            <TaskList
              tasks={{ title: 'Doing', tasks: tasks.doing }}
              onEdit={(task) => setEditTask({ ...task, list: 'doing' })}
              onDelete={(id) => setDeleteConfirm({ id, list: 'doing' })}
              onMoveForward={(id) => handleTaskMove(id, 'doing', 'done')}
              onMoveBack={(id) => handleTaskMove(id, 'doing', 'todo')}
            />
          )}
          {selectedList === 'done' && (
            <TaskList
              tasks={{ title: 'Done', tasks: tasks.done }}
              onEdit={(task) => setEditTask({ ...task, list: 'done' })}
              onDelete={(id) => setDeleteConfirm({ id, list: 'done' })}
              onMoveBack={(id) => handleTaskMove(id, 'done', 'doing')}
            />
          )}
        </Grid>
      </Grid>

      {editTask && (
        <EditTaskDialog
          open={Boolean(editTask)}
          task={editTask}
          onSave={handleTaskEdit}
          onClose={() => setEditTask(null)}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmationDialog
          open={Boolean(deleteConfirm)}
          onConfirm={handleTaskDelete}
          onClose={() => setDeleteConfirm(null)}
        />
      )}
    </Container>
  );
};

export default KanbanTodo;


