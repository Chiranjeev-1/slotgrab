import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAppointments } from '../../api/axios'
import styles from './MyAppointments.module.css'

const statusColors = {
  pending: '#f59e0b',
  confirmed: '#6c63ff',
  completed: '#10b981',
  cancelled: '#ef4444',
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAppointments()
      .then((res) => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>My Appointments</h1>

        {loading ? (
          <div className={styles.loader}>Loading...</div>
        ) : appointments.length === 0 ? (
          <div className={styles.empty}>
            <p>No appointments yet.</p>
            <Link to="/businesses" className={styles.browseBtn}>Browse Businesses</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {appointments.map((appt) => (
              <Link
                key={appt.appointment_id}
                to={`/appointments/${appt.appointment_id}`}
                className={styles.card}
              >
                <div className={styles.cardLeft}>
                  <h3 className={styles.serviceName}>{appt.service?.service_name}</h3>
                  <p className={styles.bizName}>{appt.service?.business?.business_name}</p>
                  <div className={styles.slotInfo}>
                    <span>📅 {appt.slot?.date}</span>
                    <span>🕐 {appt.slot?.time}</span>
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <span
                    className={styles.statusBadge}
                    style={{ background: statusColors[appt.status] + '20', color: statusColors[appt.status] }}
                  >
                    {appt.status}
                  </span>
                  <span className={styles.arrow}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}