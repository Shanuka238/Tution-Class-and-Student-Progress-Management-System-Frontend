import { useEffect, useRef } from "react";

function LoginLeftPanel() {
  const leftPanelRef = useRef(null);

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!leftPanelRef.current) return;
      const shapes = leftPanelRef.current.querySelectorAll(".parallax-shape");
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      shapes.forEach((shape, i) => {
        const depth = (i + 1) * 0.5;
        shape.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="login-left" ref={leftPanelRef}>
      {/* Parallax shapes */}
      <div className="parallax-shape shape-1"></div>
      <div className="parallax-shape shape-2"></div>
      <div className="parallax-shape shape-3"></div>
      <div className="parallax-shape shape-4"></div>
      <div className="parallax-shape shape-5"></div>

      {/* Floating icons */}
      <div className="floating-icon icon-1">📚</div>
      <div className="floating-icon icon-2">🎓</div>
      <div className="floating-icon icon-3">✏️</div>
      <div className="floating-icon icon-4">📊</div>

      {/* Content */}
      <div className="login-left-content">
        {/* Brand Logo */}
        <div className="brand-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="brand-name">EduTracker</h1>
        </div>

        {/* Headline */}
        <h2 className="left-headline">
          Welcome to the<br />
          <span className="gradient-text">Future of Learning</span>
        </h2>
        <p className="left-subtext">
          Tution class & Student Progress management system for admins, teachers, students & parents — 
            all in one beautiful platform.
        </p>

        {/* Features */}
        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-icon">📈</div>
            <div className="feature-text">
              <h4>Real-time Progress</h4>
              <p>Track student performance instantly</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🤖</div>
            <div className="feature-text">
              <h4>AI Assistant</h4>
              <p>Powered by Google Gemini</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">💳</div>
            <div className="feature-text">
              <h4>Secure Payments</h4>
              <p>Pay tuition fees online safely</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginLeftPanel;
