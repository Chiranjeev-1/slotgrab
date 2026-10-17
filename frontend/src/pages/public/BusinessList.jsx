
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getBusinesses } from '../../api/axios'
import styles from './BusinessList.module.css'

export default function BusinessList() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()

  const category = searchParams.get('category') || ''

  useEffect(() => {
    setSearch(category)
    fetchBusinesses(category)
  }, [category])

  const fetchBusinesses = async (query = search) => {
    setLoading(true)
    setError('')

    try {
      const res = await getBusinesses({ search: query })
      setBusinesses(res.data)
    } catch (e) {
      console.error(e)
      setBusinesses([])
      setError('Unable to load businesses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchBusinesses()
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Find your next favourite.</h1>

        <p className={styles.subtitle}>
          Discover trusted professionals and book services
          that fit your schedule.
        </p>

        <form onSubmit={handleSearch} className={styles.searchBar}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, location or category..."
            className={styles.searchInput}
            aria-label="Search businesses"
          />

          <button type="submit" className={styles.searchBtn} disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </header>

      <main className={styles.container}>
        {loading ? (
          <div className={styles.loader} role="status">
            Finding businesses for you…
          </div>
        ) : error ? (
          <div className={styles.empty} role="alert">
            <p>{error}</p>
            <button
              type="button"
              className={styles.searchBtn}
              onClick={() => fetchBusinesses()}
            >
              Try again
            </button>
          </div>
        ) : businesses.length === 0 ? (
          <div className={styles.empty}>
            No businesses found. Try another search or category.
          </div>
        ) : (
          <div className={styles.grid}>
            {businesses.map((b) => (
              <Link
                key={b.business_id}
                to={`/businesses/${b.business_id}`}
                className={styles.card}
              >
                <div className={styles.cardTop}>
                  <span className={styles.fieldBadge}>
                    {b.business_field || 'General'}
                  </span>
                </div>

                <h2 className={styles.bizName}>{b.business_name}</h2>

                {b.address && (
                  <p className={styles.bizAddress}>
                    <span aria-hidden="true">⌖ </span>
                    {b.address}
                  </p>
                )}

                {b.domain && (
                  <p className={styles.bizDomain}>
                    <span aria-hidden="true">↗ </span>
                    {b.domain}
                  </p>
                )}

                <div className={styles.cardFooter}>
                  <span className={styles.ownerName}>
                    By {b.owner?.username || 'Business owner'}
                  </span>

                  <span className={styles.viewBtn}>
                    View details <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
