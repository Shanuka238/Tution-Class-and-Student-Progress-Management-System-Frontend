import { useState, useRef } from "react";
import LoginFormInputs from "./LoginFormInputs";
import LoginFormOptions from "./LoginFormOptions";
import LoginButton from "./LoginButton";

function LoginCard({ formData, loading, error, onFormChange, onSubmit }) {
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const cardRef = useRef(null);

  // 3D tilt effect
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
  };

  const handleCardMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
    }
  };

  return (
    <div className="login-right">
      <div
        className="login-card"
        ref={cardRef}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
      >
        <div className="card-glow"></div>

        {/* Header */}
        <div className="login-header">
          <h2>Sign In</h2>
          <p>Welcome back! Please enter your details.</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="login-error">
            <span>⚠️</span> {error}
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

          <LoginFormOptions />

          <LoginButton loading={loading} />

          <p className="signup-text">
            Don't have an account? <a href="#">Contact your admin</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginCard;
