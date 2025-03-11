import React, { useState } from "react";
import { Link } from "react-router-dom";

const AuthPage = ({ isLogin, setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && (!firstName || !lastName || !email || !password)) {
      setError("All fields are required!");
      return;
    }

    const endpoint = isLogin
      ? "http://localhost:5000/auth/login"
      : "http://localhost:5000/auth/register";

    const userData = isLogin
      ? { email, password }
      : {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          birthday,
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Store token & user ID in local storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user); // ✅ Update state
      alert(isLogin ? "Login Successful!" : "Signup Successful!");
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex w-full h-screen">
      {/* Left Side */}
      <div className="w-3/5 bg-purple-200 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-purple-800">Welcome!</h1>
      </div>

      {/* Right Side - Form */}
      <div className="w-2/5 flex items-center justify-center bg-white">
        <div className="w-80 p-8 shadow-lg rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Hi, there</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="p-3 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="p-3 border rounded-md"
                />
                <input
                  type="date"
                  placeholder="Birthday"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required
                  className="p-3 border rounded-md"
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 border rounded-md"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 border rounded-md"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white p-3 rounded-md font-semibold hover:bg-purple-700"
            >
              {isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>
          <p className="mt-4 text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Link
              to={isLogin ? "/signup" : "/login"}
              className="text-purple-600 font-semibold"
            >
              {" "}
              {isLogin ? "Sign Up" : "Log In"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
