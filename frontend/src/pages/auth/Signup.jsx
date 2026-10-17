import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Auth.module.css'
import { GoogleLogin } from '@react-oauth/google'

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    field: '',
  })

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
      await signup(formData)
      navigate('/my-businesses')
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
      navigate('/my-businesses')
    } catch (err) {
      console.log(err.response?.data)
      setError('Google signup failed. Try again.')
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
            Your business,<br />
            <span className={styles.brandAccent}>always available.</span>
          </h2>
          <p className={styles.brandDesc}>
            Set up your booking page in minutes. Let clients
            schedule themselves — while you focus on the work.
          </p>
          <div className={styles.brandBadges}>
            <span className={styles.badge}>5-min setup</span>
            <span className={styles.badge}>No credit card</span>
            <span className={styles.badge}>Cancel anytime</span>
          </div>
        </div>

        <div className={styles.brandStats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>12k+</span>
            <span className={styles.statLabel}>Businesses</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>2M+</span>
            <span className={styles.statLabel}>Bookings</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>Free</span>
            <span className={styles.statLabel}>To start</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Create account</h2>
            <p className={styles.subtitle}>Join Appointly today — it's free</p>
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
              <label className={styles.label}>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="johndoe"
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

            <div className={styles.field}>
              <label className={styles.label}>
                Field / Profession{' '}
                <span className={styles.optional}>(optional)</span>
              </label>
              <input
                type="text"
                name="field"
                value={formData.field}
                onChange={handleChange}
                placeholder="e.g. Doctor, Consultant, Trainer"
                className={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.googleWrapper}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google signup failed. Try again.')}
            />
          </div>

          <p className={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.switchLink}>Login</Link>
          </p>
        </div>
      </div>

    </div>
  )
}
