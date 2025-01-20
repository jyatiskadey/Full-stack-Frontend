import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import Switch from "react-switch";

const AdminPanelWithSidebar = () => {
  

  const [activeUsers, setActiveUsers] = useState([]); // State for storing active users
  const [formData, setFormData] = useState({ recipient: "", message: "" }); // State for form data

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  // const [messageData, setMessageData] = useState({
  //   subject: '',
  //   message: '',
  //   category: 'General',
  // });
  const toggleMsg = () => {
    setIsMessageModalOpen(!isMessageModalOpen);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // States for Posts Pagination
  const [postCurrentPage, setPostCurrentPage] = useState(1);
  const [postTotalPages, setPostTotalPages] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'ascending' });
  // const [users, setUsers] = useState([]);
const [messageData, setMessageData] = useState({ recipient: "", message: "" });

  const [errorMessage, setErrorMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
  });

  const [isMessageWindowOpen, setIsMessageWindowOpen] = useState(false); // Track window visibility
  const [allMessages, setAllMessages] = useState([]); // Store all messages
  // Sample message data

  const toggleMessageWindow = () => {
    setIsMessageWindowOpen(!isMessageWindowOpen);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const downloadPDF = async () => {
    const doc = new jsPDF();
    doc.text("User Posts", 14, 16);

    const allPosts = await fetchAllPosts(searchTerm, sortConfig.key, sortConfig.direction);

    const tableColumn = [
      "Post Title",
      "Post Description",
      "Author",
      "Created Date",
      "Updated Date",
    ];
    const tableRows = allPosts.map((post) => [
      post.title,
      post.description,
      post.userName,
      new Date(post.createdAt).toLocaleDateString(),
      new Date(post.updatedAt).toLocaleDateString(),
    ]);

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save("user_posts.pdf");
  };

  const fetchAllPosts = async (searchTerm = "", sortField = sortConfig.key, sortOrder = sortConfig.direction) => {
    let allPosts = [];
    let page = 1;
    let totalPages = 1;

    try {
      do {
        const response = await axios.get(
          `http://localhost:9874/api/posts/getallposts?page=${page}&limit=5&searchTerm=${searchTerm}&sortField=${sortField}&sortOrder=${sortOrder}`
        );
        allPosts = allPosts.concat(response.data.posts);
        totalPages = response.data.totalPages;
        page++;
      } while (page <= totalPages);
    } catch (error) {
      console.error("Error fetching all posts:", error);
    }

    return allPosts;
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      // Send DELETE request to the backend to delete the notification
      const response = await axios.delete(`http://localhost:9874/api/posts/notifications/${notificationId}`);
      
      // Check if the notification was deleted successfully
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Notification Deleted Successfully!',
          text: 'The notification has been deleted.',
          confirmButtonText: 'Great!',
        });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert('Failed to delete notification');
    }
  };
  
  const fetchActiveUsers = async () => {
    try {
      const response = await fetch("http://localhost:9874/api/posts/active-user");
      if (!response.ok) {
        throw new Error("Failed to fetch active users");
      }
      const data = await response.json();
      setActiveUsers(data); // Update state with fetched users
    } catch (error) {
      console.error("Error fetching active users:", error);
    }
  };
  useEffect(() => {
    // Define a function to fetch messages
    const fetchMessages = async () => {
      try {
        // Make API call to your backend
        const response = await axios.get("http://localhost:9874/api/posts/get-all-msg"); // Replace USER_ID with the logged-in user's ID or use dynamic data

        // Assuming the response has a 'messages' field
        setAllMessages(response.data.messages);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to fetch messages");
        setIsLoading(false);
      }
    };

    // Call the function to fetch messages
    fetchMessages();
  }, []);
  useEffect(() => {
    if (isMessageModalOpen) {
      fetchActiveUsers();
    }
  }, [isMessageModalOpen]);
  const handleInputChangeee = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

   // Handle messeagea submission
   const handleSubmittt = async (e) => {
    e.preventDefault();
    
    const { recipient, message } = formData;
  
    // Ensure recipient and message are not empty
    if (!recipient || !message) {
      alert("Please fill in all fields.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:9874/api/posts/send-msg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: recipient, // Sending the recipient's ID
          message,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Message Sent Successfully!',
          text: 'Your message has been sent without issues.',
          confirmButtonText: 'Great!',
        });
        toggleMsg(); // Close or reset the form/modal
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Send the Message',
          text: data.message || 'Something went wrong. Please try again.',
          confirmButtonText: 'Okay',
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message. Please try again.");
    }
  };
  
  
  const fetchUsers = async (page = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:9874/api/posts/getallusers?page=${page}&limit=${usersPerPage}&searchTerm=${searchTerm}`
      );
      setUsers(response.data.users);
      setTotalPages(Math.ceil(response.data.totalUsers / usersPerPage));
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    const allPosts = await fetchAllPosts(searchTerm, sortConfig.key, sortConfig.direction);

    const worksheet = XLSX.utils.json_to_sheet(
      allPosts.map((post) => ({
        "Post Title": post.title,
        "Post Description": post.description,
        Author: post.userName,
        "Created Date": new Date(post.createdAt).toLocaleDateString(),
        "Updated Date": new Date(post.updatedAt).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Posts");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, 'user_posts.xlsx');
  };

  const downloadCSV = async () => {
    const allPosts = await fetchAllPosts(searchTerm, sortConfig.key, sortConfig.direction);

    const csvData = Papa.unparse(
      allPosts.map((post) => ({
        "Post Title": post.title,
        "Post Description": post.description,
        Author: post.userName,
        "Created Date": new Date(post.createdAt).toLocaleDateString(),
        "Updated Date": new Date(post.updatedAt).toLocaleDateString(),
      }))
    );

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, 'user_posts.csv');
  };

  const fetchPosts = async (page = 1, searchTerm = "", sortField = sortConfig.key, sortOrder = sortConfig.direction) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:9874/api/posts/getallposts?page=${page}&limit=5&searchTerm=${searchTerm}&sortField=${sortField}&sortOrder=${sortOrder}`
      );
      setPosts(response.data.posts);
      setPostTotalPages(response.data.totalPages);
      setPostCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === "users") {
      fetchUsers(1, searchTerm);
    } else if (activeTab === "posts") {
      fetchPosts(1, searchTerm, sortConfig.key, sortConfig.direction);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers(currentPage, searchTerm);
    } else if (activeTab === "posts") {
      fetchPosts(postCurrentPage, searchTerm, sortConfig.key, sortConfig.direction);
    }
  }, [currentPage, postCurrentPage, searchTerm, activeTab]);

  const toggleUserStatus = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:9874/api/posts/${userId}/toggle-status`,
        { method: "PUT", headers: { "Content-Type": "application/json" } }
      );

      const data = await response.json();

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isActive: data.isActive } : user
          )
        );
      } else {
        setErrorMessage(data.message || "Failed to toggle user status.");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      setErrorMessage("An unexpected error occurred.");
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "users") {
      fetchUsers();
    } else if (tab === "posts") {
      fetchPosts();
    }
  };

  const handlePageChange = (newPage) => {
    if (activeTab === "users" && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchUsers(newPage, searchTerm);
    } else if (activeTab === "posts" && newPage >= 1 && newPage <= postTotalPages) {
      setPostCurrentPage(newPage);
      fetchPosts(newPage, searchTerm, sortConfig.key, sortConfig.direction);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asce') {
        return <FaSortUp />;
      } else {
        return <FaSortDown />;
      }
    } else {
      return <FaSort />;
    }
  };
  // Handle notification form submission
   // Handle notification submission with SweetAlert2
   const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:9874/api/posts/create-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Notification Created!',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        setIsModalOpen(false); // Close the modal
        fetchNotifications(); // Refresh the notifications list
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.error || 'Error creating notification.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error("Error submitting notification:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Error submitting notification.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleSort = (key) => {
    let direction = 'asce';
    if (sortConfig.key === key && sortConfig.direction === 'asce') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    fetchPosts(1, searchTerm, key, direction);
  };
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  const handleInputChangee = (e) => {
    const { name, value } = e.target;
    setNotificationData({ ...notificationData, [name]: value });
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:9874/api/posts/get-all-notification");
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:9874/api/posts/send-msg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData), // Send the form data
      });
  
      if (response.ok) {
        const result = await response.json();
      
        Swal.fire({
          icon: 'success',
          title: 'Message Sent Successfully!',
          text: 'Your message has been delivered.',
          confirmButtonText: 'OK',
        }).then(() => {
          toggleMsg(); // Close the modal after the alert is dismissed
        });
      }
      
      else {
        alert("Failed to send the message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white flex flex-col p-6">
  <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
  <button
    className={`w-full text-left py-2 px-4 mb-4 rounded ${
      activeTab === "users" ? "bg-blue-800" : "hover:bg-blue-700"
    }`}
    onClick={() => handleTabChange("users")}
  >
    Users
  </button>
  <button
    className={`w-full text-left py-2 px-4 mb-4 rounded ${
      activeTab === "posts" ? "bg-blue-800" : "hover:bg-blue-700"
    }`}
    onClick={() => handleTabChange("posts")}
  >
    User Posts
  </button>
  <button
    className={`w-full text-left py-2 px-4 mb-4 rounded ${
      activeTab === "notifications" ? "bg-blue-800" : "hover:bg-blue-700"
    }`}
    onClick={() => handleTabChange("notifications")}
  >
    Create Notification
  </button>


  <button
    className="w-full text-left py-2 px-4 mt-auto bg-red-500 hover:bg-red-600 rounded"
    onClick={handleLogout}
  >
    Logout
  </button>
</div>


      {/* Main Content */}
      <div className="flex-1 p-6">
      {activeTab === "users" && (
  <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
    {/* Title */}
    <h2 className="text-3xl font-extrabold text-gray-800">Users</h2>

    {/* Search Bar */}
    <div className="flex items-center w-full max-w-md">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by author..."
        className="flex-grow border border-gray-300 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-5 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Search
      </button>
    </div>

    {/* Users Table */}
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            <th className="px-4 py-3 text-sm font-medium text-gray-700">Name</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-700">Email</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-700 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user._id}
              className={`border-b border-gray-200 ${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <td className="px-4 py-3">{user.name}</td>
              <td className="px-4 py-3">{user.email}</td>
              <div className="flex items-center">
      <Switch
        checked={user.isActive}
        onChange={() => toggleUserStatus(user._id)}
        onColor="#22c55e" // Green color
        offColor="#ef4444" // Red color
        uncheckedIcon={false} // Removes "off" text
        checkedIcon={false} // Removes "on" text
        handleDiameter={20} // Diameter of the toggle button
        height={24} // Height of the switch
        width={48} // Width of the switch
      />
      <span className="ml-2 text-sm font-medium">
        {user.isActive ? "Active" : "Inactive"}
      </span>
    </div>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="p-4 text-center text-gray-500">No users found.</p>
      )}
    </div>

    {/* Pagination Controls */}
    <div className="flex justify-center items-center space-x-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
)}


