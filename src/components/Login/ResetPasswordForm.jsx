import { useState } from "react";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { authAPI } from "../../services/api";

function ResetPasswordForm({ initialEmail = "", onBackToLogin, onSuccess }) {
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!newPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.");
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.resetPassword({
        email: email.trim(),
        newPassword,
      });

      setSuccessMsg(res?.message || "Password updated successfully! Returning to Sign In...");
      setTimeout(() => {
        if (onSuccess) onSuccess(email);
      }, 1500);
    } catch (err) {
      setError(err?.message || "Failed to reset password. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-view">
      {/* Header */}
      <div className="login-header">
        <h2>Reset Password</h2>
        <p>Enter your email and set your new password.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="login-error">
          <WarningOutlined /> <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "12px",
            color: "#10B981",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          <CheckCircleOutlined /> <span>{successMsg}</span>
        </div>
      )}


      <form onSubmit={handleSubmit} className="login-form">
        {/* Email Input */}
        <div
          className={`input-group ${focusedField === "email" ? "focused" : ""} ${
            email ? "filled" : ""
          }`}
        >
          <label>Registered Email Address</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        {/* New Password Input */}
        <div
          className={`input-group ${focusedField === "newPassword" ? "focused" : ""} ${
            newPassword ? "filled" : ""
          }`}
        >
          <label>New Password</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onFocus={() => setFocusedField("newPassword")}
              onBlur={() => setFocusedField(null)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
              tabIndex={-1}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#667eea",
              }}
            >
              {showNewPassword ? (
                <EyeInvisibleOutlined style={{ fontSize: "16px" }} />
              ) : (
                <EyeOutlined style={{ fontSize: "16px" }} />
              )}
            </button>
          </div>
        </div>

        {/* Confirm New Password Input */}
        <div
          className={`input-group ${focusedField === "confirmPassword" ? "focused" : ""} ${
            confirmPassword ? "filled" : ""
          }`}
        >
          <label>Confirm New Password</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#667eea",
              }}
            >
              {showConfirmPassword ? (
                <EyeInvisibleOutlined style={{ fontSize: "16px" }} />
              ) : (
                <EyeOutlined style={{ fontSize: "16px" }} />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="login-btn"
          disabled={loading}
          style={{ marginTop: "10px", width: "100%" }}
        >
          <span>{loading ? "Updating Password..." : "Update Password →"}</span>
        </button>

        {/* Back to Sign In Link / Button */}
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <button
            type="button"
            onClick={onBackToLogin}
            style={{
              background: "none",
              border: "none",
              color: "#6366f1",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ArrowLeftOutlined style={{ fontSize: "12px" }} /> Back to Sign In
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResetPasswordForm;
