import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, TextField, List, ListItem, 
  ListItemText, ListItemSecondaryAction, IconButton, 
  Dialog, DialogActions, DialogContent, DialogContentText, 
  DialogTitle, Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel
} from '@mui/material';
import { Delete, ArrowForward, ArrowBack } from '@mui/icons-material';

const TaskList = ({ tasks, onEdit, onDelete, onMoveForward, onMoveBack }) => (
  <Paper elevation={3} style={{ padding: '1rem', height: '100%' }}>
    <h2>{tasks.title}</h2>
    <List>
      {tasks.tasks.map(task => (
        <ListItem key={task.id}>
          <ListItemText primary={task.text} onClick={() => onEdit(task)} />
          <ListItemSecondaryAction>
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
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  </Paper>
);

const EditTaskDialog = ({ open, task, onSave, onClose }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Edit Task</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        fullWidth
        value={task.text}
        onChange={(e) => onSave({ ...task, text: e.target.value })}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={() => onSave(task)}>Save</Button>
    </DialogActions>
  </Dialog>
);

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

const KanbanTodo = () => {
  const [tasks, setTasks] = useState({
    todo: [],
    doing: [],
    done: []
  });
  const [newTask, setNewTask] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedList, setSelectedList] = useState('todo');

  useEffect(() => {
    const savedTasks = localStorage.getItem('kanbanTasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleNewTaskSubmit = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks(prev => ({
        ...prev,
        [selectedList]: [...prev[selectedList], { id: Date.now(), text: newTask }]
      }));
      setNewTask('');
    }
  };

  const handleTaskEdit = (updatedTask) => {
    setTasks(prev => ({
      ...prev,
      [selectedList]: prev[selectedList].map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    }));
    setEditTask(null);
  };

  const handleTaskDelete = () => {
    setTasks(prev => ({
      ...prev,
      [selectedList]: prev[selectedList].filter(task => task.id !== deleteConfirm.id)
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
  };

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
        <FormLabel component="legend">Choose List</FormLabel>
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
          {Object.keys(tasks).map(list => (
            <TaskList
              key={list}
              title={list.charAt(0).toUpperCase() + list.slice(1)}
              tasks={tasks[list]}
              onEdit={(task) => setEditTask({ ...task, list })}
              onDelete={(id) => setDeleteConfirm({ id, list })}
              onMoveForward={(id) => handleTaskMove(id, list, selectedList)}
              onMoveBack={(id) => handleTaskMove(id, selectedList, list)}
            />
          ))}
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
