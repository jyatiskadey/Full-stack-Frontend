import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PostDetails = () => {
  const { id } = useParams(); // Get post ID from the URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `http://localhost:9874/api/posts/getpostbyID/${id}`
        );
        setPost(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post details:", err);
        setError("Failed to load post details.");
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  if (!post)
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-500">
        Post not found.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-12">
    <button
      onClick={() => navigate("/admin/dashboard")}
      className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center space-x-2"
    >
      <span className="text-lg">&larr;</span>
      <span>Back to Posts</span>
    </button>
  
    <h1 className="text-4xl font-bold text-gray-900 mb-4">
      Post Title: <span className="font-extrabold">{post.title}</span>
    </h1>
  
    <div className="flex items-center text-gray-500 text-sm mb-6 space-x-4">
      <p>
        <span className="font-medium">Author:</span> {post.userName}
      </p>
      <p>•</p>
      <p>{new Date(post.createdAt).toLocaleDateString()}</p>
    </div>
  
    {post.updatedAt && (
      <p className="text-gray-400 text-sm mb-6 italic">
        Last updated: {new Date(post.updatedAt).toLocaleDateString()}
      </p>
    )}
  
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-800 mb-2">Description</h2>
      <p className="text-gray-700 leading-relaxed">{post.description}</p>
    </div>
  
    {/* Image Section */}
    {post.imageUrl && (
      <div className="mt-6 rounded-lg overflow-hidden shadow-lg">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-96 object-cover rounded-xl transform transition duration-300 hover:scale-105"
        />
      </div>
    )}
  </div>
  
  );
};

export default PostDetails;
