TeamTask

A team task management app where users can create, assign and track tasks, and get real-time notifications when something changes.

Live app: https://teamtask-system-ashishteam1.vercel.app Repository: https://github.com/javaASH/TeamtaskSystem

The backend runs on a free hosting tier. The first request after a period of inactivity can take 30 to 60 seconds, so please wait on the first login.

Demo Login
Role	Email	Password
Admin	raishubham8361@gmail.com	subhamrai4444

You can also register a new account from the sign-up page (new accounts get the user role).

Features
Authentication (register / login) with role-based access (admin and user)
Dashboard with counts for Assigned to me, Created by me and Overdue tasks
Create, edit and assign tasks with priority (low, medium, high) and status (todo, in-progress, done)
My tasks, Created by me and All tasks views
Calendar view of tasks by due date
Search tasks by name or description
Real-time notifications using Socket.IO
Admin panel for managing users and tasks
Settings page
Tech Stack

Frontend

Next.js
Deployed on Vercel

Backend

Node.js and Express (controller-based structure)
MongoDB with Mongoose
Socket.IO for real-time notifications
JWT for authentication
Deployed on Render

Database

MongoDB Atlas
Project Structure
TeamtaskSystem/
├── frontend/            # Next.js app
└── backend/
    └── src/
        ├── config/      # Database connection
        ├── controllers/ # Request handling logic
        ├── models/      # Mongoose schemas
        ├── routes/      # Express routes
        ├── app.js       # Express app setup
        └── server.js    # Server and Socket.IO entry point
Getting Started (Local Setup)
Prerequisites
Node.js 18 or higher
A MongoDB Atlas cluster (or local MongoDB)
1. Clone the repository
bash
git clone https://github.com/javaASH/TeamtaskSystem.git
cd TeamtaskSystem
2. Backend
bash
cd backend
npm install

Create a .env file in the backend folder:

env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/teamtask?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

Start the server:

bash
npm start
3. Frontend
bash
cd frontend
npm install

Create a .env.local file in the frontend folder:

env
NEXT_PUBLIC_API_URL=http://localhost:5000

Start the app:

bash
npm run dev

Open http://localhost:3000

Real-Time Notifications

The backend uses Socket.IO. When a task is assigned to a user or updated, the server emits an event to that user and the notification bell in the navbar updates instantly without a page refresh.

Deployment
Frontend: Vercel (set NEXT_PUBLIC_API_URL to the backend URL)
Backend: Render (set MONGODB_URI, JWT_SECRET, FRONTEND_URL and NODE_ENV=production in the Environment tab)
Database: MongoDB Atlas (Network Access allows the hosting provider's IPs)
Author

Built by javaASH
