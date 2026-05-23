import React, { useContext, useState , useEffect } from "react";
import axios from "axios";
import { Moon, Sun } from "lucide-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import { LogOut } from "lucide-react";
import "./index.css";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!user) return null;

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      setIsLoggingOut(false);
    }, 500); // Small delay to show the loading text
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await axios.post("https://roxilerbackend-three.vercel.app/api/auth/update-password", {
        oldPassword,
        newPassword,
      });
      setMessage("Password updated successfully!");
      setTimeout(() => {
        setShowPasswordForm(false);
        setMessage("");
        setOldPassword("");
        setNewPassword("");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <nav className="navbar" style={{ position: "relative" }}>
      <div
        style={{
          fontWeight: "bold",
          fontSize: "1.2rem",
          color: "var(--primary)",
        }}
      >
        Roxiler Stores
      </div>
      <div className="nav-links">
        <span style={{ color: "var(--text-secondary)" }}>
          Hello, {user.name} ({user.role})
        </span>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? (
            <>
              <Sun size={18} />
              Light
            </>
          ) : (
            <>
              <Moon size={18} />
              Dark
            </>
          )}
        </button>
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="btn btn-secondary"
          style={{ padding: "0.5rem 1rem" }}
        >
          Update Password
        </button>
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ padding: "0.5rem 1rem" }}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            "Logging out..."
          ) : (
            <>
              <LogOut size={16} /> Logout
            </>
          )}
        </button>
      </div>

      {showPasswordForm && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            right: "20px",
            background: "var(--surface)",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            zIndex: 100,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
          }}
        >
          <h3 style={{ marginBottom: "1rem" }}>Update Password</h3>
          {message && (
            <div
              style={{
                marginBottom: "1rem",
                color: message.includes("success")
                  ? "var(--secondary)"
                  : "var(--error)",
              }}
            >
              {message}
            </div>
          )}
          <form onSubmit={handleUpdatePassword}>
            <div className="input-group">
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                style={{ padding: "0.5rem" }}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ padding: "0.5rem" }}
                disabled={isUpdating}
              />
              <small
                style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}
              >
                8-16 chars, 1 uppercase, 1 special char
              </small>
            </div>
            <button
              type="submit"
              className="btn"
              style={{ width: "100%" }}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Password"}
            </button>
          </form>
        </div>
      )}
    </nav>
  );
};

const RoleRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === "ADMIN") return <Navigate to="/admin" />;
  if (user.role === "STORE_OWNER") return <Navigate to="/owner" />;
  return <Navigate to="/user" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/*"
            element={
              <ProtectedRoute roles={["NORMAL"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/*"
            element={
              <ProtectedRoute roles={["STORE_OWNER"]}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
