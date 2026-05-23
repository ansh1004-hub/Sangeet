import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        // Supabase Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/"); // Send them to the Home page on success
      } else {
        // Supabase Sign Up
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Success! Check your email to confirm your account.");
      }
    } catch (error) {
      setMessage(error.message); // Show error to the user (e.g., "Invalid password")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content auth-page">
      <div className="auth-container">
        <h2>{isLogin ? "Log in to Sangeet" : "Sign up for free"}</h2>

        <form onSubmit={handleAuth} className="auth-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-btn"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
