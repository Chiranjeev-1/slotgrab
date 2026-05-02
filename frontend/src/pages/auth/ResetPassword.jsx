import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { resetPassword } from '../../api/axios'
import styles from './Auth.module.css'

export default function ResetPassword() {
  const { uid, token } = useParams()

  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const res = await resetPassword({
        uid,
        token,
        password
      })
      setMessage(res.data.message)
    } catch (err) {
      setError('Invalid or expired link')
    }
  }

  return (
    <div className={styles.page}>
  <div className={styles.card}>
    <h2 className={styles.title}>Reset Password</h2>
    <p className={styles.subtitle}>Enter your new password</p>

    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />

      <button className={styles.submitBtn}>
        Reset Password
      </button>
    </form>

    {message && <p className={styles.message}>{message}</p>}
    {error && <p className={styles.error}>{error}</p>}
  </div>
</div>
  )
}