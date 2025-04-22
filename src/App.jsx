import  { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import CreateAccount from "./pages/CreateAccount";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Card from "./pages/Card";
import ChangePassword from "./pages/ChangePassword";
import SendEmail from "./pages/SendEmail";
import AdminLoginPage from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminProfile";
import PostDetails from "./pages/PostDetails";
import GlobalLoader from "./pages/GlobalLoader"; // 💡 Import the loader

// ============ Wrapper for Route Change Detection =============
const AppWrapper = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading on route change
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 700); // adjust the delay
    return () => clearTimeout(timeout);
  }, [location]);

  return (
    <>
      <GlobalLoader isLoading={loading} />
      <Routes>
        <Route path="/" element={<CreateAccount />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/dashboard" element={<AdminPanel />} />
        <Route path="/view-post" element={<Card />} />
        <Route path="/chnagepassword" element={<ChangePassword />} />
        <Route path="/emailsend" element={<SendEmail />} />
        <Route path="/post/:id" element={<PostDetails />} />
      </Routes>
    </>
  );
};

// ============ Main App =============
const App = () => {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
};

export default App;