{activeTab === "posts" && (
  <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
    {/* Title */}
    <h2 className="text-3xl font-extrabold text-gray-800">User Posts</h2>

    {/* Action Buttons */}
    <div className="flex flex-wrap gap-4">
      <button
        onClick={downloadPDF}
        className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Download PDF
      </button>
      <button
        onClick={downloadExcel}
        className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Download Excel
      </button>
      <button
        onClick={downloadCSV}
        className="bg-yellow-600 text-white px-5 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        Download CSV
      </button>
    </div>

    {/* Search Bar */}
    <div className="flex items-center w-full max-w-md">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by title or description..."
        className="flex-grow border border-gray-300 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-5 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Search
      </button>
    </div>

    {/* Posts Table */}
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            {[
              { name: "Post Title", key: "title" },
              { name: "Description", key: "description" },
              { name: "Author", key: "userName" },
              { name: "Created Date", key: "createdAt" },
              { name: "Updated Date", key: "updatedAt" },
            ].map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key)}
                className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
              >
                {column.name} {getSortIcon(column.key)}
              </th>
            ))}
            <th className="px-4 py-3 text-sm font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => (
            <tr
              key={post._id}
              className={`border-b border-gray-200 ${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <td className="px-4 py-3">{post.title}</td>
              <td className="px-4 py-3">{post.description}</td>
              <td className="px-4 py-3">{post.userName}</td>
              <td className="px-4 py-3 text-center">
                {new Date(post.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-center">
                {new Date(post.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => (window.location.href = `/post/${post._id}`)}
                >
                  View Post
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {posts.length === 0 && (
        <p className="p-4 text-center text-gray-500">No posts available.</p>
      )}
    </div>

    {/* Pagination Controls */}
    <div className="flex justify-center items-center space-x-4">
      <button
        onClick={() => handlePageChange(postCurrentPage - 1)}
        disabled={postCurrentPage === 1}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm text-gray-700">
        Page {postCurrentPage} of {postTotalPages}
      </span>
      <button
        onClick={() => handlePageChange(postCurrentPage + 1)}
        disabled={postCurrentPage === postTotalPages}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
)}


{activeTab === "notifications" && (
  <div className="flex flex-col h-screen bg-gray-100">
    {/* Header with Buttons */}
    <header className="flex-none bg-white shadow p-4">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">All Notifications</h1>
        <div className="space-x-4">
          <button
            onClick={toggleModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow transition-all"
          >
            Create Notification
          </button>
          <button
            onClick={toggleMsg}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow transition-all"
          >
            Create Message
          </button>
          <button
        onClick={toggleMessageWindow}
        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 shadow transition-all"
      >
        View All Messages
      </button>

        </div>
      </div>
    </header>

    {/* Notifications List */}
    <main className="flex-grow overflow-y-auto px-4 py-6 max-w-6xl mx-auto">
      {notifications.length > 0 ? (
        <div className="space-y-6">
          {notifications.map((notification, index) => (
            <div
              key={notification._id}
              className="relative bg-white border border-gray-200 rounded-lg p-6 shadow hover:shadow-lg transition duration-300"
            >
              {/* Delete Icon */}
              <button
                onClick={() => handleDeleteNotification(notification._id)}
                className="absolute top-4 right-4 text-red-600 hover:text-red-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Notification Content */}
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-semibold">
                  {index + 1}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600">{notification.message}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>Posted on: {new Date(notification.createdAt).toLocaleDateString()}</span>
                    <span className="ml-4">{notification.viewCount} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center">No notifications available.</p>
      )}
    </main>

    {/* Create Notification Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Create Notification</h2>
          <form onSubmit={handleNotificationSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={notificationData.title}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter notification title"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={notificationData.message}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter notification message"
                rows="4"
                required
              ></textarea>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={toggleModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Create Message Modal */}
    {isMessageModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
          <h3 className="text-xl font-bold text-gray-700 mb-4">Create New Message</h3>
          <form onSubmit={handleSubmittt}>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChangeee}
                className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter your message"
                rows="4"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
                Recipient
              </label>
              <select
                id="recipient"
                name="recipient"
                value={formData.recipient}
                onChange={handleInputChangeee}
                className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="" disabled>Select a user</option>
                {activeUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Send
              </button>
              <button
                type="button"
                onClick={toggleMsg}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

{isMessageWindowOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-700 mb-4">All Messages</h3>
            
            {/* List of messages */}
            <div className="space-y-4">
              {allMessages.length > 0 ? (
                allMessages.map((message) => (
                  <div key={message._id} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-gray-800">{message.name.name}</h4> {/* Sender's name */}
                    <p className="text-gray-600">{message.message}</p> {/* Message content */}
                    <p className="text-sm text-gray-500">{new Date(message.createdAt).toLocaleString()}</p> {/* Date */}
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No messages found.</p>
              )}
            </div>
    
            {/* Close Button */}
            <button
              onClick={toggleMessageWindow}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
  </div>
)}





      </div>
    </div>
  );
};

export default AdminPanelWithSidebar;