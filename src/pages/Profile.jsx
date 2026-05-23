// src/pages/Profile.jsx
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout(); // Clears context and localStorage
    navigate("/auth"); // Redirects to login
  };

  return (
    <div className="page-content" style={{ padding: "40px", color: "white" }}>
      <h1>Account</h1>
      <div
        style={{ background: "#18181b", padding: "20px", borderRadius: "10px" }}
      >
        <p>Email: {user?.email}</p>
        <button
          onClick={handleSignOut}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
