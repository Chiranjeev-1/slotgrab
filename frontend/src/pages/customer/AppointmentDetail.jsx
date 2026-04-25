import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAppointment, cancelAppointment } from '../../api/axios'
import styles from './AppointmentDetail.module.css'

const statusColors = {
  pending: '#f59e0b',
  confirmed: '#6c63ff',
  completed: '#10b981',
  cancelled: '#ef4444',
}

export default function AppointmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    getAppointment(id)
      .then((res) => setAppointment(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    setCancelling(true)
    try {
      await cancelAppointment(id)
      setAppointment((prev) => ({ ...prev, status: 'cancelled' }))
    } catch (e) {
      console.error(e)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className={styles.loader}>Loading...</div>
  if (!appointment) return <div className={styles.loader}>Appointment not found.</div>

  const canCancel = appointment.status !== 'cancelled' && appointment.status !== 'completed'

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.back}>← Back</button>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>Appointment Details</h1>
            <span
              className={styles.statusBadge}
              style={{
                background: statusColors[appointment.status] + '20',
                color: statusColors[appointment.status]
              }}
            >
              {appointment.status}
            </span>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Service</span>
              <span className={styles.detailValue}>{appointment.service?.service_name}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Business</span>
              <span className={styles.detailValue}>{appointment.service?.business?.business_name}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Charge</span>
              <span className={styles.detailValue}>₹{appointment.service?.service_charge}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Date</span>
              <span className={styles.detailValue}>{appointment.slot?.date}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Time</span>
              <span className={styles.detailValue}>{appointment.slot?.time}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Booked on</span>
              <span className={styles.detailValue}>
                {new Date(appointment.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className={styles.cancelBtn}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}