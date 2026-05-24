import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  LogOut,
  ChevronRight,
  Music,
  CreditCard,
} from "lucide-react";

// Reusable component for the list items to keep code clean
const ProfileOption = ({ icon: Icon, title, onClick, color = "white" }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px",
      cursor: "pointer",
      borderBottom: "1px solid #27272a",
      transition: "background 0.2s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "#27272a")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
      <Icon size={20} color={color === "white" ? "#a3a3a3" : color} />
      <span style={{ color: color, fontSize: "1rem", fontWeight: "500" }}>
        {title}
      </span>
    </div>
    <ChevronRight size={20} color="#a3a3a3" />
  </div>
);

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/auth");
  };

  // Dummy handler for the demo
  const handleDemoClick = (feature) => {
    alert(`${feature} settings will be available in the next update!`);
  };

  return (
    <div
      className="page-content"
      style={{
        padding: "40px",
        color: "white",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{ fontSize: "2rem", marginBottom: "30px", fontWeight: "bold" }}
      >
        Account Overview
      </h1>

      {/* Hero Banner - Mimicking Spotify's Plan Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)",
          padding: "30px",
          borderRadius: "12px",
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div>
          <p
            style={{
              textTransform: "uppercase",
              fontSize: "0.8rem",
              letterSpacing: "2px",
              color: "#d8b4fe",
              marginBottom: "5px",
            }}
          >
            Your Plan
          </p>
          <h2 style={{ fontSize: "2.5rem", margin: 0 }}>Sangeet Free</h2>
          <p style={{ marginTop: "10px", color: "#e9d5ff" }}>
            Logged in as: <b>{user?.email}</b>
          </p>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            padding: "15px",
            borderRadius: "50%",
            backdropFilter: "blur(10px)",
          }}
        >
          <Music size={40} color="white" />
        </div>
      </div>

      {/* SECTION: Account */}
      <h3
        style={{ fontSize: "1.2rem", marginBottom: "15px", color: "#e4e4e7" }}
      >
        Account
      </h3>
      <div
        style={{
          background: "#18181b",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "30px",
        }}
      >
        <ProfileOption
          icon={User}
          title="Edit personal info (Name, DOB, Region)"
          onClick={() => handleDemoClick("Personal Info")}
        />
        <ProfileOption
          icon={Globe}
          title="Language and Region"
          onClick={() => handleDemoClick("Language")}
        />
        <ProfileOption
          icon={CreditCard}
          title="Manage Subscription"
          onClick={() => handleDemoClick("Subscription")}
        />
      </div>

      {/* SECTION: Security and Privacy */}
      <h3
        style={{ fontSize: "1.2rem", marginBottom: "15px", color: "#e4e4e7" }}
      >
        Security and Privacy
      </h3>
      <div
        style={{
          background: "#18181b",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "30px",
        }}
      >
        <ProfileOption
          icon={Lock}
          title="Change Password"
          onClick={() => handleDemoClick("Change Password")}
        />
        <ProfileOption
          icon={Shield}
          title="Account Privacy"
          onClick={() => handleDemoClick("Privacy")}
        />
        <ProfileOption
          icon={Bell}
          title="Notification Settings"
          onClick={() => handleDemoClick("Notifications")}
        />
      </div>

      {/* SECTION: Actions */}
      <h3
        style={{ fontSize: "1.2rem", marginBottom: "15px", color: "#e4e4e7" }}
      >
        Actions
      </h3>
      <div
        style={{
          background: "#18181b",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "50px",
        }}
      >
        <ProfileOption
          icon={LogOut}
          title="Sign out everywhere"
          onClick={handleSignOut}
        />
        <ProfileOption
          icon={LogOut}
          title="Log out of this device"
          onClick={handleSignOut}
          color="#ef4444" // Red color for standard logout
        />
      </div>
    </div>
  );
}
