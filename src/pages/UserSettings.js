import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const UserSettings = () => {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfilePicture = async () => {
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
        console.log("Fetched profile picture URL:", data.profilePicUrl); // Log here
        if (data.profilePicUrl) {
          setProfilePictureUrl(data.profilePicUrl);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePicture();
  }, [token]);

  // ✅ Handle Profile Picture Change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file)); // Show image preview before upload
    }
  };

  // ✅ Handle Profile Picture Upload
  const handleProfilePictureUpload = async () => {
    if (!profilePicture) {
      setMessage("Please select a profile picture.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", profilePicture);

    try {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken); // Check the structure

      const userId = decodedToken.userId; // Use the correct key here for user ID

      if (!userId) {
        setMessage("User ID not found.");
        return;
      }

      formData.append("user_id", userId);

      const res = await fetch(
        "http://localhost:5000/auth/upload-profile-picture",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      setMessage(data.message);

      if (data.profilePictureUrl) {
        setProfilePictureUrl(data.profilePictureUrl); // ✅ Update state to reflect change
      }
    } catch (error) {
      setMessage("Error uploading profile picture.");
    }
  };

  // ✅ Handle Email Update
  const handleEmailUpdate = async () => {
    try {
      const res = await fetch("http://localhost:5000/auth/update-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Error updating email");
    }
  };

  // ✅ Handle Password Update
  const handlePasswordUpdate = async () => {
    try {
      const res = await fetch("http://localhost:5000/auth/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Error updating password");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">User Settings</h1>
      <p className="text-gray-600 mt-2">Modify your user information here.</p>

      {/* ✅ Profile Picture Upload */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Profile Picture</h2>
        <div className="mt-2 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border">
            {preview ? (
              <img
                src={preview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                No Image
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={handleProfilePictureChange}
          />
          <button
            onClick={handleProfilePictureUpload}
            className="mt-2 bg-purple-600 text-white px-4 py-2 rounded"
          >
            Upload Picture
          </button>
        </div>
      </div>

      {/* ✅ Update Email */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Change Email</h2>
        <input
          type="email"
          className="border p-2 w-full mt-2"
          placeholder="Enter new email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <button
          onClick={handleEmailUpdate}
          className="mt-2 bg-purple-600 text-white px-4 py-2 rounded"
        >
          Update Email
        </button>
      </div>

      {/* ✅ Update Password */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <input
          type="password"
          className="border p-2 w-full mt-2"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          className="border p-2 w-full mt-2"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          onClick={handlePasswordUpdate}
          className="mt-2 bg-purple-600 text-white px-4 py-2 rounded"
        >
          Update Password
        </button>
      </div>

      {message && <p className="text-green-600 mt-4">{message}</p>}
    </div>
  );
};

export default UserSettings;
