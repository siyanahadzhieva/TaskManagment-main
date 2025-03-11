const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../../backend/db.js"); // Corrected import
const serverUrl = "http://localhost:5000"; // Change this to your actual server URL

const router = express.Router();
const fs = require("fs");

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files will be stored in "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({ storage });

// ✅ Upload Profile Picture Route
router.post(
  "/upload-profile-picture",
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const userId = req.body.user_id;
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const profilePictureUrl = `${serverUrl}/backend/uploads/${req.file.filename}`; // ✅ Fixed URL

      await db.query("UPDATE users SET profile_picture = ? WHERE id = ?", [
        profilePictureUrl,
        userId,
      ]);

      res.json({
        message: "Profile picture uploaded successfully",
        profilePictureUrl,
      });
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// ✅ Get User Profile Data
router.get("/profile-picture/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT profile_picture, first_name, last_name FROM users WHERE id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      profilePicUrl: rows[0].profile_picture,
      firstName: rows[0].first_name,
      lastName: rows[0].last_name,
    });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
