import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyBusinesses } from '../../api/axios'
import styles from './MyBusinesses.module.css'

export default function MyBusinesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyBusinesses()
      .then((res) => setBusinesses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>My Businesses</h1>
          <Link to="/my-businesses/new" className={styles.addBtn}>+ Add Business</Link>
        </div>

        {loading ? (
          <div className={styles.loader}>Loading...</div>
        ) : businesses.length === 0 ? (
          <div className={styles.empty}>
            <p>You haven't created any businesses yet.</p>
            <Link to="/my-businesses/new" className={styles.createBtn}>Create your first business</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {businesses.map((b) => (
              <div key={b.business_id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.fieldBadge}>{b.business_field || 'General'}</span>
                </div>
                <h3 className={styles.bizName}>{b.business_name}</h3>
                <p className={styles.bizAddress}>📍 {b.address}</p>
                <div className={styles.cardActions}>
                  <Link
                    to={`/my-businesses/${b.business_id}/dashboard`}
                    className={styles.dashboardBtn}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={`/my-businesses/${b.business_id}/edit`}
                    className={styles.editBtn}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}