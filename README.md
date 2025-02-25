# 🎓 CIRCLE – Task Management Platform (Server)

## 🚀 Overview
This is the **server-side** of the CIRCLE Task Management Platform. It handles authentication, database operations, and API endpoints for managing tasks.

## 🎯 Features
- 🔥 **RESTful API** for task management
- 🔑 **JWT-based Authentication**
- 🛢️ **MongoDB Database Integration**
- 🚀 **Optimized Backend Performance**
- 🔄 **Real-time Updates via WebSockets**

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT & Firebase
- **Real-time Sync:** WebSockets

## 📦 Installation
1. **Clone the repository**
   ```sh
   git clone https://github.com/alazim-star/Assignment-11---Job-task-server-side.git
   cd task-management-server
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up environment variables** (create a `.env` file)
   ```sh
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   FIREBASE_CONFIG=your_firebase_config
   ```

4. **Run the server**
   ```sh
   npm start
   ```

## 📡 API Endpoints
### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user details

### Task Management
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task


## 📜 License
This project is licensed under the **MIT License**.

## 🙌 Contributions
Contributions are welcome! Feel free to fork the repo and submit a pull request.

---

🚀 Happy Coding!
