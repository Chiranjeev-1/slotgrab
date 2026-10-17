import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Auth.module.css'
import { GoogleLogin } from '@react-oauth/google'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(formData.email, formData.password)
      navigate(from, { replace: true })
    } catch (err) {
      const data = err.response?.data
      const message = data
        ? Object.values(data).flat().join(' ')
        : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (response) => {
    try {
      await loginWithGoogle(response.credential)
      navigate(from, { replace: true })
    } catch (err) {
      console.log(err.response?.data)
      setError('Google login failed. Try again.')
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Left brand panel (hidden on mobile) ── */}
      <div className={styles.brandPanel}>
        <div className={styles.brandLogo}>
          <div className={styles.brandIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className={styles.brandName}>Appointly</span>
        </div>

        <div className={styles.brandBody}>
          <h2 className={styles.brandHeadline}>
            Book smarter,<br />
            <span className={styles.brandAccent}>grow faster.</span>
          </h2>
          <p className={styles.brandDesc}>
            The all-in-one scheduling platform for professionals
            who value their time and their clients'.
          </p>
          <div className={styles.brandBadges}>
            <span className={styles.badge}>Zero double-bookings</span>
            <span className={styles.badge}>Instant confirmations</span>
            <span className={styles.badge}>Free to start</span>
          </div>
        </div>

        <div className={styles.brandStats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>12k+</span>
            <span className={styles.statLabel}>Businesses</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>98%</span>
            <span className={styles.statLabel}>Uptime</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>4.9★</span>
            <span className={styles.statLabel}>Avg rating</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>Login to your Appointly account</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.googleWrapper}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed. Try again.')}
            />
          </div>

          <p className={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/signup" className={styles.switchLink}>Sign up</Link>
            <Link to="/forgot-password" className={styles.forgotLink}>Forgot your password?</Link>
          </p>
        </div>
      </div>

    </div>
  )
}
