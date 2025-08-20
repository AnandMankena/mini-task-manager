# Mini Task Manager

A modern full-stack task management application with user authentication, fast CRUD operations, and polished UI. Built with React, Node.js, Express, SQLite, and fully containerized with Docker.

---

## 🚀 Features

- **User Authentication:** Secure signup/login with JWT tokens
- **Task Management:** Create, edit, delete, complete/incomplete toggle  
- **Instant Feedback:** Responsive UI, smooth loading and error messages
- **Beautiful Design:** Glassmorphism, mobile-friendly, elegant animations
- **Dockerized:** Simple deployment using Docker Compose

---

## 🛠 Tech Stack

- **Frontend:** React 18, React Router 6, Axios, CSS3
- **Backend:** Node.js, Express.js, SQLite, JWT, bcryptjs
- **DevOps:** Docker, Docker Compose, Nginx

---

## 📦 Project Structure

mini-task-manager/
├── frontend/ # React app
│ ├── src/
│ │ └── components/
│ │ ├── Login.js
│ │ ├── TaskList.js
│ │ └── TaskForm.js
│ ├── public/
│ ├── Dockerfile
│ ├── nginx.conf
│ └── .dockerignore
├── backend/ # Node.js API
│ ├── server.js
│ ├── Dockerfile
│ ├── .env
│ └── .dockerignore
├── docker-compose.yml
└── README.md



---

## 🏃‍♂️ Quick Start

### Option 1: Docker Compose (Recommended)

1. Make sure Docker Desktop is running.
2. In your project directory, run:

docker compose up --build



3. App will be live at:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001](http://localhost:3001)

### Option 2: Manual Setup

#### Backend:
cd backend
npm install
npm start


#### Frontend:
cd frontend
npm install
npm start

App will use the same URLs.

---

## 🔧 Environment Configuration

**backend/.env.example**
JWT_SECRET=your_super_secret_key_here
PORT=3001
DB_PATH=./database.sqlite


**frontend/.env.example**
*(Optional — currently hardcoded for localhost API usage)*

---

## 📡 API Endpoints

- `POST /auth/signup` — Create user (body: `{email, password}`)
- `POST /auth/login` — Login (body: `{email, password}`)
- `GET /tasks` — [Auth Required] Get all user tasks
- `POST /tasks` — [Auth] Create task
- `PUT /tasks/:id` — [Auth] Update task
- `DELETE /tasks/:id` — [Auth] Delete task
- `GET /health` — Health check/server status

All `/tasks` endpoints require an `Authorization: Bearer <token>` header.

---

## 🎯 Usage Instructions

1. Visit [http://localhost:3000](http://localhost:3000).
2. Sign up with email and password (min. 6 characters).
3. Log in to access your task dashboard.
4. Add, edit, complete, and delete tasks.
5. Edit or toggle status using buttons on each task.
6. Log out safely at any time.

---

## 🏗 Architecture & Code Quality

- **Separation of concerns:** Clear frontend/backend separation
- **Modular codebase:** Small, commented components and route handlers
- **Secure:** JWT, bcrypt, input validation, prepared statements
- **SPA Routing:** React Router is handled using nginx fallback in Docker
- **Docker Compose:** Multi-container orchestration for easy deployment

---

## ⏱ Development Time & Trade-offs

- Total time: ~2 hours
- Chose SQLite for local/demo simplicity
- Focused on user experience & core features
- Manual testing for reliability, clean error handling
- Dockerized for easy dev/prod parity

---

## 🔒 Security Features

- **Passwords:** Salted and hashed with bcrypt
- **Tokens:** JWT with short expiry, validated on every request
- **User Isolation:** Cannot access other users’ tasks
- **API Validation:** Checks and error handling throughout
- **Prepared Queries:** SQL Injection prevention

---

## 🧪 Manual Testing

- Sign up, login, and persistent sessions
- Create/edit/delete/toggle tasks
- 404 handling and form validation
- Docker Compose full lifecycle
- Mobile & desktop usability

---

## 🐳 Docker Quick Reference

docker compose up # Start (show logs)
docker compose up -d # Start in background
docker compose down # Stop all containers
docker compose build # Rebuild containers
docker compose logs # View service logs
docker compose restart # Restart containers

---

## 📱 Mobile Friendly

- Optimized for phones, tablets, and desktops.
- Responsive CSS, modal handling, and button sizing.

---

## 🚀 Future Improvements

- Task categories, priorities, deadlines
- Sharing/collaboration features
- Push notifications/email alerts
- API rate limiting/security hardening
- Automated tests and CI/CD
- PostgreSQL migration

---

## 👤 Author

**Anand Mankena **  
Full-Stack Developer  
August 2025

MIT License — Free for learning and development.

---

## ⭐ Acknowledgments

Thanks to React, Express, Docker, Nginx, and all open-source contributors!