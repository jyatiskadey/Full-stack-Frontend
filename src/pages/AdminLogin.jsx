import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:9874/api/posts/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        toast.success("Login successful!");
        navigate("/admin/dashboard");
      } else {
        setErrorMessage(data.message || "Login failed. Please try again.");
        toast.error(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred during login. Please try again.");
      toast.error("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md transform transition-all duration-500 hover:scale-105">
        <div className="flex justify-center mb-6">
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Admin Login
        </h2>

        {errorMessage && (
          <div className="bg-red-100 text-red-800 border border-red-500 rounded p-2 mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-600 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-600 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-gradient-to-l hover:from-indigo-600 hover:to-blue-500 transition duration-300"
          >
            Admin Login
          </button>
        </form>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
          >
            User Login
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLoginPage;