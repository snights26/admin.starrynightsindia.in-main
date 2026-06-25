import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Utils/api";
import { setAdminUser, setSession } from "../Utils/auth";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "admin@starrynightsindia.in",
    password: "Admin@123",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await api.post("/auth/login", {
        username: form.username,
        email: form.username,
        password: form.password,
      });
      setSession(data.accessToken, new Date(data.accessTokenExpiresAt).getTime());
      localStorage.setItem("adminRefreshToken", data.refreshToken);
      setAdminUser(data.user);
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/Starry Nights Holidays.png" alt="Starry Nights Holidays" className="login-logo" />
        <h1>STARRY NIGHTS HOLIDAYS</h1>
        <p>Secure Login for Admin Access</p>

        <form onSubmit={handleLogin}>
          <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
          <div className="password-wrapper">
            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
