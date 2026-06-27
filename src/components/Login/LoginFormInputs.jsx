// ============================================
// EduTracker — Login Form Inputs
// Email and password input fields
// ============================================

import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

function LoginFormInputs({
  formData,
  focusedField,
  showPassword,
  onFocusField,
  onTogglePassword,
  onChange,
}) {
  return (
    <>
      {/* Email Input */}
      <div
        className={`input-group ${focusedField === "email" ? "focused" : ""} ${
          formData.email ? "filled" : ""
        }`}
      >
        <label>Email Address</label>
        <div className="input-wrapper">
          <span className="input-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            onFocus={() => onFocusField("email")}
            onBlur={() => onFocusField(null)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
      </div>

      {/* Password Input */}
      <div
        className={`input-group ${focusedField === "password" ? "focused" : ""} ${
          formData.password ? "filled" : ""
        }`}
      >
        <label>Password</label>
        <div className="input-wrapper">
          <span className="input-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={onChange}
            onFocus={() => onFocusField("password")}
            onBlur={() => onFocusField(null)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={onTogglePassword}
            tabIndex={-1}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#667eea",
            }}
          >
            {showPassword ? (
              <EyeInvisibleOutlined style={{ fontSize: "16px" }} />
            ) : (
              <EyeOutlined style={{ fontSize: "16px" }} />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default LoginFormInputs;
