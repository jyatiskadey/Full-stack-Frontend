import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateAccount from "./pages/CreateAccount";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Card from "./pages/Card";
import ChangePassword from "./pages/ChangePassword";
import SendEmail from "./pages/SendEmail";
import AdminLoginPage from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminProfile";
import PostDetails from "./pages/PostDetails";



const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route for Create Account */}
        <Route path="/" element={<CreateAccount />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />


        {/* Route for Login */}
        <Route path="/login" element={<Login />} />

        {/* Example of a dashboard route */}
        <Route path="/profile" element={< Profile />} />
        <Route path="/admin/dashboard" element={< AdminPanel />} />


        <Route path="/view-post" element={< Card />} />
        <Route path="/chnagepassword" element={< ChangePassword />} />
        <Route path="/emailsend" element={< SendEmail />} />

        <Route path="/post/:id" element={<PostDetails />} />



      </Routes>
    </Router>
  );
};

export default App;
