import { Link } from 'react-router-dom'
import styles from './Landing.module.css'

export default function Landing() {
  const steps = [
    { icon: '🔍', title: 'Find a Business', desc: 'Browse hundreds of service providers across categories' },
    { icon: '📅', title: 'Pick a Slot', desc: 'Choose a date and time that works for you' },
    { icon: '✅', title: 'Get Confirmed', desc: 'Receive instant booking confirmation' },
  ]

  const categories = [
    { icon: '🏥', name: 'Healthcare' },
    { icon: '💇', name: 'Beauty & Salon' },
    { icon: '🏋️', name: 'Fitness' },
    { icon: '⚖️', name: 'Legal' },
    { icon: '💼', name: 'Consulting' },
    { icon: '🎓', name: 'Education' },
  ]

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>✨ Book smarter, not harder</span>
          <h1 className={styles.heroTitle}>
            Appointments made <span className={styles.highlight}>effortless</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Discover and book appointments with top service providers near you. Fast, easy, and reliable.
          </p>
          <div className={styles.heroActions}>
            <Link to="/businesses" className={styles.primaryBtn}>Browse Businesses</Link>
            <Link to="/signup" className={styles.secondaryBtn}>List Your Business</Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.card1}>
            <span>📅</span>
            <div>
              <p className={styles.cardTitle}>Appointment Confirmed</p>
              <p className={styles.cardSub}>Tomorrow at 10:00 AM</p>
            </div>
          </div>
          <div className={styles.card2}>
            <span>⭐</span>
            <div>
              <p className={styles.cardTitle}>500+ Businesses</p>
              <p className={styles.cardSub}>Ready to book</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Browse by Category</h2>
        <div className={styles.categories}>
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/businesses?category=${cat.name}`}
              className={styles.categoryCard}
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <span className={styles.categoryName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howSection}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.steps}>
          {steps.map((step, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Own a business?</h2>
        <p className={styles.ctaSubtitle}>
          Start managing your appointments professionally with Appointly
        </p>
        <Link to="/signup" className={styles.ctaBtn}>Get Started Free</Link>
      </section>

    </div>
  )
}