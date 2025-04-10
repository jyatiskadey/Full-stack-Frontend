"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import Swal from "sweetalert2"

const Profile = ({ postId }) => {
  const [isPopUpVisible, setIsPopUpVisible] = useState(false)
  const [visibleComments, setVisibleComments] = useState(5)
  const [userComments, setUserComments] = useState([])
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [commentTexts, setCommentTexts] = useState({})
  const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [imageUrl, setImageUrl] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [error, setError] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [userNotifications, setUserNotifications] = useState([])
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentsError, setCommentsError] = useState(null)
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No token found in localStorage.")
      }

      const response = await fetch(
        "https://social-media-backend-2-xdnp.onrender.com/api/posts/get-user-specific-notification",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch messages: ${errorText}`)
      }

      const data = await response.json()

      if (data.messages && data.messages.length > 0) {
        setUserNotifications(data.messages)
      } else {
        setUserNotifications([])
      }

      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleNotificationsClick = () => {
    setIsNotificationsVisible(!isNotificationsVisible)
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          setError("Token is missing. Please log in again.")
          setLoading(false)
          return navigate("/login")
        }

        const response = await fetch("https://social-media-backend-2-xdnp.onrender.com/api/posts/user-details", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (response.ok) {
          setUser(data.user)
        } else {
          setError(data.message || "Failed to fetch user details.")
          navigate("/login")
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user details:", error)
        setError("An error occurred while fetching user details.")
        setLoading(false)
        navigate("/login")
      }
    }

    fetchUserDetails()
  }, [navigate])

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const response = await fetch("https://social-media-backend-2-xdnp.onrender.com/api/posts/get-all-notification")
        const data = await response.json()
        setNotifications(data.notifications)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleCommentChange = (e, postId) => {
    setCommentTexts((prev) => ({
      ...prev,
      [postId]: e.target.value,
    }))
  }

  const handleViewCommentsClick = (postId) => {
    setSelectedPostId(postId)
    fetchPostComments(postId)
  }

  const handleViewAllComment = async (postId) => {
    setLoadingComments(true)
    setCommentsError(null)

    try {
      const response = await fetch(`https://social-media-backend-2-xdnp.onrender.com/api/posts/${postId}/Allcomments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setComments(data.comments)
        setIsPopUpVisible(true)
      } else {
        setCommentsError(data.message || "Failed to fetch comments")
      }
    } catch (error) {
      setCommentsError("An error occurred while fetching comments")
      console.error(error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleEditComment = (commentId, newCommentText) => {
    setUserComments((prevComments) =>
      prevComments.map((comment) => (comment._id === commentId ? { ...comment, text: newCommentText } : comment)),
    )
  }

  const handleUpdateComment = async (postId, commentId) => {
    const updatedComment = userComments.find((comment) => comment._id === commentId)

    if (!updatedComment) {
      toast.error("Comment not found.")
      return
    }

    if (!updatedComment.text.trim()) {
      toast.error("Comment text cannot be empty.")
      return
    }

    try {
      const response = await fetch(
        `https://social-media-backend-2-xdnp.onrender.com/api/posts/${postId}/comments/${commentId}/UpdateComment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ text: updatedComment.text }),
        },
      )

      const data = await response.json()

      if (response.ok) {
        toast.success("Comment updated successfully!")
        setUserComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId ? { ...comment, text: updatedComment.text } : comment,
          ),
        )
      } else {
        toast.error(data.message || "Failed to update comment.")
      }
    } catch (error) {
      console.error("Error updating comment:", error)
      toast.error("An error occurred while updating the comment.")
    }
  }

  const fetchPostComments = async (postId) => {
    try {
      const response = await fetch(`https://social-media-backend-2-xdnp.onrender.com/api/posts/${postId}/comments`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()

      if (response.ok) {
        setUserComments(data.comments)
        setIsCommentsModalOpen(true)
      } else {
        toast.error(data.message || "Failed to load comments.")
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast.error("Error fetching comments.")
    }
  }

  const closeCommentsModal = () => {
    setIsCommentsModalOpen(false)
  }

  const fetchPostDetails = async (postId) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`https://social-media-backend-2-xdnp.onrender.com/api/posts/${postId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch post details")
      }

      const data = await response.json()
      setPosts(data)
    } catch (err) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const response = await fetch("https://social-media-backend-2-xdnp.onrender.com/api/posts/see-all-posts")
        const data = await response.json()

        if (data.status === "success") {
          setPosts(data.posts)
        } else {
          console.error("Error fetching posts:", data.message)
        }
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleAddComment = async (postId) => {
    const comment = commentTexts[postId]

    if (!comment || comment.trim() === "") {
      toast.error("Comment cannot be empty!")
      return
    }

    try {
      const response = await fetch(`https://social-media-backend-2-xdnp.onrender.com/api/posts/${postId}/add-comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ comment }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Comment added successfully!")
        setCommentTexts((prev) => ({
          ...prev,
          [postId]: "",
        }))
      } else {
        toast.error(data.message || "Failed to add comment. Please try again.")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("An error occurred while adding the comment.")
    }
  }

  const handleOpenPostDetailModal = () => {
    setIsPostDetailModalOpen(true)
  }

  const handleClosePostDetailModal = () => {
    setIsPostDetailModalOpen(false)
  }

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
        localStorage.removeItem("token")
        navigate("/login")
      }
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImageUrl(reader.result)
      }
      reader.readAsDataURL(file)

      const formData = new FormData()
      formData.append("image", file)

      try {
        const response = await fetch("https://social-media-backend-2-xdnp.onrender.com/api/posts/upload-image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        })

        const data = await response.json()

        if (data.success && data.imageUrl) {
          setImageUrl(data.imageUrl)
        }
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }
  }

  const handleCreatePost = async () => {
    if (!title || !description) {
      toast.error("Please fill in both title and description.")
      return
    }

    const postData = {
      title,
      description,
      imageUrl,
    }

    try {
      const response = await fetch("https://social-media-backend-2-xdnp.onrender.com/api/posts/create-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(postData),
      })

      const data = await response.json()
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Post created successfully!",
          showConfirmButton: false,
          timer: 2000,
        })

        window.location.reload()

        setTitle("")
        setDescription("")
        setImageUrl("")
        setIsUploadModalOpen(false)
      } else {
        toast.error("Failed to create post.")
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Failed to create post.")
    }
  }

  const handlePasswordChangeOpen = () => {
    setIsPasswordModalOpen(true)
  }

  const handlePasswordChangeClose = () => {
    setIsPasswordModalOpen(false)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      toast.error("Both fields are required.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password and confirmation do not match.")
      return
    }

    try {
      const token = localStorage.getItem("token")

      const response = await fetch("https://social-media-backend-2-xdnp.onrender.com/api/posts/changepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: newPassword,
          passwordConfirmation: confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Password changed successfully!")
        setTimeout(() => {
          navigate("/profile")
        }, 2000)
      } else {
        toast.error(data.message || "Something went wrong. Please try again.")
      }
    } catch (error) {
      toast.error("An error occurred while changing your password.")
      console.error("Error changing password:", error)
    }
  }

  const gotoview = () => {
    navigate("/view-post")
  }

  const truncateText = (text, limit) => {
    if (!text) return ""
    const words = text.split(" ")
    return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-medium">Loading user data...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SocialConnect
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleNotificationsClick}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {userNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full">
                  {userNotifications.length}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                <img
                  src={user.profilePic || "/placeholder.svg"}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-medium hidden md:inline-block">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Fixed Sidebar */}
        <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 bg-purple-600 text-white p-2 rounded-lg shadow-lg z-50 mt-6"
      >
        ☰
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg overflow-y-auto transform transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:block md:w-64 z-50`}
      >
        <div className="p-6 space-y-6">
          {/* User Profile Section */}
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md">
              <img src={user.profilePic || "/placeholder.svg"} alt={user.name} className="h-full w-full object-cover" />
            </div>
            <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          {/* Navigation Section */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Menu</h3>
            <button
              className="w-full flex items-center justify-start px-4 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-100 hover:from-purple-100 hover:to-pink-100 transition-colors"
              onClick={() => setIsUploadModalOpen(true)}
            >
              ➕ Create Post
            </button>
            <button className="w-full flex items-center justify-start px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors" onClick={gotoview}>
              📝 Your Posts
            </button>
            <button className="w-full flex items-center justify-start px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors" onClick={handlePasswordChangeOpen}>
              🔑 Change Password
            </button>
          </div>

          {/* Logout Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              className="w-full flex items-center justify-start px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay (Closes Sidebar) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

        {/* Main Content - Scrollable */}
        <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Your Feed</h2>
              {/* <button
                onClick={() => setIsUploadModalOpen(true)}
                className="md:hidden flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>New Post</span>
              </button> */}
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="p-5 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg shadow-inner">
                          {post.userName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{post.userName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pb-4 space-y-5 bg-white shadow-lg rounded-xl">
  {/* Post Title */}
  <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>

  {/* Post Description */}
  <p className="text-gray-600 text-sm">Description - {truncateText(post.description, 30)}</p>

  {/* Image Section */}
  {post.imageUrl && (
    <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-300 shadow-md transition-transform duration-300 hover:shadow-xl  cursor-pointer flex items-center justify-center">
      <img
        src={post.imageUrl || "/placeholder.svg"}
        alt={post.title}
        className="object-cover  transition-transform duration-300"
      />
    </div>
  )}

  {/* Interaction Buttons */}
  <div className="flex items-center justify-between pt-3">
    <div className="flex space-x-6">
      {/* Like Button */}
      <button className="flex items-center text-gray-500 hover:text-red-500 transition-all duration-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span className="text-sm font-medium">Like</span>
      </button>

      {/* Comment Button */}
      <button
        className="flex items-center text-gray-500 hover:text-blue-500 transition-all duration-200"
        onClick={() => handleViewAllComment(post._id)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <span className="text-sm font-medium">Comments</span>
      </button>

      {/* Share Button */}
      <button className="flex items-center text-gray-500 hover:text-green-500 transition-all duration-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        <span className="text-sm font-medium">Share</span>
      </button>
    </div>

    {/* Read More Button */}
    <button
      className="flex items-center text-gray-500 hover:text-purple-500 transition-all duration-200"
      onClick={handleOpenPostDetailModal}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <span className="text-sm font-medium">Read More</span>
    </button>
  </div>
</div>


                    <hr className="border-gray-100" />

                    <div className="p-5 pt-3">
                      <div className="w-full space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-inner">
                            {user.name?.charAt(0)}
                          </div>
                          <div className="flex-1 flex space-x-2">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentTexts[post._id] || ""}
                              onChange={(e) => handleCommentChange(e, post._id)}
                              className="flex-1 text-sm border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleAddComment(post._id)}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-2 hover:shadow-md transition-shadow"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => handleViewAllComment(post._id)}
                            className="text-sm text-gray-500 hover:text-purple-600 font-medium"
                          >
                            View all comments
                          </button>

                          <button
                            onClick={() => handleViewCommentsClick(post._id)}
                            className="text-sm text-gray-500 hover:text-purple-600 font-medium"
                          >
                            Edit your comments
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 text-center rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col items-center justify-center py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-300 mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                  <p className="text-gray-500 mb-4">No posts available at the moment.</p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Create Your First Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Post Modal */}
      {isUploadModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
      
      {/* Modal Header */}
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Create New Post</h3>
        <button
          onClick={() => setIsUploadModalOpen(false)}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Image (Optional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
            <input type="file" onChange={handleImageUpload} className="hidden" id="image-upload" accept="image/*" />
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400 mb-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span className="text-sm text-gray-500">{imageUrl ? "Change image" : "Click to upload an image"}</span>
            </label>

            {imageUrl && (
              <div className="mt-4 relative aspect-video rounded-lg overflow-hidden">
                <img src={imageUrl || "/placeholder.svg"} alt="Preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="p-6 border-t flex justify-end space-x-3">
        <button
          onClick={() => setIsUploadModalOpen(false)}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleCreatePost}
          className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-md"
        >
          Create Post
        </button>
      </div>

    </div>
  </div>
)}


      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
                <button onClick={handlePasswordChangeClose} className="text-gray-500 hover:text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handlePasswordChangeClose}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-shadow"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {isNotificationsVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
                <button onClick={() => setIsNotificationsVisible(false)} className="text-gray-500 hover:text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-4">
              {userNotifications.length > 0 ? (
                <div className="space-y-4">
                  {userNotifications.map((notification) => (
                    <div key={notification._id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                      <h4 className="font-medium text-gray-800">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-300 mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <p className="text-gray-500">No notifications available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {isPostDetailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Post Details</h3>
                <button onClick={handleClosePostDetailModal} className="text-gray-500 hover:text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : error ? (
                <p className="text-center text-red-500 py-4">{error}</p>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">{posts.title}</h3>
                  <p className="text-gray-700">{posts.description}</p>

                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Posted by: {posts.userName}</p>
                    <p>Created: {new Date(posts.createdAt).toLocaleString()}</p>
                    <p>Updated: {new Date(posts.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {isCommentsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Edit Your Comments</h3>
                <button onClick={closeCommentsModal} className="text-gray-500 hover:text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-6">
              {userComments.length > 0 ? (
                <div className="space-y-4">
                  {userComments.map((comment) => (
                    <div key={comment._id} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                      <textarea
                        value={comment.text}
                        onChange={(e) => handleEditComment(comment._id, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      ></textarea>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleUpdateComment(selectedPostId, comment._id)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-shadow"
                        >
                          Update Comment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-300 mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <p className="text-gray-500">No comments found for this post</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Comments Modal */}
      {isPopUpVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">All Comments</h3>
                <button onClick={() => setIsPopUpVisible(false)} className="text-gray-500 hover:text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-4">
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : commentsError ? (
                <p className="text-center text-red-500 py-4">{commentsError}</p>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-inner">
                          {comment.userName?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{comment.userName}</span>
                      </div>
                      <p className="text-gray-700 pl-10">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-300 mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <p className="text-gray-500">No comments available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}

export default Profile
