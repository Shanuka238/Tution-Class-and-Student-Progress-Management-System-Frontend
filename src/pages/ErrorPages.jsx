import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Unauthorized() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", maxWidth: 500, margin: "0 auto" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🚫</div>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Access Denied</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
        Your role <strong>{user?.role}</strong> does not have permission to access this page.
      </p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <button onClick={() => navigate("/dashboard")} style={{ padding: "10px 20px", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
          ← Back to Dashboard
        </button>
        <button onClick={() => { logout(); navigate("/login"); }} style={{ padding: "10px 20px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", cursor: "pointer" }}>
          Switch Account
        </button>
      </div>
    </div>
  );
}

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", maxWidth: 500, margin: "0 auto" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔍</div>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>404 — Page Not Found</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button onClick={() => navigate("/dashboard")} style={{ padding: "10px 24px", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
        ← Back to Dashboard
      </button>
    </div>
  );
}
