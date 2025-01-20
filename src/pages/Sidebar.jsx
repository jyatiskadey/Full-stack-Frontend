// Sidebar.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "users") {
      navigate("/admin/users");
    } else if (tab === "posts") {
      navigate("/admin/posts");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <div className="w-64 bg-blue-600 text-white flex flex-col p-6">
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <button
        className={`w-full text-left py-2 px-4 mb-4 rounded ${activeTab === "users" ? "bg-blue-800" : "hover:bg-blue-700"}`}
        onClick={() => handleTabChange("users")}
      >
        Users
      </button>
      <button
        className={`w-full text-left py-2 px-4 mb-4 rounded ${activeTab === "posts" ? "bg-blue-800" : "hover:bg-blue-700"}`}
        onClick={() => handleTabChange("posts")}
      >
        User Posts
      </button>
      <button
        className="w-full text-left py-2 px-4 mt-auto bg-red-500 hover:bg-red-600 rounded"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
