import axios from "axios";

const API_URL = "http://localhost:5000/tasks";

export const getTasks = async (user_id) => {
  const response = await fetch(
    `http://localhost:5000/tasks?user_id=${user_id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
};

// Fetch a single task by ID
export const getTaskById = async (id) => {
  const response = await fetch(`http://localhost:5000/tasks/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch task");
  }
  return response.json();
};

export const addTask = async (task, userId) => {
  try {
    const response = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...task, user_id: userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to add task");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding task:", error);
    return null;
  }
};

export const updateTask = async (id, updatedTask) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedTask);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(`Error updating task with id ${id}:`, error);
    return null;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting task with id ${id}:`, error);
    return null;
  }
};
