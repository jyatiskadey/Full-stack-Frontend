import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!password || !passwordConfirmation) {
      toast.error("Both fields are required.");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Password and confirmation do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("https://social-media-backend-2-xdnp.onrender.com/api/posts/changepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password, passwordConfirmation }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password changed successfully!");
        setTimeout(() => {
          navigate("/profile"); 
        }, 2000); 
      } else {
        toast.error(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while changing your password.");
      console.error("Error changing password:", error);
    }
  };

  return (
    
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Enter new password"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="passwordConfirmation" className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirmation"
              name="passwordConfirmation"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Confirm new password"
              required
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>

      {/* Toast Container for displaying notifications */}
      <ToastContainer />
    </div>
  );
};

export default ChangePassword;
