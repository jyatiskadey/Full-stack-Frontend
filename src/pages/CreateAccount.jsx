import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const CreateAccount = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate(); // To navigate to login page after success

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setStatus("");
    setIsUploading(true);
  
    // Validate passwords
    if (formData.password !== formData.passwordConfirmation) {
      setIsUploading(false);
  
      // Show SweetAlert for mismatched passwords
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Passwords do not match. Please try again.",
      });
  
      return;
    }
  
    try {
      // Submit account data to the backend
      const response = await fetch("https://social-media-backend-2-xdnp.onrender.com/api/posts/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage(data.message);
        setStatus("success");
  
        // Clear form fields
        setFormData({
          name: "",
          email: "",
          password: "",
          passwordConfirmation: "",
        });
  
        // Show success SweetAlert
        Swal.fire({
          icon: "success",
          title: "Account Created",
          text: "Your account has been created successfully! Redirecting to login...",
          timer: 2000, // Auto close after 2 seconds
          showConfirmButton: false,
        });
  
        // Redirect to login after SweetAlert
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(data.message);
        setStatus("error");
  
        // Show error SweetAlert for server response errors
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setMessage("An error occurred while registering. Please try again.");
      setStatus("error");
  
      // Show SweetAlert for unexpected errors
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: "An error occurred while registering. Please try again later.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md mt-48">
      <h2 className="text-2xl font-semibold text-center mb-4">Create Account</h2>
      {message && (
        <p
          className={`text-center mb-4 ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="passwordConfirmation"
            className="block text-sm font-medium"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="passwordConfirmation"
            name="passwordConfirmation"
            value={formData.passwordConfirmation}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="Confirm your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className={`w-full ${
            isUploading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          } text-white py-2 px-4 rounded-md`}
        >
          {isUploading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center mt-4">
        Already have an account?{" "}
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate("/login")}
        >
          Log in here
        </span>
      </p>
    </div>
  );
};

export default CreateAccount;
