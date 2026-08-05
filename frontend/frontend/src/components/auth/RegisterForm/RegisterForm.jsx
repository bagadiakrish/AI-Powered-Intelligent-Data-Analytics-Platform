import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../../services/auth";
import "./RegisterForm.css";

function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "Member" });
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
      const data = await registerUser(
        formData.username,
        formData.email,
        formData.password,
        formData.role
      );
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("username", data.user.username);
      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err.response?.data
        ? Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")
        : "Failed to create user account.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}

      <label htmlFor="reg-username">Username</label>
      <input
        id="reg-username"
        name="username"
        type="text"
        placeholder="Choose username"
        value={formData.username}
        onChange={handleChange}
        required
      />

      <label htmlFor="reg-email">Email</label>
      <input
        id="reg-email"
        name="email"
        type="email"
        placeholder="Enter email address"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <label htmlFor="reg-password">Password</label>
      <input
        id="reg-password"
        name="password"
        type="password"
        placeholder="Enter secure password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <label htmlFor="reg-role">Role</label>
      <select
        id="reg-role"
        name="role"
        value={formData.role}
        onChange={handleChange}
      >
        <option value="Member">Student/Member</option>
        <option value="Researcher">Researcher</option>
        <option value="Administrator">Administrator</option>
      </select>

      <button type="submit" className="register-btn" disabled={loading}>
        {loading ? "Creating Account..." : "Register"}
      </button>

      <div className="login-link">
        Already have an account? 
        <a href="/login">Login</a>
      </div>
    </form>
  );
}

export default RegisterForm;
