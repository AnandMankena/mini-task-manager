import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

// Our backend API endpoint - change this if you deploy to a different URL
const API_BASE_URL = 'http://localhost:3001';

const Login = ({ onLogin }) => {
  // Toggle between signup and login mode - starts as login
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Store the form input values
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Show loading state while making API call
  const [loading, setLoading] = useState(false);
  
  // Display error messages if something goes wrong
  const [error, setError] = useState('');

  // Update form data when user types in inputs
  const handleChange = (e) => {
    setFormData({
      ...formData, // Keep existing values
      [e.target.name]: e.target.value // Update just the field that changed
    });
    
    // Clear any error message when they start typing - gives them a fresh start
    setError('');
  };

  // Handle form submission for both login and signup
  const handleSubmit = async (e) => {
    e.preventDefault(); // Don't let the form reload the page
    setLoading(true); // Show loading state
    setError(''); // Clear any previous errors

    try {
      // Choose the right endpoint based on whether they're signing up or logging in
      const endpoint = isSignUp ? '/auth/signup' : '/auth/login';
      
      // Make the API call to our backend
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData);
      
      // If successful, extract token and user info from response
      const { token, user } = response.data;
      
      // Tell the parent component (App) that login was successful
      // This will trigger the redirect to the tasks page
      onLogin(token, user);
      
    } catch (error) {
      // Something went wrong - show the error message
      // Use the error from backend if available, otherwise show generic message
      setError(error.response?.data?.error || 'An error occurred');
    } finally {
      // Always stop loading, whether success or failure
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Dynamic title based on current mode */}
        <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
        
        {/* Show error message if there is one */}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Email input field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email" // HTML5 email validation
              id="email"
              name="email" // This matches our formData key
              value={formData.email}
              onChange={handleChange}
              required // Browser validation
              placeholder="Enter your email"
            />
          </div>
          
          {/* Password input field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password" // Hides the text
              id="password"
              name="password" // This matches our formData key
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6" // Matches our backend validation
            />
          </div>
          
          {/* Submit button - changes text based on state */}
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </form>
        
        {/* Toggle between signup and login modes */}
        <div className="switch-mode">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button" // Not a submit button
              onClick={() => setIsSignUp(!isSignUp)} // Flip the boolean
              className="link-btn"
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
