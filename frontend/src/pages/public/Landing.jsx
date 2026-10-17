
import { Link } from 'react-router-dom'
import styles from './Landing.module.css'

export default function Landing() {
  const steps = [
    {
      number: '01',
      icon: '⌕',
      title: 'Discover services',
      desc: 'Find trusted professionals and businesses that match your needs.',
    },
    {
      number: '02',
      icon: '▦',
      title: 'Choose your time',
      desc: 'Explore available slots and book a time that fits your schedule.',
    },
    {
      number: '03',
      icon: '✓',
      title: 'You’re all set',
      desc: 'Get your booking details and manage your appointments with ease.',
    },
  ]

  const categories = [
    { icon: '✚', name: 'Healthcare', color: 'mint' },
    { icon: '✳', name: 'Beauty & Salon', color: 'peach' },
    { icon: '↗', name: 'Fitness', color: 'blue' },
    { icon: '⌂', name: 'Home Services', color: 'sand' },
    { icon: '◎', name: 'Consulting', color: 'lavender' },
    { icon: '▤', name: 'Education', color: 'mint' },
  ]

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            YOUR TIME, WELL SPENT
          </div>

          <h1 className={styles.heroTitle}>
            Good things happen
            <br />
            when you <span className={styles.highlight}>make time.</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Discover trusted local businesses and book the services
            you need, all in one simple place.
          </p>

          <div className={styles.heroActions}>
            <Link to="/businesses" className={styles.primaryBtn}>
              Explore services <span>↗</span>
            </Link>
            <Link to="/signup" className={styles.secondaryBtn}>
              List your business
            </Link>
          </div>

          <div className={styles.socialProof}>
            <div className={styles.avatarStack}>
              <span>R</span>
              <span>A</span>
              <span>M</span>
              <span>S</span>
            </div>
            <div>
              <div className={styles.stars}>★★★★★</div>
              <p>One less thing to worry about.</p>
            </div>
          </div>
        </div>

        {/* Booking preview */}
        <div className={styles.heroVisual}>
          <div className={styles.visualGlow} />

          <div className={styles.imageCard}>
            <div className={styles.imagePlaceholder}>
              <div className={styles.imageOverlay}>
                <span className={styles.imageLabel}>
                  YOUR NEXT APPOINTMENT
                </span>
                <h3>A little time for yourself.</h3>
              </div>
            </div>

            <div className={styles.bookingCard}>
              <div className={styles.bookingTop}>
                <div className={styles.bookingIcon}>✳</div>
                <div className={styles.bookingDetails}>
                  <p className={styles.bookingName}>Glow Studio</p>
                  <p className={styles.bookingMeta}>
                    Beauty & Wellness · 45 min
                  </p>
                </div>
                <span className={styles.confirmed}>Available</span>
              </div>

              <div className={styles.bookingDivider} />

              <div className={styles.bookingBottom}>
                <div>
                  <span className={styles.mutedLabel}>NEXT AVAILABLE</span>
                  <p className={styles.bookingTime}>Tomorrow, 10:00 AM</p>
                </div>
                <Link to="/businesses" className={styles.miniButton}>
                  Book <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.floatingNote}>
            <span className={styles.floatingIcon}>✓</span>
            <div>
              <p className={styles.floatingTitle}>Your time matters</p>
              <p className={styles.floatingSubtitle}>
                Booking made simple
              </p>
            </div>
          </div>

          <div className={styles.decorCircle} />
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionEyebrow}>EXPLORE & DISCOVER</span>
            <h2 className={styles.sectionTitle}>
              What can we help you <span>book?</span>
            </h2>
          </div>

          <Link to="/businesses" className={styles.textLink}>
            View all services <span>→</span>
          </Link>
        </div>

        <div className={styles.categories}>
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/businesses?category=${encodeURIComponent(cat.name)}`}
              className={styles.categoryCard}
            >
              <div
                className={`${styles.categoryIcon} ${styles[cat.color]}`}
              >
                {cat.icon}
              </div>
              <span className={styles.categoryName}>{cat.name}</span>
              <span className={styles.categoryArrow}>↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howSection}>
        <div className={styles.howIntro}>
          <span className={styles.sectionEyebrow}>SIMPLE BY DESIGN</span>
          <h2 className={styles.sectionTitle}>
            Your next appointment,
            <br />
            <span>in three easy steps.</span>
          </h2>
          <p className={styles.howSubtitle}>
            No back-and-forth calls. No unnecessary hassle.
            Just a better way to book.
          </p>
        </div>

        <div className={styles.steps}>
          {steps.map((step) => (
            <div key={step.number} className={styles.step}>
              <div className={styles.stepTop}>
                <div className={styles.stepIcon}>{step.icon}</div>
                <span className={styles.stepNumber}>{step.number}</span>
              </div>

              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Business CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <span className={styles.ctaEyebrow}>
            FOR BUSINESS OWNERS
          </span>
          <h2 className={styles.ctaTitle}>
            You take care of business.
            <br />
            We’ll help with the bookings.
          </h2>
          <p className={styles.ctaSubtitle}>
            Spend less time managing schedules and more time doing
            what you do best.
          </p>
          <Link to="/signup" className={styles.ctaBtn}>
            Get started for free <span>→</span>
          </Link>
        </div>

        <div className={styles.ctaDecoration}>
          <div className={styles.ctaCircle}>
            <span>✳</span>
          </div>
          <div className={styles.ctaSmallCircle} />
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <Link to="/" className={styles.logo}>
          app<span>ointly.</span>
        </Link>
        <p>Make room for what matters.</p>
        <Link to="/businesses" className={styles.footerLink}>
          Find your next appointment →
        </Link>
      </footer>
    </div>
  )
}
