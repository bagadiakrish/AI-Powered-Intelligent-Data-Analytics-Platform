import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../../services/auth";
import "./LoginForm.css";

function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(formData.username, formData.password);
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("username", data.user.username);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      
      <label htmlFor="login-username">Username</label>
      <input
        id="login-username"
        name="username"
        type="text"
        placeholder="Enter your username"
        value={formData.username}
        onChange={handleChange}
        required
      />

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        name="password"
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <button type="submit" className="login-btn" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>

      <div className="register-link">
        Don't have an account? 
        <Link to="/register">Register</Link>
      </div>
    </form>
  );
}

export default LoginForm;
