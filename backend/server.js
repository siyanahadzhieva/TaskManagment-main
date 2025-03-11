require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mysql = require("mysql2/promise"); // ✅ Using mysql2 with promises
const profileRoutes = require("../src/routes/profileRoutes");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Create MySQL Connection Pool (Better for Performance)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db; // ✅ Export the database pool

// Middleware
app.use(express.json());
app.use(cors()); // Allow all origins for testing
app.use("/auth", require("../src/routes/authRoutes.js")); // Adjust path if needed
app.use("/auth", profileRoutes);
app.use("/backend/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Manually handle CORS preflight requests
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

// ✅ Sample route to test API
app.get("/", (req, res) => {
  res.send("Task Manager API is running!");
});

// ✅ Route to fetch all tasks (Using async/await)
app.get("/tasks", async (req, res) => {
  const { user_id } = req.query; // Get user_id from query params

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const [tasks] = await db.query("SELECT * FROM tasks WHERE user_id = ?", [
      user_id,
    ]);
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Route to create a new task
app.post("/tasks", async (req, res) => {
  const { title, description, status_id, priority_id, user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO tasks (title, description, status_id, priority_id, user_id) VALUES (?, ?, ?, ?, ?)",
      [title, description, status_id || 1, priority_id || 7, user_id]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      status_id: status_id || 1,
      priority_id: priority_id || 7,
      user_id,
    });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Route to fetch a task by ID
app.get("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [task] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);

    if (task.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task[0]); // Send the task
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Route to update a task by ID
app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status_id, priority_id } = req.body;

  if (!title || !status_id) {
    return res.status(400).json({ error: "Title and status ID are required" });
  }

  try {
    const [result] = await db.query(
      "UPDATE tasks SET title = ?, description = ?, status_id = ?, priority_id = ? WHERE id = ?",
      [title, description, status_id, priority_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task updated successfully" });
  } catch (err) {
    console.error(`Error updating task with id ${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Route to delete a task by ID
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM tasks WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
