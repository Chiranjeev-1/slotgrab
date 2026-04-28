import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* Top section */}
        <div className={styles.top}>

          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <span>📅</span> Appointly
            </Link>

            <p className={styles.tagline}>
              Book smarter, not harder. Connect with top service providers near you.
            </p>

            <div className={styles.socials}>

              {/* GitHub */}
              <a
                href="https://github.com/Chiranjeev-1"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className={styles.socialIcon}>
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/yourprofile"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className={styles.socialIcon}>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                </svg>
              </a>

              {/* Twitter */}
              <a
                href="https://twitter.com/yourhandle"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
                aria-label="Twitter"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className={styles.socialIcon}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/yourhandle"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className={styles.socialIcon}>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07..." />
                </svg>
              </a>

            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>Explore</h4>
            <ul className={styles.linkList}>
              <li><Link to="/" className={styles.footerLink}>Home</Link></li>
              <li><Link to="/businesses" className={styles.footerLink}>Browse Businesses</Link></li>
              <li><Link to="/businesses?category=Healthcare" className={styles.footerLink}>Healthcare</Link></li>
              <li><Link to="/businesses?category=Beauty & Salon" className={styles.footerLink}>Beauty & Salon</Link></li>
              <li><Link to="/businesses?category=Fitness" className={styles.footerLink}>Fitness</Link></li>
            </ul>
          </div>

          {/* For Business */}
          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>For Business</h4>
            <ul className={styles.linkList}>
              <li><Link to="/signup" className={styles.footerLink}>List Your Business</Link></li>
              <li><Link to="/my-businesses" className={styles.footerLink}>My Businesses</Link></li>
              <li><Link to="/my-businesses/new" className={styles.footerLink}>Create Business</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>Account</h4>
            <ul className={styles.linkList}>
              <li><Link to="/login" className={styles.footerLink}>Login</Link></li>
              <li><Link to="/signup" className={styles.footerLink}>Sign Up</Link></li>
              <li><Link to="/appointments" className={styles.footerLink}>My Appointments</Link></li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} Appointly. Built by{' '}
            <a
              href="https://github.com/Chiranjeev-1"
              target="_blank"
              rel="noreferrer"
              className={styles.authorLink}
            >
              Chiranjeev
            </a>
          </p>

          <div className={styles.bottomLinks}>
            <span className={styles.bottomLink}>Privacy Policy</span>
            <span className={styles.dot}>·</span>
            <span className={styles.bottomLink}>Terms of Service</span>
            <span className={styles.dot}>·</span>
            <span className={styles.bottomLink}>Contact</span>
          </div>
        </div>

      </div>
    </footer>
  )
}