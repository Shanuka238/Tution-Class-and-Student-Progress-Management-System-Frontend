function LoginFormOptions() {
  return (
    <div className="form-options">
      <label className="remember-me">
        <input type="checkbox" />
        <span className="checkmark"></span>
        Remember me
      </label>
      <a href="#" className="forgot-link">
        Forgot password?
      </a>
    </div>
  );
}

export default LoginFormOptions;
