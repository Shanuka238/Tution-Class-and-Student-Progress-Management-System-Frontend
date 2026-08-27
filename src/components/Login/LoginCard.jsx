import { useState } from "react";
import { Button } from "antd";
import { SunOutlined, MoonOutlined, WarningOutlined } from "@ant-design/icons";
import { useTheme } from "../../context/ThemeContext";
import LoginFormInputs from "./LoginFormInputs";
import LoginFormOptions from "./LoginFormOptions";
import LoginButton from "./LoginButton";
import ResetPasswordForm from "./ResetPasswordForm";

function LoginCard({ formData, loading, error, onFormChange, onSubmit }) {
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetView, setIsResetView] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="login-right">
      <div className="login-card">
        <div className="card-glow"></div>

        {/* Theme toggle button */}
        <Button
          type="text"
          icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            fontSize: "18px",
          }}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        />

        {isResetView ? (
          <ResetPasswordForm
            initialEmail={formData?.email || ""}
            onBackToLogin={() => setIsResetView(false)}
            onSuccess={(updatedEmail) => {
              setIsResetView(false);
              if (updatedEmail && onFormChange) {
                onFormChange({ target: { name: "email", value: updatedEmail } });
              }
            }}
          />
        ) : (
          <>
            {/* Header */}
            <div className="login-header">
              <h2>Sign In</h2>
              <p>Welcome back! Please enter your details.</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="login-error">
                <WarningOutlined /> <span>{error}</span>
              </div>
            )}


            {/* Form */}
            <form onSubmit={onSubmit} className="login-form">
              <LoginFormInputs
                formData={formData}
                focusedField={focusedField}
                showPassword={showPassword}
                onFocusField={setFocusedField}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onChange={onFormChange}
              />

              <LoginFormOptions onForgotPassword={() => setIsResetView(true)} />

              <LoginButton loading={loading} />
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginCard;

