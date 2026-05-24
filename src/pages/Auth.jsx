import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Music, Headphones } from "lucide-react";

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
      setMessage("Please enter a fully valid email address.");
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
      if (error.message.includes("Password should contain")) {
        setMessage(
          "Password must contain 1 uppercase, 1 lowercase, and 1 number.",
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
      setMessage("Invalid or expired code.");
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
      // Removed the "page-content" class so it stops inheriting sidebar margins!
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#1e1b4b", // Dark purple background
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      {/* --- BRAND LOGO --- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "25px",
        }}
      >
        <Headphones size={36} color="white" />
        <h1
          style={{
            color: "white",
            fontSize: "2.5rem",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          Sangeet
        </h1>
      </div>

      <div
        style={{
          width: "90%",
          maxWidth: "400px",
          background: "#18181b",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 15px 30px rgba(0,0,0,0.6)",
          boxSizing: "border-box",
        }}
      >
        {/* --- CLASSY HEADER SECTION --- */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#3f3f46",
              padding: "16px",
              borderRadius: "50%",
              marginBottom: "15px",
            }}
          >
            <Music size={24} color="white" />
          </div>

          <h2
            style={{
              margin: "0 0 10px 0",
              fontSize: "1.6rem",
              fontWeight: "bold",
              color: "white",
            }}
          >
            {isForgotPassword
              ? "Reset Password"
              : showOtpInput
                ? "Check Your Inbox"
                : isLogin
                  ? "Welcome back"
                  : "Join Sangeet"}
          </h2>

          <p
            style={{
              margin: 0,
              color: "#a3a3a3",
              fontSize: "0.9rem",
              lineHeight: "1.4",
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
                  background: "#27272a",
                  color: "white",
                  outline: "none",
                  boxSizing: "border-box",
                  width: "100%",
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
                  width: "100%",
                }}
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleResetPassword}
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
                  background: "#27272a",
                  color: "white",
                  textAlign: "center",
                  letterSpacing: "3px",
                  boxSizing: "border-box",
                  width: "100%",
                }}
              />
              <div style={{ position: "relative", width: "100%" }}>
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
                    background: "#27272a",
                    color: "white",
                    boxSizing: "border-box",
                    outline: "none",
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
                  width: "100%",
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
              Enter it below to verify.
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
                background: "#27272a",
                color: "white",
                textAlign: "center",
                fontSize: "1.3rem",
                letterSpacing: "5px",
                outline: "none",
                boxSizing: "border-box",
                width: "100%",
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
                width: "100%",
              }}
            >
              {loading ? "Verifying..." : "Verify Account"}
            </button>
          </form>
        ) : (
          /* --- STANDARD EMAIL/PASSWORD FORM --- */
          <form
            onSubmit={handleAuth}
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
                background: "#27272a",
                color: "white",
                outline: "none",
                boxSizing: "border-box",
                width: "100%",
              }}
            />

            <div style={{ position: "relative", width: "100%" }}>
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
                  background: "#27272a",
                  color: "white",
                  boxSizing: "border-box",
                  outline: "none",
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
              <div
                style={{ width: "100%", textAlign: "right", marginTop: "-5px" }}
              >
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
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
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
                width: "100%",
              }}
            >
              {loading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>
        )}

        {/* --- ERROR/SUCCESS MESSAGES --- */}
        {message && (
          <p
            style={{
              textAlign: "center",
              color: message.includes("code has been sent")
                ? "#4ade80"
                : "#ef4444",
              marginTop: "15px",
              fontSize: "0.9rem",
            }}
          >
            {message}
          </p>
        )}

        {/* --- BOTTOM NAVIGATION / SWITCHES --- */}
        {!showOtpInput && !isForgotPassword && (
          <p
            style={{
              textAlign: "center",
              marginTop: "25px",
              color: "#a3a3a3",
              fontSize: "0.9rem",
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
              marginTop: "20px",
              fontSize: "0.9rem",
            }}
          >
            <ArrowLeft size={16} /> Back to log in
          </button>
        )}
      </div>
    </div>
  );
}
