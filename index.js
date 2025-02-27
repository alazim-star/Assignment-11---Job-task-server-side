const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware (CORS & JSON parsing)
app.use(express.json()); // JSON parsing middleware

// ✅ Allow CORS (Fixed)
const corsOptions = {
  origin: ["https://assignment-11--job-task.web.app", "http://localhost:5173"], // Allow specific origins
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  credentials: true, // Allow cookies & authorization headers
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight requests handling



app.use(cors({
  origin:['http://localhost:5173','https://assignment-11--job-task.web.app'],
  credentials:true
}))
 
app.use(express.json())
  // ✅ Root API
  app.get("/", (req, res) => {
    res.send("🚀 Job Task API is Running");
  });






// ✅ MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9e2ji.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    // console.log("✅ Connected to MongoDB");

    const usersCollection = client.db("JobTasksDB").collection("users");
    const allTasksCollection = client.db("JobTasksDB").collection("allTasks");

    // ✅ Middleware: Verify JWT Token
    const verifyToken = (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).send({ message: "Unauthorized Access" });
      }

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "Forbidden Access" });
        }
        req.decoded = decoded;
        next();
      });
    };

  

    // ✅ Generate JWT Token
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "12h",
      });
      res.send({ token });
    });

    // ✅ Logout (Clear JWT Cookie)
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // ✅ Get All Users
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    // ✅ Get Single User By Email
    app.get("/users/:email", async (req, res) => {
      const user = await usersCollection.findOne({ email: req.params.email });
      res.send(user);
    });

    // ✅ Add User
    app.post("/users", async (req, res) => {
      const user = req.body;
      const existingUser = await usersCollection.findOne({ email: user.email });

      if (existingUser) {
        return res.status(400).send({ message: "User already exists" });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // ✅ Delete User
    app.delete("/users/:id", async (req, res) => {
      const result = await usersCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // ✅ Get All Tasks
    app.get("/allTasks", async (req, res) => {
      const tasks = await allTasksCollection.find().toArray();
      res.send(tasks);
    });

    // ✅ Get tasks by email
    app.get("/allTasks/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await allTasksCollection.find(query).toArray();
      res.send(result);
    });

    // ✅ Add New Task
    app.post("/allTasks", async (req, res) => {
      const task = req.body;
      const result = await allTasksCollection.insertOne(task);
      res.send(result);
    });

    // ✅ Update Task (Drag & Drop)
    app.put("/allTasks/:taskId", async (req, res) => {
      try {
        const { taskId } = req.params;
        const updatedTask = req.body;

        // Ensure _id is not included in update
        delete updatedTask._id;

        if (!ObjectId.isValid(taskId)) {
          return res.status(400).send({ message: "Invalid taskId" });
        }

        const taskObjectId = new ObjectId(taskId);
        const result = await allTasksCollection.updateOne(
          { _id: taskObjectId },
          { $set: updatedTask }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).send({ message: "Task not found or no changes made" });
        }

        res.send({ success: true, message: "Task updated successfully", result });
      } catch (error) {
        console.error("Task update error:", error);
        res.status(500).send({ success: false, message: "Failed to update task" });
      }
    });

    // ✅ Update Task by ID (Edit Task)
    app.put("/allTasks/edit/:id", async (req, res) => {
      const { id } = req.params;
      const { title, description, completionDate, completionTime } = req.body;

      try {
        const result = await allTasksCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: { title, description, completionDate, completionTime },
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({ message: "Task updated successfully" });
      } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // ✅ Delete Task
    app.delete("/allTasks/:id", async (req, res) => {
      const result = await allTasksCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // ✅ Start Server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port: ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);
