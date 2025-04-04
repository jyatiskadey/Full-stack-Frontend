import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";// Import toast from react-toastify
import Swal from "sweetalert2";

const UserPosts = () => {
  const [posts, setPosts] = useState([]); // State to hold posts
  const [editingPost, setEditingPost] = useState(null); // State to hold the post being edited
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  }); // State for the form input
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [postToDelete, setPostToDelete] = useState(null); // Post to be deleted
  const navigate = useNavigate();

  // Fetch user posts from the API
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://social-media-backend-2-xdnp.onrender.com/api/posts/user-post-details",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setPosts(data.posts || []); // Set posts if data is available
        } else {
          console.error("Error fetching posts:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };

    fetchUserPosts();
  }, []);

  // Handle the "Back" button
  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  // Handle delete post confirmation
  const openModal = (postId) => {
    setPostToDelete(postId);
    setShowModal(true); // Show confirmation modal
  };

  const closeModal = () => {
    setShowModal(false); // Close modal without deleting
  };

  // Handle delete post
  const handleDeletePost = async () => {
    const token = localStorage.getItem("token"); // Get the token from localStorage
    if (!token) {
      alert("You need to log in to delete a post.");
      return;
    }

    try {
      const response = await fetch(
        `https://social-media-backend-2-xdnp.onrender.com/api/posts/delete-post/${postToDelete}`,
        {
          method: "DELETE", // Ensure this matches your backend's delete method
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("Delete response:", data); // Debugging log

      if (response.ok) {
        // Successfully deleted, remove the post from the state
        setPosts(posts.filter((post) => post._id !== postToDelete));
        Swal.fire({
          title: "Deleted!",
          text: "Post deleted successfully!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6",
        });
      } else {
        toast.error("Error deleting post."); // Show error toast
        console.error("Error:", data.message);
      }

      setShowModal(false); // Close modal after deletion
    } catch (error) {
      toast.error("An error occurred while deleting the post."); // Show error toast
      console.error("Error:", error);
    }
  };

  // Handle edit post button click
  const handleEditPost = (post) => {
    setEditingPost(post); // Set the post to be edited
    setFormData({
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl,
    });
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission to update post
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    if (!token) {
      alert("You need to log in to edit a post.");
      return;
    }
  
    try {
      // Send a PUT request to update the post
      const response = await fetch(
        `https://social-media-backend-2-xdnp.onrender.com/api/posts/edit-post/${editingPost._id}`,
        {
          method: "PUT",  // Changed from "POST" to "PUT"
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
  
      const data = await response.json();
      console.log("Edit response:", data); // Log the response for debugging
  console.log(data?.message)
  // console.log()
      if (data?.message == 'Post updated successfully') {
        // console.log("fffffff")
        toast.success("Post updated successfully!"); 
        // Update the post in the local state
        setPosts(posts.map((post) => (post._id === editingPost._id ? { ...post, ...formData } : post)));
        // Success toast
        setEditingPost(null); // Hide the edit form
      } else {
        toast.error(data.message); // Error toast
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("An error occurred while updating the post."); // Error toast
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
        >
          Back
        </button>

        {/* Edit Post Form */}
        {editingPost && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md shadow-md max-w-md w-full">
              <h2 className="text-2xl font-semibold mb-4">Edit Post</h2>
              <form onSubmit={handleSubmitEdit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="Enter post title"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="Enter post description"
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Update Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)} // Close the edit form
                    className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4"></h2>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="border border-gray-300 rounded-lg overflow-hidden shadow-md bg-white"
              >
                {/* Image Section */}
                {post.imageUrl && (
                  <div className="h-48 w-full bg-gray-200">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                {/* Title and Description Section */}
                <div className="p-4">
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    {post.title}
                  </h4>
                  <p className="text-gray-600">{post.description}</p>
                  {/* Delete Button */}
                  <button
                    onClick={() => openModal(post._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-4"
                  >
                    Delete Post
                  </button>
                  <button
                    onClick={() => handleEditPost(post)}
                    className="bg-green-500 ml-6 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
                  >
                    Edit Title and desc..
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No posts available.</p>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Are you sure you want to delete this post?</h3>
            <div className="flex justify-between">
              <button
                onClick={handleDeletePost}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
<ToastContainer />
};

export default UserPosts;
