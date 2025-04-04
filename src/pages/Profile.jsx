import {
  faBell,
  faEdit,
  faKey,
  faPlus,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { truncate } from "lodash";
const Profile = ({postId }) => {
  const [isPopUpVisible, setIsPopUpVisible] = useState(false); // Control pop-up visibility
  // const [userComments, setUserComments] = useState([]);
  const [visibleComments, setVisibleComments] = useState(5);

  const [userComments, setUserComments] = useState([]); // Renamed state to userComments
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false); // Renamed modal state

  const [commentTexts, setCommentTexts] = useState({});

  const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  // const [isNotificationsVisible, setIsNotificationsVisible] = useState(false); // State to control visibility of notifications
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [userNotifications, setUserNotifications] = useState([]);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
// const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage.");
      }

      const response = await fetch(
        "https://social-media-backend-2-xdnp.onrender.com/api/posts/get-user-specific-notification",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch messages: ${errorText}`);
      }

      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        setUserNotifications(data.messages);
      } else {
        setUserNotifications([]);
      }

      setLoading(false);
    } catch (error) {
      // console.error("Error fetching notifications:", error.message);
      setLoading(false);
    }
  };

  // Run fetchNotifications once on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const navigate = useNavigate();

  const handleNotificationsClick = () => {
    setIsNotificationsVisible(!isNotificationsVisible); // Toggle visibility
  };
  const notificationses = [
    "You have a new message.",
    "Your password was changed successfully.",
    "A new comment was posted on your profile.",
  ];

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Token is missing. Please log in again.");
          setLoading(false);
          return navigate("/login");
        }

        const response = await fetch(
          "https://social-media-backend-2-xdnp.onrender.com/api/posts/user-details",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        } else {
          setError(data.message || "Failed to fetch user details.");
          navigate("/login");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError("An error occurred while fetching user details.");
        setLoading(false);
        navigate("/login");
      }
    };

    fetchUserDetails();
  }, [navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://social-media-backend-2-xdnp.onrender.com/api/posts/get-all-notification"
        );
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleCommentChange = (e, postId) => {
    setCommentTexts((prev) => ({
      ...prev,
      [postId]: e.target.value, // Update the comment text for the specific post
    }));
  };

  const handleViewCommentsClick = (postId) => {
   setSelectedPostId(postId);
    fetchPostComments(postId); 
  };

  const handleViewAllComment = async (postId) => {
    setLoadingComments(true);
    setCommentsError(null);

    try {
      const response = await fetch(
        `https://social-media-backend-2-xdnp.onrender.com/api/posts/${postId}/Allcomments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setComments(data.comments); // Update state with comments and usernames
        setIsPopUpVisible(true); // Show the pop-up
      } else {
        setCommentsError(data.message || "Failed to fetch comments");
      }
    } catch (error) {
      setCommentsError("An error occurred while fetching comments");
      console.error(error);
    } finally {
      setLoadingComments(false); // Hide loading state
    }
  };

  // Function to handle comment edit
// Function to handle comment edit
const handleEditComment = (commentId, newCommentText) => {
  // Update the state of userComments with the new text
  setUserComments((prevComments) =>
    prevComments.map((comment) =>
      comment._id === commentId
        ? { ...comment, text: newCommentText }
        : comment
    )
  );
};

