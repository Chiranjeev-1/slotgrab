import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { resetPassword } from '../../api/axios'
import styles from './ResetPassword.module.css'

export default function ResetPassword() {
  const { uid, token } = useParams()

  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await resetPassword({ uid, token, password })
      setMessage(res.data.message)
    } catch (err) {
      setError('Invalid or expired link. Request a new one.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Icon */}
        <div className={styles.iconWrap}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h2 className={styles.title}>Set new password</h2>
        <p className={styles.subtitle}>
          Choose something strong you haven't used before.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>New password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={styles.input}
            />
            <p className={styles.hint}>At least 8 characters.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Saving...' : 'Reset password'}
          </button>
        </form>

        {message && <p className={styles.message}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}

        <Link to="/login" className={styles.backLink}>
          ← Back to login
        </Link>
      </div>
    </div>
  )
}
