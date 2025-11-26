import "../styles/login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Assuming you've placed your image in src/assets
// If your image is called 'login-illustration.png', you would import it like this:
import LoginIllustration from "../wrk1.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Added state and setter for password
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await login(email, password);
      const role = resp?.role || (email.toLowerCase().includes("manager") ? "manager" : "employee");
      if (role === "manager") {
        nav("/dashboard");
      } else {
        nav("/employee-dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      {/* Left Illustration Section */}
      <div
        className="left-art"
        style={{
          backgroundImage: `url(${LoginIllustration})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Right Login Card Wrapper Section */}
      <div className="right-card-wrapper">
        <div className="right-panel">
          <div className="login-card">
          <h2>Welcome Back</h2>
          <p>Please enter your details to log in</p>

          <form onSubmit={handleSubmit}>
            
            {/* Email Input Group */}
            <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input 
                    id="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your email" 
                    type="email" 
                    required 
                />
            </div>

            {/* Password Input Group */}
            <div className="input-group">
                <label htmlFor="password">Password</label>
                <input 
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password" 
                    placeholder="Enter your password" 
                    required 
                />
            </div>

            <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Log In"}</button>
            {error && <div style={{ color: "#c0392b", marginTop: 10 }}>{error}</div>}
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}