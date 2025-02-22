const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion} = require('mongodb');
const { ObjectId } = require('mongodb');
const PORT = process.env.PORT || 5000;




// Middleware
app.use(cors());
app.use(express.json());

//Root API
app.get('/', (req, res) => {
  res.send('Job Task API is Running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`CIRCLE is running:${PORT}`);
});



// MongoDB Connection
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
    await client.connect();
    const usersCollection = client.db('JobTasksDB').collection('users');
    const allTasksCollection = client.db('JobTasksDB').collection('allTasks');

    // Middleware: Verify JWT Token
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'Unauthorized Access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'Unauthorized Access' });
        }
        req.decoded = decoded;
        next();
      });
    };

    //Generate JWT Token
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '12h' });
      res.send({ token });
    });

    // Logout (Clear JWT Cookie)
    app.post('/logout', (req, res) => {
      res
        .clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true });
    });

    // Get All Users
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    //  Get Single User By Email
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    //  Add User
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'User already exists', insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Delete User
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Get All Tasks
    app.get('/allTasks', async (req, res) => {
      const result = await allTasksCollection.find().toArray();
      res.send(result);
    });

    // Get User's Tasks by Email
    app.get('/allTasks/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await allTasksCollection.find(query).toArray();
      res.send(result);
    });

    // Add New Task
    app.post('/allTasks', async (req, res) => {
      const newTask = { ...req.body, category: 'todo' };
      const result = await allTasksCollection.insertOne(newTask);
      res.send(result);
    });

    // Update Task Title or Category (For Drag & Drop)
    app.put("/allTasks/:id", async (req, res) => {
      const { id } = req.params;
      const updatedTask = req.body;
      delete updatedTask._id;
          const result = await allTasksCollection.updateOne(
              { _id: new ObjectId(id) },  
              { $set: updatedTask }    
          );
          res.send(result);
  
  });
  

    // Delete Task
    app.delete('/allTasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allTasksCollection.deleteOne(query);
      res.send(result);
    });




    //Confirm Connection
    await client.db('admin').command({ ping: 1 });
 // Send a ping to confirm a successful connection
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);

