import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          
          Appointly
        </Link>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          <Link
            to="/businesses"
            className={`${styles.link} ${isActive('/businesses') ? styles.activeLink : ''}`}
          >
            Browse
          </Link>

          {user ? (
            <>
              <Link
                to="/appointments"
                className={`${styles.link} ${isActive('/appointments') ? styles.activeLink : ''}`}
              >
                My Appointments
              </Link>
              <Link
                to="/my-businesses"
                className={`${styles.link} ${isActive('/my-businesses') ? styles.activeLink : ''}`}
              >
                My Businesses
              </Link>
              <div className={styles.userMenu}>
                <span className={styles.username}>Hi, {user.username}</span>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className={styles.authLinks}>
              <Link
                to="/login"
                className={`${styles.loginBtn} ${isActive('/login') ? styles.activeLoginBtn : ''}`}
              >
                Login
              </Link>
              <Link to="/signup" className={styles.signupBtn}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}