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

  // ✅ GOOGLE SIGNUP (same as login)
  const handleGoogleSuccess = async (response) => {
    try {
      const res = await loginWithGoogle(response.credential)

      // Optional: if you add is_new_user later
      // if (res.is_new_user) {
      //   navigate('/complete-profile')
      // } else {
      //   navigate('/my-businesses')
      // }

      navigate('/my-businesses')

    } catch (err) {
      console.log(err.response?.data)
      setError('Google signup failed. Try again.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create account</h2>
          <p className={styles.subtitle}>Join Appointly today</p>
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
              Field / Profession <span className={styles.optional}>(optional)</span>
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        {/* ✅ GOOGLE BUTTON (ID TOKEN FLOW) */}
        <div className={styles.googleWrapper}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google signup failed. Try again.')}
          />
        </div>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}