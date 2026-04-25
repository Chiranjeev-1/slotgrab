import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getBusinesses } from '../../api/axios'
import styles from './BusinessList.module.css'

export default function BusinessList() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const category = searchParams.get('category') || ''
    setSearch(category)
    fetchBusinesses(category)
  }, [])

  const fetchBusinesses = async (q = search) => {
    setLoading(true)
    try {
      const res = await getBusinesses({ search: q })
      setBusinesses(res.data)
    } catch (e) {
      console.error(e)
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
      <div className={styles.header}>
        <h1 className={styles.title}>Find a Business</h1>
        <p className={styles.subtitle}>Browse and book from top service providers</p>

        <form onSubmit={handleSearch} className={styles.searchBar}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, location or category..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
        </form>
      </div>

      <div className={styles.container}>
        {loading ? (
          <div className={styles.loader}>Loading businesses...</div>
        ) : businesses.length === 0 ? (
          <div className={styles.empty}>No businesses found. Try a different search.</div>
        ) : (
          <div className={styles.grid}>
            {businesses.map((b) => (
              <Link
                key={b.business_id}
                to={`/businesses/${b.business_id}`}
                className={styles.card}
              >
                <div className={styles.cardTop}>
                  <span className={styles.fieldBadge}>{b.business_field || 'General'}</span>
                </div>
                <h3 className={styles.bizName}>{b.business_name}</h3>
                <p className={styles.bizAddress}>📍 {b.address}</p>
                {b.domain && (
                  <p className={styles.bizDomain}>🌐 {b.domain}</p>
                )}
                <div className={styles.cardFooter}>
                  <span className={styles.ownerName}>by {b.owner?.username}</span>
                  <span className={styles.viewBtn}>View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}