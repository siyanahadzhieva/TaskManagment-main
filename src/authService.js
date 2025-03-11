import axios from "axios";

const API_URL = "http://localhost:5000/auth";

// Register User
export const signUp = async (
  firstName,
  lastName,
  email,
  password,
  birthday
) => {
  const response = await axios.post(`${API_URL}/register`, {
    firstName,
    lastName,
    email,
    password,
    birthday,
  });
  return response.data;
};

// Login User
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  localStorage.setItem("token", response.data.token); // Store token
  localStorage.setItem("userId", response.data.userId); // Store user ID
  const profilePicResponse = await axios.get(
    `http://localhost:5000/auth/profile-picture/${response.data.userId}`
  );
  if (profilePicResponse.data.profilePicUrl) {
    localStorage.setItem("profilePic", profilePicResponse.data.profilePicUrl);
  }

  return response.data;
};

// Logout User
// src/authService.js
export const logout = (setUser) => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("profilePic"); // Remove profile picture
  setUser(null);
  window.location.href = "/login"; // Redirect to login page
};
