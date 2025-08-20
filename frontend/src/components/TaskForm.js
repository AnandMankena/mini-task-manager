import React, { useState, useEffect } from 'react';
import './TaskForm.css';

const TaskForm = ({ task, onSubmit, onClose }) => {
  // Store the form input values
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' // Default status for new tasks
  });
  
  // Show loading state while saving
  const [loading, setLoading] = useState(false);

  // When editing a task, populate the form with existing data
  useEffect(() => {
    if (task) {
      // We're editing an existing task - fill in the current values
      setFormData({
        title: task.title,
        description: task.description || '', // Handle null/undefined descriptions
        status: task.status
      });
    }
    // If no task is passed, we keep the empty defaults (new task mode)
  }, [task]); // Re-run if the task prop changes

  // Update form data when user types in any input
  const handleChange = (e) => {
    setFormData({
      ...formData, // Keep existing values
      [e.target.name]: e.target.value // Update just the field that changed
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Don't reload the page
    setLoading(true); // Show "Saving..." state
    
    try {
      // Call the function passed from parent (TaskList component)
      // Parent will decide whether to create new task or update existing one
      await onSubmit(formData);
      // If successful, parent will close this modal
    } catch (error) {
      // Log error but don't show user error message - parent handles that
      console.error('Error submitting task:', error);
    } finally {
      setLoading(false); // Always stop loading spinner
    }
  };

  return (
    // Modal overlay - covers the whole screen with semi-transparent background
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal header with title and close button */}
        <div className="modal-header">
          {/* Different title for editing vs creating */}
          <h2>{task ? 'Edit Task' : 'Add New Task'}</h2>
          {/* X button to close modal */}
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="task-form">
          {/* Task title input - required field */}
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title" // This matches our formData key
              value={formData.title}
              onChange={handleChange}
              required // Browser validation
              placeholder="Enter task title"
            />
          </div>
          
          {/* Task description - optional, larger text area */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description" // This matches our formData key
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description (optional)"
              rows="4" // Make it tall enough for multiple lines
            />
          </div>
          
          {/* Status dropdown - only show when editing existing task */}
          {task && (
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
          
          {/* Action buttons at the bottom */}
          <div className="form-actions">
            {/* Cancel button - just closes modal without saving */}
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            
            {/* Submit button - changes text based on mode and loading state */}
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Saving...' : (task ? 'Update Task' : 'Add Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
