const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const verified = jwt.verify(token.split(" ")[1], JWT_SECRET);

    if (!verified || !verified.userId) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    req.user = { id: verified.userId }; // Ensure req.user.id is set
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = authenticateUser;
