const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../../backend/server.js");
const authenticateUser = require("../middleware/authMiddleware.js");

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MTExNDYzNSwiZXhwIjoxNzQxMTE4MjM1fQ.rh8mrHJGxiYsYIhVjW40gCjnBE7PYfuT6B1DMzKghoE"; // Move secret key to .env

router.get("/", (req, res) => {
  res.send("Auth routes working!");
});

// ✅ User Registration
router.post(
  "/register",
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password too short"),
    body("birthday").notEmpty().withMessage("Birthday is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, birthday } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    try {
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (rows.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }
      console.log(req.body);

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        "INSERT INTO users (first_name, last_name, email, password_hash, birthday) VALUES (?, ?, ?, ?, ?)",
        [firstName, lastName, email, hashedPassword, birthday]
      );

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ✅ User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        birthday: user.birthday,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Update Email Route
router.put("/update-email", authenticateUser, async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.user.id;

  console.log("New Email:", newEmail);
  console.log("Decoded Token:", req.user); // Debug log

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    console.log(`Updating email for user ${userId} to ${newEmail}`);

    const [result] = await db.query("UPDATE users SET email = ? WHERE id = ?", [
      newEmail,
      userId,
    ]);

    console.log("DB Update Result:", result);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Email update failed" });
    }

    res.json({ message: "Email updated successfully" });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Update Password Route
router.put("/update-password", authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [user] = await db.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user[0].password_hash
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;
