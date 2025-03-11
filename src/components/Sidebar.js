import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { logout } from "../authService";
import { jwtDecode } from "jwt-decode";

// Import SVG icon components
import HomeLineIcon from "./icons/HomeLineIcon";
import HomeFillIcon from "./icons/HomeFillIcon";
import TaskLineIcon from "./icons/TaskLineIcon";
import TaskFillIcon from "./icons/TaskFillIcon";

const Sidebar = ({ setUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfileData = async () => {
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
  }, [token]);

  return (
    <div className="bg-transparent text-white w-30 relative flex flex-col items-center py-4 pt-10 pl-5 pr-2">
      <div className="mb-6">
        <span
          className="text-xl text-bold mt-1"
          style={{ color: "var(--logo-color)" }}
        >
          Task.
        </span>
      </div>

      <nav className="flex flex-col space-y-6 mt-10">
        <NavLink
          to="/"
          className="flex flex-col items-center mb-5 w-7"
          activeClassName="text-black"
          isActive={(match, location) => location.pathname === "/"}
        >
          {({ isActive }) =>
            isActive ? (
              <HomeFillIcon color="var(--icon-color)" />
            ) : (
              <HomeLineIcon color="var(--icon-color)" />
            )
          }
        </NavLink>

        <NavLink
          to="/all-tasks"
          className="flex flex-col items-center mb-5"
          activeClassName="text-black"
          isActive={(match, location) => location.pathname === "/all-tasks"}
        >
          {({ isActive }) =>
            isActive ? (
              <TaskFillIcon color="var(--icon-color)" />
            ) : (
              <TaskLineIcon color="var(--icon-color)" />
            )
          }
        </NavLink>
      </nav>

      <div className="mt-auto flex flex-col items-center">
        <button
          onClick={() => logout(setUser)}
          className="flex flex-col items-center mt-5 mb-10"
        >
          <LogOut className="text-2xl" style={{ color: "var(--icon-color)" }} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
