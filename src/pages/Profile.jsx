import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
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
  X,
} from "lucide-react";

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

  // --- STATES ---
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    region: "",
  });

  // Password States
  const [pwdFlow, setPwdFlow] = useState("standard"); // 'standard' or 'otp'
  const [pwdData, setPwdData] = useState({
    oldPassword: "",
    newPassword: "",
    otp: "",
  });

  useEffect(() => {
    if (user && user.user_metadata) {
      setFormData({
        fullName: user.user_metadata.full_name || "",
        dob: user.user_metadata.dob || "",
        region: user.user_metadata.region || "",
      });
    }
  }, [user]);

  const handleSignOut = () => {
    logout();
    navigate("/auth");
  };

  const handleDemoClick = (feature) => {
    alert(`${feature} settings will be available in the next update!`);
  };

  // --- SAVE PERSONAL INFO ---
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          dob: formData.dob,
          region: formData.region,
        },
      });
      if (error) throw error;
      setIsEditingInfo(false);
    } catch (error) {
      alert("Error saving profile: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- PASSWORD UPDATE LOGIC ---
  const handleSendOtp = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      setPwdFlow("otp");
      setMessage("A 6-digit code has been sent to your email.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      if (pwdFlow === "standard") {
        // Step 1: Verify Old Password securely
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: pwdData.oldPassword,
        });
        if (verifyError) throw new Error("Incorrect old password.");
      } else {
        // Step 1 Alternative: Verify OTP securely
        const { error: otpError } = await supabase.auth.verifyOtp({
          email: user.email,
          token: pwdData.otp,
          type: "recovery",
        });
        if (otpError) throw new Error("Invalid or expired code.");
      }

      // Step 2: Update to the New Password
      const { error: updateError } = await supabase.auth.updateUser({
        password: pwdData.newPassword,
      });

      if (updateError) {
        if (updateError.message.includes("Password should contain")) {
          throw new Error(
            "Password must contain 1 uppercase, 1 lowercase, and 1 number.",
          );
        }
        throw updateError;
      }

      // Success! Close modal and reset state
      setIsChangingPassword(false);
      setPwdFlow("standard");
      setPwdData({ oldPassword: "", newPassword: "", otp: "" });
      alert("Password updated successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = user?.user_metadata?.full_name || "Sangeet User";

  return (
    <div
      className="page-content"
      style={{
        padding: "40px",
        color: "white",
        maxWidth: "800px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <h1
        style={{ fontSize: "2rem", marginBottom: "30px", fontWeight: "bold" }}
      >
        Account Overview
      </h1>

      {/* Hero Banner */}
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
          <p
            style={{ marginTop: "10px", color: "#e9d5ff", fontSize: "1.1rem" }}
          >
            {displayName}
          </p>
          <p style={{ color: "#a78bfa", fontSize: "0.9rem" }}>{user?.email}</p>
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
          onClick={() => setIsEditingInfo(true)}
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
        {/* NEW ONCLICK HOOKED UP */}
        <ProfileOption
          icon={Lock}
          title="Change Password"
          onClick={() => {
            setIsChangingPassword(true);
            setMessage("");
          }}
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
          color="#ef4444"
        />
      </div>

      {/* --- 1. EDIT INFO MODAL --- */}
      {isEditingInfo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#18181b",
              padding: "30px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "450px",
              border: "1px solid #3f3f46",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
                Edit Personal Info
              </h2>
              <button
                onClick={() => setIsEditingInfo(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#a3a3a3",
                  cursor: "pointer",
                }}
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={handleSaveInfo}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#a3a3a3",
                    fontSize: "0.9rem",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "6px",
                    background: "#27272a",
                    border: "1px solid #3f3f46",
                    color: "white",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "6px",
                    background: "transparent",
                    border: "1px solid #3f3f46",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "6px",
                    background: "white",
                    border: "none",
                    color: "black",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 2. CHANGE PASSWORD MODAL --- */}
      {isChangingPassword && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#18181b",
              padding: "30px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "450px",
              border: "1px solid #3f3f46",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Change Password</h2>
              <button
                onClick={() => {
                  setIsChangingPassword(false);
                  setPwdFlow("standard");
                  setMessage("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#a3a3a3",
                  cursor: "pointer",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handlePasswordSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {pwdFlow === "standard" ? (
                <>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        color: "#a3a3a3",
                        fontSize: "0.9rem",
                      }}
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={pwdData.oldPassword}
                      onChange={(e) =>
                        setPwdData({ ...pwdData, oldPassword: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "6px",
                        background: "#27272a",
                        border: "1px solid #3f3f46",
                        color: "white",
                        outline: "none",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSaving}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#a78bfa",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      padding: 0,
                    }}
                  >
                    Forgot your current password? Send Code
                  </button>
                </>
              ) : (
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      color: "#a3a3a3",
                      fontSize: "0.9rem",
                    }}
                  >
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Check your email"
                    value={pwdData.otp}
                    onChange={(e) =>
                      setPwdData({ ...pwdData, otp: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "6px",
                      background: "#27272a",
                      border: "1px solid #3f3f46",
                      color: "white",
                      outline: "none",
                      letterSpacing: "2px",
                    }}
                  />
                </div>
              )}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#a3a3a3",
                    fontSize: "0.9rem",
                  }}
                >
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={pwdData.newPassword}
                  onChange={(e) =>
                    setPwdData({ ...pwdData, newPassword: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "6px",
                    background: "#27272a",
                    border: "1px solid #3f3f46",
                    color: "white",
                    outline: "none",
                  }}
                />
              </div>

              {message && (
                <p
                  style={{
                    color: message.includes("sent") ? "#4ade80" : "#ef4444",
                    fontSize: "0.9rem",
                    margin: 0,
                  }}
                >
                  {message}
                </p>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "6px",
                    background: "white",
                    border: "none",
                    color: "black",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {isSaving ? "Processing..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
