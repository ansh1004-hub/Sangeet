import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Music } from "lucide-react"; // Added Music icon

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);

  const navigate = useNavigate();

  const isValidEmail = (emailString) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailString);
  };

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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("");
        setShowOtpInput(true);
      }
    } catch (error) {
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

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isValidEmail(email)) {
      setMessage("Please enter a fully valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setResetStep(2);
      setMessage("A 6-digit code has been sent to your email.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error: otpError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "recovery",
      });
      if (otpError) throw new Error("Invalid or expired code.");

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        if (updateError.message.includes("Password should contain")) {
          throw new Error(
            "Password must contain 1 uppercase, 1 lowercase, and 1 number.",
          );
        }
        throw updateError;
      }

      alert("Password reset successfully! You can now log in.");
      setIsForgotPassword(false);
      setIsLogin(true);
      setResetStep(1);
      setPassword("");
      setOtp("");
      setMessage("");
    } catch (error) {
      setMessage(error.message);
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
          maxWidth: "420px",
          background: "#1e1e2f",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* --- CLASSY HEADER SECTION --- */}
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          {/* Gradient Music Icon Container */}
          <div
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              background: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)",
              padding: "16px",
              borderRadius: "50%",
              marginBottom: "15px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            }}
          >
            <Music size={28} color="white" />
          </div>

          {/* Dynamic Main Heading */}
          <h2
            style={{
              margin: "0 0 10px 0",
              fontSize: "1.8rem",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "0.5px",
            }}
          >
            {isForgotPassword
              ? "Reset Password"
              : showOtpInput
                ? "Check Your Inbox"
                : isLogin
                  ? "Welcome back"
                  : "Join Sangeet today"}
          </h2>

          {/* Dynamic Subtitle */}
          <p
            style={{
              margin: 0,
              color: "#a3a3a3",
              fontSize: "0.95rem",
              lineHeight: "1.5",
            }}
          >
            {isForgotPassword
              ? "Let's get you back to your music."
              : showOtpInput
                ? "Just one more step to start listening."
                : isLogin
                  ? "Log in to pick up right where you left off."
                  : "Create an account to explore limitless music."}
          </p>
        </div>

        {/* --- FORGOT PASSWORD UI --- */}
        {isForgotPassword ? (
          resetStep === 1 ? (
            <form
              onSubmit={handleSendResetEmail}
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
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid #3f3f46",
                  background: "#18181b",
                  color: "white",
                  outline: "none",
                  fontSize: "1rem",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  border: "none",
                  background: "white",
                  color: "black",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "10px",
                  fontSize: "1rem",
                  transition: "transform 0.1s",
                }}
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleResetPassword}
              className="auth-form"
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <p
                style={{
                  color: "#a3a3a3",
                  textAlign: "center",
                  fontSize: "0.9rem",
                  marginBottom: "5px",
                }}
              >
                Enter the 6-digit code sent to <b>{email}</b>
              </p>
              <input
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid #3f3f46",
                  background: "#18181b",
                  color: "white",
                  textAlign: "center",
                  letterSpacing: "3px",
                  fontSize: "1.1rem",
                  outline: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "14px",
                    paddingRight: "45px",
                    borderRadius: "8px",
                    border: "1px solid #3f3f46",
                    background: "#18181b",
                    color: "white",
                    boxSizing: "border-box",
                    outline: "none",
                    fontSize: "1rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#a3a3a3",
                    cursor: "pointer",
                    display: "flex",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  border: "none",
                  background: "white",
                  color: "black",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "10px",
                  fontSize: "1rem",
                }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )
        ) : showOtpInput ? (
          /* --- SIGN UP OTP VERIFICATION FORM --- */
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
                fontSize: "0.95rem",
              }}
            >
              We sent a 6-digit code to <br />
              <b style={{ color: "white" }}>{email}</b>.<br />
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
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #3f3f46",
                background: "#18181b",
                color: "white",
                textAlign: "center",
                fontSize: "1.3rem",
                letterSpacing: "5px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px",
                borderRadius: "8px",
                border: "none",
                background: "white",
                color: "black",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px",
                fontSize: "1rem",
              }}
            >
              {loading ? "Verifying..." : "Verify Account"}
            </button>
          </form>
        ) : (
          /* --- STANDARD EMAIL/PASSWORD FORM --- */
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
                padding: "14px",
                borderRadius: "8px",
                border: "1px solid #3f3f46",
                background: "#18181b",
                color: "white",
                outline: "none",
                fontSize: "1rem",
              }}
            />

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "14px",
                  paddingRight: "45px",
                  borderRadius: "8px",
                  border: "1px solid #3f3f46",
                  background: "#18181b",
                  color: "white",
                  boxSizing: "border-box",
                  outline: "none",
                  fontSize: "1rem",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#a3a3a3",
                  cursor: "pointer",
                  display: "flex",
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* FORGOT PASSWORD BUTTON */}
            {isLogin && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setMessage("");
                  setPassword("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#a78bfa",
                  textAlign: "right",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  marginTop: "-5px",
                  padding: 0,
                  fontWeight: "500",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#d8b4fe")}
                onMouseLeave={(e) => (e.target.style.color = "#a78bfa")}
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px",
                borderRadius: "8px",
                border: "none",
                background: "white",
                color: "black",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px",
                fontSize: "1rem",
              }}
            >
              {loading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>
        )}

        {/* --- ERROR/SUCCESS MESSAGES --- */}
        {message && (
          <p
            className="auth-message"
            style={{
              textAlign: "center",
              color: message.includes("code has been sent")
                ? "#4ade80"
                : "#ef4444",
              marginTop: "20px",
              fontSize: "0.95rem",
              padding: "10px",
              background: "rgba(0,0,0,0.2)",
              borderRadius: "8px",
            }}
          >
            {message}
          </p>
        )}

        {/* --- BOTTOM NAVIGATION / SWITCHES --- */}
        {!showOtpInput && !isForgotPassword && (
          <p
            className="auth-switch"
            style={{
              textAlign: "center",
              marginTop: "25px",
              color: "#a3a3a3",
              fontSize: "0.95rem",
            }}
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
                setShowPassword(false);
              }}
              className="text-btn"
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "0.95rem",
              }}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        )}

        {isForgotPassword && (
          <button
            type="button"
            onClick={() => {
              setIsForgotPassword(false);
              setResetStep(1);
              setMessage("");
              setPassword("");
              setOtp("");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              background: "none",
              border: "none",
              color: "#a3a3a3",
              cursor: "pointer",
              marginTop: "25px",
              fontSize: "0.95rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "white")}
            onMouseLeave={(e) => (e.target.style.color = "#a3a3a3")}
          >
            <ArrowLeft size={18} /> Back to log in
          </button>
        )}
      </div>
    </div>
  );
}
