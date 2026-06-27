function LoginButton({ loading }) {
  return (
    <button
      type="submit"
      className={`login-btn ${loading ? "loading" : ""}`}
      disabled={loading}
    >
      {loading ? (
        <span className="spinner"></span>
      ) : (
        <>
          <span>Sign In</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </>
      )}
    </button>
  );
}

export default LoginButton;
