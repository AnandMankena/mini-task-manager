// Core dependencies - the essentials we need to build our API
const express = require('express');
const cors = require('cors'); // Lets our frontend talk to this backend
const sqlite3 = require('sqlite3').verbose(); // Our lightweight database
const bcrypt = require('bcryptjs'); // For hashing passwords securely
const jwt = require('jsonwebtoken'); // For creating login tokens
require('dotenv').config(); // Load our secret keys from .env file

const app = express();
const PORT = process.env.PORT || 3001; // Use environment port or default to 3001

// Basic middleware setup
app.use(cors()); // Allow requests from our React frontend
app.use(express.json()); // Parse JSON from request bodies

// Set up our SQLite database connection
// Using the path from .env or fallback to local file
const db = new sqlite3.Database(process.env.DB_PATH || './database.sqlite');

// Create our database tables if they don't exist yet
// serialize() ensures these run in order, not simultaneously
db.serialize(() => {
  // Users table - keeps track of who can log in
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tasks table - stores all the user's todo items
  // user_id links each task to the person who created it
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// This middleware checks if someone is logged in before they can access tasks
// We'll use this to protect all our task routes
const authenticateToken = (req, res, next) => {
  // Look for the Authorization header (format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract just the token part

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Verify the token using our secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // If token is valid, save user info for the next middleware/route
    req.user = user;
    next();
  });
};

// SIGNUP ROUTE - Create a new user account
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation - make sure we have what we need
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Enforce minimum password length for security
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if someone already signed up with this email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash the password so we never store it in plain text
      // 10 is the "salt rounds" - higher = more secure but slower
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save the new user to database
      db.run(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword],
        function(err) { // Note: using function() not arrow function to get 'this.lastID'
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Create a login token right away so they don't need to login again
          const token = jwt.sign(
            { userId: this.lastID, email }, // this.lastID is the new user's ID
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token expires in 24 hours
          );

          // Send back the token and user info
          res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: this.lastID, email }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// LOGIN ROUTE - Authenticate an existing user
app.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find the user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        // Use generic "Invalid credentials" to avoid giving away if email exists
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Compare the provided password with the hashed one in database
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Password is correct! Create a login token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, email: user.email }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET ALL TASKS - Show all tasks for the logged-in user
// authenticateToken middleware runs first to make sure they're logged in
app.get('/tasks', authenticateToken, (req, res) => {
  // Only get tasks that belong to this user, newest first
  db.all(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId], // req.user comes from our authenticateToken middleware
    (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }
      res.json(tasks);
    }
  );
});

// CREATE NEW TASK
app.post('/tasks', authenticateToken, (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Create the task and link it to the current user
  db.run(
    'INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)',
    [title, description || '', req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create task' });
      }

      // Fetch the newly created task so we can return it
      // this.lastID is the ID of the task we just created
      db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, task) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch created task' });
        }
        res.status(201).json(task);
      });
    }
  );
});

// UPDATE EXISTING TASK
app.put('/tasks/:id', authenticateToken, (req, res) => {
  const { title, description, status } = req.body;
  const taskId = req.params.id;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Update the task, but only if it belongs to the current user
  // The "WHERE user_id = ?" part is crucial for security
  db.run(
    `UPDATE tasks SET 
     title = ?, 
     description = ?, 
     status = ?, 
     updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`,
    [title, description || '', status || 'pending', taskId, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update task' });
      }

      // this.changes tells us how many rows were affected
      // If 0, either the task doesn't exist or doesn't belong to this user
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found or unauthorized' });
      }

      // Get the updated task to return it
      db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch updated task' });
        }
        res.json(task);
      });
    }
  );
});

// DELETE TASK
app.delete('/tasks/:id', authenticateToken, (req, res) => {
  const taskId = req.params.id;

  // Delete the task, but only if it belongs to the current user
  db.run(
    'DELETE FROM tasks WHERE id = ? AND user_id = ?',
    [taskId, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete task' });
      }

      // Check if we actually deleted something
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found or unauthorized' });
      }

      res.json({ message: 'Task deleted successfully' });
    }
  );
});

// Simple health check - useful for debugging and monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Fire up the server!
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
