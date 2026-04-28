import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Auth.module.css'
import { useGoogleLogin } from '@react-oauth/google'

export default function Signup() {
  const { signup } = useAuth()
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
  const { loginWithGoogle } = useAuth()

const handleGoogleLogin = useGoogleLogin({
  onSuccess: async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse)
      navigate(from || '/')
    } catch (err) {
      setError('Google login failed. Try again.')
    }
  },
  onError: () => setError('Google login failed. Try again.'),
  flow: 'auth-code',
})

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

<button
  type="button"
  onClick={handleGoogleLogin}
  className={styles.googleBtn}
>
  <svg viewBox="0 0 24 24" className={styles.googleIcon}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  Continue with Google
</button>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>Login</Link>
        </p>
      </div>
    </div>
  )
}