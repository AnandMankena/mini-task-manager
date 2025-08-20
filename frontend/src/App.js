import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  // Keep track of whether the user is logged in or not
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Store the current user's info (email, id, etc.)
  const [user, setUser] = useState(null);
  
  // Show loading spinner while we check if user was already logged in
  // This prevents the annoying flash of login page when they're actually logged in
  const [loading, setLoading] = useState(true);

  // Run once when the app starts up
  useEffect(() => {
    // Check if user was previously logged in by looking at localStorage
    // We saved their token and info there when they logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    // If we found both token and user data, they were logged in before
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData)); // Convert JSON string back to object
    }
    
    // Either way, we're done checking - stop showing loading spinner
    setLoading(false);
  }, []); // Empty array means this only runs once when component mounts

  // Called by Login component when user successfully logs in
  const handleLogin = (token, userData) => {
    // Save to localStorage so they stay logged in even if they refresh page
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData)); // Convert object to JSON string
    
    // Update our app state
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Called by TaskList component when user clicks logout
  const handleLogout = () => {
    // Clear everything from localStorage - they won't be auto-logged in next time
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset our app state back to logged out
    setIsAuthenticated(false);
    setUser(null);
  };

  // Show loading screen while we figure out if they're logged in
  // This prevents the login form from flashing before redirecting to tasks
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login page - only show this if they're NOT logged in */}
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : (
                // If they're already logged in, send them to tasks instead
                <Navigate to="/tasks" replace />
              )
            } 
          />
          
          {/* Tasks page - only show this if they ARE logged in */}
          <Route 
            path="/tasks" 
            element={
              isAuthenticated ? (
                <TaskList user={user} onLogout={handleLogout} />
              ) : (
                // If they're not logged in, send them to login page
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Default route - smart redirect based on login status */}
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/tasks" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
