import { useState, useEffect, useRef } from 'react'
import '../styles/Login.css'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const cardRef = useRef(null)
  const leftPanelRef = useRef(null)

  // Parallax effect on mouse move (left panel)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!leftPanelRef.current) return
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      const x = (clientX / innerWidth - 0.5) * 20
      const y = (clientY / innerHeight - 0.5) * 20

      const shapes = leftPanelRef.current.querySelectorAll('.parallax-shape')
      shapes.forEach((shape, i) => {
        const depth = (i + 1) * 0.5
        shape.style.transform = `translate(${x * depth}px, ${y * depth}px)`
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // 3D tilt effect on the login card
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -5
    const rotateY = ((x - centerX) / centerX) * 5
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`
  }

  const handleCardMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)'
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulated login
    setTimeout(() => {
      console.log('Login Data:', formData)
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="login-container">
      {/* ============ LEFT PANEL ============ */}
      <div className="login-left" ref={leftPanelRef}>
        {/* Animated background shapes */}
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

        <div className="login-left-content">
          <div className="brand-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="brand-name">EduTracker</h1>
          </div>

          <h2 className="left-headline">
            Welcome to the<br/>
            <span className="gradient-text">Future of Learning</span>
          </h2>

          <p className="left-subtext">
            Tution class & Student Progress management system for admins, teachers, students & parents — 
            all in one beautiful platform.
          </p>

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

      {/* ============ RIGHT PANEL (LOGIN FORM) ============ */}
      <div className="login-right">
        <div
          className="login-card"
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="card-glow"></div>

          <div className="login-header">
            <h2>Sign In</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>


          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className={`input-group ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className={`input-group ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'filled' : ''}`}>
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            {/* Submit */}
            <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>

            <div className="divider">
              <span>or continue with</span>
            </div>

            <p className="signup-text">
              Don't have an account? <a href="#">Contact your admin</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login