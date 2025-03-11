import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TaskList from "./components/TaskList";
import TaskDetails from "./components/TaskDetails";
import AuthPage from "./components/AuthPage";
import { getTasks, addTask } from "./services/taskService";
import UserSettings from "./pages/UserSettings";
import AllTasks from "./pages/AllTasks"; // Import AllTasks page
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle"; // Import ThemeToggle
import { jwtDecode } from "jwt-decode";
import NotificationIcon from "./components/icons/NotificationIcon"; // Import NotificationIcon

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      try {
        const response = await fetch(
          `http://localhost:5000/tasks?user_id=${user.id}`
        );

        const fetchedTasks = await response.json();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [user]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        const res = await fetch(
          `http://localhost:5000/auth/profile-picture/${userId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        if (data.profilePicUrl) {
          setProfilePictureUrl(data.profilePicUrl);
        }
        if (data.firstName && data.lastName) {
          setFirstName(data.firstName);
          setLastName(data.lastName);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const handleAddTask = async (newTask) => {
    if (!user) return;

    try {
      const createdTask = await addTask(newTask, user.id);
      if (createdTask) {
        setTasks((prevTasks) => [...prevTasks, createdTask]);
      } else {
        console.error("Task was not added to the database.");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <Router>
      <div className="flex h-screen w-full bg-white-100 text-gray-900">
        {!user ? (
          <Routes>
            <Route
              path="/login"
              element={<AuthPage isLogin={true} setUser={setUser} />}
            />
            <Route
              path="/signup"
              element={<AuthPage isLogin={false} setUser={setUser} />}
            />
            <Route
              path="*"
              element={<AuthPage isLogin={true} setUser={setUser} />}
            />
          </Routes>
        ) : (
          <div className="flex w-full h-full">
            <Sidebar setUser={setUser} />
            <div className="flex-1 flex flex-col">
              <div className="flex justify-end items-center p-4 pr-8">
                <Link to="/" className="mr-5">
                  <NotificationIcon color="var(--icon-color)" />
                </Link>
                <Link to="/settings" className="flex items-center">
                  <div className="w-12 h-12">
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-500 rounded-full">
                        No Image
                      </div>
                    )}
                  </div>
                </Link>
              </div>
              <div className="flex-1 flex justify-start items-top mt-[10px] mb-20 p-8">
                <div
                  className="w-full h-full rounded-2xl shadow-lg p-6"
                  style={{
                    backgroundColor: "var(--dashboard-bg-color)",
                    color: "var(--dashboard-text-color)",
                  }}
                >
                  {user && (
                    <h1 className="text-2xl font-bold">
                      Welcome, {user.firstName} {user.lastName}!
                    </h1>
                  )}
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <TaskList
                          tasks={tasks}
                          addTask={handleAddTask}
                          user={user}
                        />
                      }
                    />
                    <Route path="/task/:id" element={<TaskDetails />} />
                    <Route path="/settings" element={<UserSettings />} />
                    <Route
                      path="/all-tasks"
                      element={<AllTasks user={user} />}
                    />
                  </Routes>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ThemeToggle />
    </Router>
  );
}

export default App;
