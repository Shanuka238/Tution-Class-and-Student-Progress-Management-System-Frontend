import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_DASHBOARD, DEFAULT_DASHBOARD } from "../enums/userRoles";
import LoginLeftPanel from "../components/Login/LoginLeftPanel";
import LoginCard from "../components/Login/LoginCard";
import "../styles/Login.css";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({
        email: formData.email,
        password: formData.password,
      });

      // Redirect to role-specific dashboard
      const dashboardPath = ROLE_DASHBOARD[user.role] || DEFAULT_DASHBOARD;
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <LoginLeftPanel />
      <LoginCard
        formData={formData}
        loading={loading}
        error={error}
        onFormChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default LoginPage;
