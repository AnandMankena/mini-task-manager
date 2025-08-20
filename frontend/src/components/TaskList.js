import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './TaskForm';
import './TaskList.css';

// Our backend API endpoint
const API_BASE_URL = 'http://localhost:3001';

const TaskList = ({ user, onLogout }) => {
  // Store all the user's tasks
  const [tasks, setTasks] = useState([]);
  
  // Loading state for initial task fetch
  const [loading, setLoading] = useState(true);
  
  // Error messages to show user if API calls fail
  const [error, setError] = useState('');
  
  // Controls whether the add/edit task modal is open
  const [showForm, setShowForm] = useState(false);
  
  // Which task we're currently editing (null if adding new task)
  const [editingTask, setEditingTask] = useState(null);

  // Helper function to get auth headers for API calls
  // Every API call needs the JWT token to prove we're logged in
  const getAuthHeaders = () => ({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Fetch all tasks from the backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tasks`, getAuthHeaders());
      setTasks(response.data);
    } catch (error) {
      setError('Failed to fetch tasks');
      
      // If token is invalid/expired, log them out automatically
      if (error.response?.status === 401) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Load tasks when component first mounts
  useEffect(() => {
    fetchTasks();
  }, []); // Empty dependency array = run once on mount

  // Create a new task
  const handleAddTask = async (taskData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData, getAuthHeaders());
      
      // Add the new task to the beginning of our list (newest first)
      setTasks([response.data, ...tasks]);
      
      // Close the modal
      setShowForm(false);
    } catch (error) {
      setError('Failed to create task');
    }
  };

  // Update an existing task
  const handleUpdateTask = async (taskData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tasks/${editingTask.id}`, 
        taskData, 
        getAuthHeaders()
      );
      
      // Replace the old task with updated data in our state
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? response.data : task
      ));
      
      // Clear editing state and close modal
      setEditingTask(null);
      setShowForm(false);
    } catch (error) {
      setError('Failed to update task');
    }
  };

  // Delete a task with confirmation
  const handleDeleteTask = async (taskId) => {
    // Show browser confirmation dialog - prevents accidental deletes
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, getAuthHeaders());
        
        // Remove the deleted task from our state
        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (error) {
        setError('Failed to delete task');
      }
    }
  };

  // Toggle task between completed and pending
  const handleToggleStatus = async (task) => {
    // Flip the status
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tasks/${task.id}`,
        { ...task, status: newStatus }, // Keep all task data, just change status
        getAuthHeaders()
      );
      
      // Update the task in our state with the response data
      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
    } catch (error) {
      setError('Failed to update task status');
    }
  };

  // Open edit modal for a specific task
  const handleEditTask = (task) => {
    setEditingTask(task); // Remember which task we're editing
    setShowForm(true); // Show the modal
  };

  // Close the add/edit modal and reset editing state
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null); // Clear any task we were editing
  };

  // Show loading spinner while fetching tasks
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      {/* Top header with title and user actions */}
      <header className="task-header">
        <div className="header-content">
          <h1>My Tasks</h1>
          <div className="header-actions">
            {/* Show user's email so they know who's logged in */}
            <span className="user-email">Welcome, {user.email}</span>
            
            {/* Button to open add task modal */}
            <button onClick={() => setShowForm(true)} className="add-task-btn">
              + Add Task
            </button>
            
            {/* Logout button */}
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Show error message if any API call failed */}
      {error && <div className="error-message">{error}</div>}

      <div className="tasks-content">
        {/* Show different content based on whether user has tasks */}
        {tasks.length === 0 ? (
          // Empty state - no tasks yet
          <div className="empty-state">
            <h3>No tasks yet!</h3>
            <p>Create your first task to get started.</p>
            <button onClick={() => setShowForm(true)} className="create-first-task-btn">
              Create First Task
            </button>
          </div>
        ) : (
          // Task grid - show all tasks in cards
          <div className="tasks-grid">
            {tasks.map(task => (
              <div key={task.id} className={`task-card ${task.status}`}>
                {/* Task info section */}
                <div className="task-content">
                  <h3 className="task-title">{task.title}</h3>
                  
                  {/* Only show description if it exists */}
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  
                  {/* Status and date info */}
                  <div className="task-meta">
                    <span className={`status-badge ${task.status}`}>
                      {task.status}
                    </span>
                    <span className="task-date">
                      {/* Format the date nicely */}
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {/* Action buttons for each task */}
                <div className="task-actions">
                  {/* Complete/Undo button with dynamic text */}
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`status-btn ${task.status}`}
                  >
                    {task.status === 'completed' ? '↩ Undo' : '✓ Complete'}
                  </button>
                  
                  {/* Edit button */}
                  <button
                    onClick={() => handleEditTask(task)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Show the add/edit task modal when needed */}
      {showForm && (
        <TaskForm
          task={editingTask} // null for new task, task object for editing
          onSubmit={editingTask ? handleUpdateTask : handleAddTask} // Different function based on mode
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default TaskList;
