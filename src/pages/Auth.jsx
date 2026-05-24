import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Strict Email Validation
  const isValidEmail = (emailString) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailString);
  };

  // Handles standard Login and initial Sign Up
  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isValidEmail(email)) {
      setMessage(
        "Please enter a fully valid email address (e.g., name@gmail.com).",
      );
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Log in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        // Sign Up
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // If successful, switch the UI to ask for the OTP
        setMessage("");
        setShowOtpInput(true);
      }
    } catch (error) {
      // Custom Error Interceptor for ugly password warnings
      if (
        error.message.includes("Password should contain at least one character")
      ) {
        setMessage(
          "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.",
        );
      } else {
        setMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handles submitting the OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });

      if (error) throw error;
      navigate("/");
    } catch (error) {
      setMessage("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="page-content auth-page"
      style={{ height: "100vh", width: "100%" }}
    >
      <div
        className="auth-container"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "400px",
          background: "#1e1e2f",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <h2
          style={{ textAlign: "center", marginBottom: "30px", color: "white" }}
        >
          {showOtpInput
            ? "Verify your email"
            : isLogin
              ? "Log in to Sangeet"
              : "Sign up for free"}
        </h2>

        {/* --- DYNAMIC FORM RENDERING --- */}
        {showOtpInput ? (
          /* OTP VERIFICATION FORM */
          <form
            onSubmit={handleVerifyOtp}
            className="auth-form"
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <p
              style={{
                color: "#a3a3a3",
                textAlign: "center",
                marginBottom: "10px",
              }}
            >
              We sent a 6-digit code to <br />
              <b>{email}</b>.<br />
              <br />
              Enter it below to verify your account.
            </p>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{
                padding: "15px",
                borderRadius: "5px",
                border: "1px solid #3f3f46",
                background: "#18181b",
                color: "white",
                textAlign: "center",
                fontSize: "1.2rem",
                letterSpacing: "4px",
              }}
            />
            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
              style={{
                padding: "12px",
                borderRadius: "5px",
                border: "none",
                background: "white",
                color: "black",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              {loading ? "Verifying..." : "Verify Account"}
            </button>
          </form>
        ) : (
          /* STANDARD EMAIL/PASSWORD FORM */
          <form
            onSubmit={handleAuth}
            className="auth-form"
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: "12px",
                borderRadius: "5px",
                border: "1px solid #3f3f46",
                background: "#18181b",
                color: "white",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: "12px",
                borderRadius: "5px",
                border: "1px solid #3f3f46",
                background: "#18181b",
                color: "white",
              }}
            />
            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
              style={{
                padding: "12px",
                borderRadius: "5px",
                border: "none",
                background: "white",
                color: "black",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              {loading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>
        )}

        {message && (
          <p
            className="auth-message"
            style={{
              textAlign: "center",
              color: message.includes("Success") ? "#4ade80" : "#ef4444",
              marginTop: "15px",
            }}
          >
            {message}
          </p>
        )}

        {/* Hide the toggle switch if they are in the OTP phase */}
        {!showOtpInput && (
          <p
            className="auth-switch"
            style={{ textAlign: "center", marginTop: "20px", color: "#a3a3a3" }}
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-btn"
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
