
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
    setMenuOpen(false)
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoMark}>a.</span>
          <span>appointly<span className={styles.logoDot}>.</span></span>
        </Link>

        <button
          type="button"
          className={`${styles.hamburger} ${
            menuOpen ? styles.hamburgerOpen : ''
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <div
          id="main-navigation"
          className={`${styles.links} ${menuOpen ? styles.open : ''}`}
        >
          <Link
            to="/businesses"
            onClick={closeMenu}
            className={`${styles.link} ${
              isActive('/businesses') ? styles.activeLink : ''
            }`}
          >
            Explore
          </Link>

          {user ? (
            <>
              <Link
                to="/appointments"
                onClick={closeMenu}
                className={`${styles.link} ${
                  isActive('/appointments') ? styles.activeLink : ''
                }`}
              >
                My Appointments
              </Link>

              <Link
                to="/my-businesses"
                onClick={closeMenu}
                className={`${styles.link} ${
                  isActive('/my-businesses') ? styles.activeLink : ''
                }`}
              >
                My Businesses
              </Link>

              <div className={styles.userMenu}>
                <span className={styles.username}>
                  Hi, {user.username}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className={styles.logoutBtn}
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className={styles.authLinks}>
              <Link
                to="/login"
                onClick={closeMenu}
                className={`${styles.loginBtn} ${
                  isActive('/login') ? styles.activeLoginBtn : ''
                }`}
              >
                Log in
              </Link>

              <Link
                to="/signup"
                onClick={closeMenu}
                className={styles.signupBtn}
              >
                Get Started <span>↗</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