const handleUpdateComment = async (postId, commentId) => {
  const updatedComment = userComments.find((comment) => comment._id === commentId);

  if (!updatedComment) {
    alert("Comment not found.");
    return;
  }

  // Ensure the comment text is not empty or just spaces
  if (!updatedComment.text.trim()) {
    alert("Comment text cannot be empty.");
    return;
  }

  try {
    // Sending the updated comment to the server
    const response = await fetch(
      `https://social-media-backend-2-xdnp.onrender.com/api/posts/${postId}/comments/${commentId}/UpdateComment`, // Ensure postId and commentId are correct
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is available
        },
        body: JSON.stringify({ text: updatedComment.text }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
    title: "Success!",
    text: "Comment updated successfully!",
    icon: "success",
    confirmButtonText: "OK",
    confirmButtonColor: "#3085d6",
  });

      setUserComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId ? { ...comment, text: updatedComment.text } : comment
        )
      );
    } else {
      // Handle error returned from the server
      alert(data.message || "Failed to update comment.");
    }
  } catch (error) {
    console.error("Error updating comment:", error);
    alert("An error occurred while updating the comment.");
  }
};


  


  

  
  const fetchPostComments = async (postId) => {
    try {
      const response = await fetch(
        `https://social-media-backend-2-xdnp.onrender.com/api/posts/${postId}/comments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setUserComments(data.comments); // Correctly update the state
        setIsCommentsModalOpen(true); // Open the modal
      } else {
        alert(data.message || "Failed to load comments.");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      alert("Error fetching comments.");
    }
  };

  const closeCommentsModal = () => {
    setIsCommentsModalOpen(false);
  };

  // Function to fetch post details by ID
  const fetchPostDetails = async (postId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://social-media-backend-2-xdnp.onrender.com/api/posts/${postId}`, // Replace with your actual endpoint
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch post details");
      }

      const data = await response.json();
      setPosts(data); // Set the fetched post data
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://social-media-backend-2-xdnp.onrender.com/api/posts/see-all-posts"
        );
        const data = await response.json();

        // Check if the response has posts
        if (data.status === "success") {
          setPosts(data.posts);
        } else {
          // Handle the case where the server responds with an error status
          console.error("Error fetching posts:", data.message);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleAddComment = async (postId) => {
    const comment = commentTexts[postId]; // Get the comment text for this post

    if (!comment || comment.trim() === "") {
      alert("Comment cannot be empty!");
      return;
    }

    try {
      const response = await fetch(
        `https://social-media-backend-2-xdnp.onrender.com/api/posts/${postId}/add-comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Add token for authorization
          },
          body: JSON.stringify({ comment }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
    title: "Success!",
    text: "Comment added successfully!",
    icon: "success",
    confirmButtonText: "OK",
    confirmButtonColor: "#3085d6",
  });

        setCommentTexts((prev) => ({
          ...prev,
          [postId]: "", // Clear the input field for this post
        }));
      } else {
        alert(data.message || "Failed to add comment. Please try again.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("An error occurred while adding the comment.");
    }
  };

  const handleOpenPostDetailModal = () => {
    setIsPostDetailModalOpen(true);
  };

  const handleClosePostDetailModal = () => {
    setIsPostDetailModalOpen(false);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to log out?",
      text: "You won't be able to access your account until you log back in.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove the token and navigate to login page
        localStorage.removeItem("token");
        navigate("/login");
      }
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the image locally
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result); // Set the preview image URL
      };
      reader.readAsDataURL(file);

      // Prepare the file for upload
      const formData = new FormData();
      formData.append("image", file);

      try {
        // Upload the image to the server
        const response = await fetch(
          "https://social-media-backend-2-xdnp.onrender.com/api/posts/upload-image",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token
            },
            body: formData, // Send form data
          }
        );

        const data = await response.json();

        // Check server response
        if (data.success && data.imageUrl) {
          setImageUrl(data.imageUrl); // Update state with server image URL
          // alert("Image uploaded successfully!");
        } else {
          // console.error("Upload failed:", data.message || "Unknown error.");
          // alert("Failed to upload image.");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        // alert("An error occurred during image upload.");
      }
    }
  };

  const handleCreatePost = async () => {
    if (!title || !description) {
      alert("Please fill in both title and description.");
      return;
    }

    const postData = {
      title,
      description,
      imageUrl,
    };

    try {
      const response = await fetch(
        "https://social-media-backend-2-xdnp.onrender.com/api/posts/create-post",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(postData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Post created successfully!",
          showConfirmButton: false,
          timer: 2000,

          // The message will disappear after 1.5 seconds
        });

        // Reset the fields
        window.location.reload();

        setTitle("");
        setDescription("");
        setImageUrl("");
        setIsUploadModalOpen(false);
      } else {
        alert("Failed to create post.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post.");
    }
  };

  const handlePasswordChangeOpen = () => {
    setIsPasswordModalOpen(true);
  };

  const handlePasswordChangeClose = () => {
    setIsPasswordModalOpen(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!newPassword || !confirmPassword) {
      toast.error("Both fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password and confirmation do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://social-media-backend-2-xdnp.onrender.com/api/posts/changepassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: newPassword,
            passwordConfirmation: confirmPassword,
          }),
        }
      );

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

  const gotoview = () => {
    navigate("/view-post");
  };

  const truncateText = (text, limit) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > limit
      ? words.slice(0, limit).join(" ") + "..."
      : words.join(" ");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 fixed top-0 left-0 right-0 z-50 shadow-lg rounded-b-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          {/* Welcome Message */}
          <h2 className="text-xl md:text-2xl font-bold tracking-wide text-white">
            Welcome, <span className="text-yellow-300">{user.name}</span>!
          </h2>

          {/* Navbar Buttons */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Add Post Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-indigo-700 px-4 py-2 rounded-full hover:bg-indigo-800 transition-all duration-300 flex items-center space-x-2 text-sm md:text-base shadow-md"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Post</span>
            </button>

            {/* Your Posts Button */}
            <button
              onClick={() => gotoview(true)}
              className="bg-green-500 px-4 py-2 rounded-full hover:bg-green-600 transition-all duration-300 flex items-center space-x-2 text-sm md:text-base shadow-md"
            >
              <FontAwesomeIcon icon={faEdit} />
              <span>Your Posts</span>
            </button>

            {/* Change Password Button */}
            <button
              onClick={handlePasswordChangeOpen}
              className="bg-purple-500 px-4 py-2 rounded-full hover:bg-purple-600 transition-all duration-300 flex items-center space-x-2 text-sm md:text-base shadow-md"
            >
              <FontAwesomeIcon icon={faKey} />
              <span>Change Password</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={handleNotificationsClick}
              className="relative bg-yellow-500 px-4 py-2 rounded-full hover:bg-yellow-600 transition-all duration-300 flex items-center space-x-2 text-sm md:text-base shadow-md"
            >
              <FontAwesomeIcon icon={faBell} />
              <span>Notifications</span>
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded-full hover:bg-red-700 transition-all duration-300 flex items-center space-x-2 text-sm md:text-base shadow-md"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>

            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="relative text-gray-300 hover:text-white transition-all duration-300"
            >
              <FaBell size={24} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="bg-white shadow-xl rounded-lg p-6 mt-20 mx-auto w-full">
        {isUploadModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 transition-all duration-300 ease-in-out">
            <div className="bg-white p-6 rounded-lg w-full max-w-4xl shadow-xl transform transition-all duration-300 ease-in-out">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Upload an Image
              </h3>


              <div className="flex gap-8 items-center">
                
                <div className="flex-shrink-0 w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="w-full h-full object-cover opacity-0 cursor-pointer"
                  />
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Form Inputs */}
                <div className="flex-grow space-y-4 w-full">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 transition duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter title"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg transition duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter description"
                      rows="4"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between items-center mt-6 space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-200 ease-in-out"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreatePost}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 ease-in-out"
                    >
                      Submit Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Display Posts */}
        <div className="max-w-7xl mx-auto px-4 py-10">
      <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        All Posts
      </h3>

      {loading ? (
        <p className="text-center text-lg text-gray-700">Loading posts...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post._id}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 border border-gray-200"
              >
                {/* User Information */}
                <div className="mb-4 flex items-center space-x-3">
                  <span className="text-lg font-semibold text-indigo-600">
                    Created By:
                  </span>
                  <p className="text-gray-800 font-medium">{post.userName}</p>
                </div>

                {/* Image */}
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-60 object-cover rounded-xl mb-5 shadow-md"
                  />
                )}

                {/* Title */}
                <h4 className="font-semibold text-gray-900 text-xl mb-3 truncate">
                  {post.title}
                </h4>

                {/* Description */}
                <p className="text-gray-700 text-base mb-4 line-clamp-3">
                  {post.description}
                </p>

                {/* Read More Button */}
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <button
                    onClick={handleOpenPostDetailModal}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold transition-all duration-200"
                  >
                    Read More →
                  </button>
                </div>

                {/* Comment Section */}
                <div className="mt-6">
                  <h5 className="text-lg font-semibold text-gray-900 mb-2">
                    Comments
                  </h5>
                  <textarea
                    placeholder="Write a comment..."
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={commentTexts[post._id] || ""}
                    onChange={(e) => handleCommentChange(e, post._id)}
                  ></textarea>

                  <div className="flex flex-wrap gap-4 mt-4">
                    {/* Add Comment Button */}
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition-all duration-200"
                    >
                      Add Comment
                    </button>

                    {/* View All Comments Button */}
                    <button
                      onClick={() => handleViewAllComment(post._id)}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition-all duration-200"
                    >
                      View All Comments
                    </button>

                    {/* Edit Your Comments Button */}
                    {post && (
                      <button
                        onClick={() => handleViewCommentsClick(post._id)}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition-all duration-200"
                      >
                        Edit Your Comments
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center col-span-full">
              No posts are available at the moment.
            </p>
          )}
        </div>
      )}
    </div>
      </div>

      {/* Sidebar for Notifications */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-end items-start z-50">
          <div className="bg-white p-6 w-80 h-full overflow-y-auto shadow-lg rounded-l-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Notifications
            </h3>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-600"
            >
              &times;
            </button>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 p-4 rounded-lg shadow-md"
                    >
                      <h4 className="font-semibold text-gray-800">
                        {notification.title}
                      </h4>
                      <p className="text-gray-600">{notification.message}</p>
                    </div>
                  ))
                ) : (
                  <p>No notifications available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {isNotificationsVisible && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Your Notifications
              </h3>
              <button
                onClick={() => setIsNotificationsVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              {userNotifications.map((notification) => (
                <li key={notification._id} className="text-gray-700">
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <small>
                    {new Date(notification.createdAt).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Modal for Change Password Form */}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Change Password
            </h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

            {/* Close Button */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handlePasswordChangeClose}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

{/* READ MORE BUTON CICK THEN VIEW THIS  */}
      {isPostDetailModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            {loading && <p>Loading post details...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {posts && (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Post Details
                </h2>
                <h4 className="font-semibold text-gray-800 text-xl mb-3">
                  {posts.title}
                </h4>
                <p className="text-gray-600 mb-4">{posts.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  <p>User Namexgdfgfxdzdg: {posts.userName}</p>
                  <p>
                    Created At: {new Date(posts.createdAt).toLocaleString()}
                  </p>
                  <p>
                    Updated At: {new Date(posts.updatedAt).toLocaleString()}
                  </p>
                </div>
              </>
            )}

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={handleClosePostDetailModal}
                className="text-gray-500 hover:text-gray-700 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal to display comments */}
{isCommentsModalOpen && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl mx-4 flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 p-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center md:text-left">
          Edit Your Comments
        </h3>

        {/* Display all comments */}
        {userComments.length > 0 ? (
          userComments.map((comment) => (
            <div key={comment._id} className="mb-6 p-4 border-b border-gray-300">
              {/* Edit comment directly in the input field */}
              <input
                type="text"
                className="w-full text-gray-800 border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={comment.text}
                onChange={(e) =>
                  handleEditComment(comment._id, e.target.value)
                }
              />

              <div className="flex justify-end mt-4">
                {/* Button to trigger the update */}
                <button
                  onClick={() => handleUpdateComment(selectedPostId, comment._id)}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Update Comment
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-700">No comments found for this post.</p>
        )}
      </div>

      <div className="w-full md:w-1/2 p-4 flex flex-col justify-center items-center">
        {/* Close Modal Button */}
        <button
          onClick={closeCommentsModal}
          className="bg-gray-600 text-white px-5 py-2 mb-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}






      {isPopUpVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setIsPopUpVisible(false)}
            >
              &times;
            </button>

            {loadingComments && (
              <p className="text-center text-gray-600">Loading comments...</p>
            )}
            {commentsError && (
              <p className="text-red-500 text-center">{commentsError}</p>
            )}

            {!loadingComments && !commentsError && comments.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {comments.map((comment, index) => (
                  <li key={index} className="p-2 border-b border-gray-200">
                    <strong className="text-gray-800">
                      {comment.userName}:
                    </strong>{" "}
                    <span className="text-gray-600">{comment.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              !loadingComments && (
                <p className="text-center text-gray-500">No comments found.</p>
              )
            )}
          </div>
        </div>
      )}

      {/* If no comments */}
      {!loadingComments && comments.length === 0 && !commentsError && (
        <p className="text-gray-500 mt-3">No comments to display.</p>
      )}

      <ToastContainer />
    </div>
  );
};

export default Profile;
