import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBusiness, getServices, getSlots, createAppointment } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import styles from './BusinessDetail.module.css'
const today = new Date().toISOString().split('T')[0]
export default function BusinessDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [slots, setSlots] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState(null)

  // add this state at the top with other states
const [slotDate, setSlotDate] = useState(today)

// add today constant at top of file outside component


  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    try {
      const [bizRes, svcRes, slotRes] = await Promise.all([
        getBusiness(id),
        getServices(id),
        getSlots(id, { available: 'true' }),
      ])
      setBusiness(bizRes.data)
      setServices(svcRes.data)
      setSlots(slotRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const isOwner = user && business?.owner?.username === user.username

  const handleBook = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/businesses/${id}` } })
      return
    }
    if (!selectedService || !selectedSlot) {
      setError('Please select a service and a slot')
      return
    }
    setBooking(true)
    setError(null)
    try {
      await createAppointment({
        service_id: selectedService,
        slot_id: selectedSlot,
      })
      alert('Appointment booked! Awaiting confirmation from business.')
      navigate('/appointments')
    } catch (e) {
      setError(e.response?.data?.detail || 'Booking failed. Try again.')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <div className={styles.loader}>Loading...</div>
  if (!business) return <div className={styles.loader}>Business not found.</div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.fieldBadge}>{business.business_field || 'General'}</span>
          <h1 className={styles.bizName}>{business.business_name}</h1>
          <p className={styles.bizAddress}>📍 {business.address}</p>
          {business.domain && <p className={styles.bizDomain}>🌐 {business.domain}</p>}
          <p className={styles.bizOwner}>Managed by {business.owner?.username}</p>
        </div>
      </div>

      <div className={styles.body}>

        {/* Services */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Services</h2>
          {services.length === 0 ? (
            <p className={styles.empty}>No services listed yet.</p>
          ) : (
            <div className={styles.serviceGrid}>
              {services.map((svc) => (
                <div
                  key={svc.service_id}
                  className={`${styles.serviceCard} ${selectedService === svc.service_id ? styles.selected : ''}`}
                  onClick={() => setSelectedService(svc.service_id)}
                >
                  <h3 className={styles.svcName}>{svc.service_name}</h3>
                  {svc.service_desc && <p className={styles.svcDesc}>{svc.service_desc}</p>}
                  <p className={styles.svcCharge}>₹{svc.service_charge}</p>
                  {selectedService === svc.service_id && (
                    <span className={styles.checkmark}>✓ Selected</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Slots */}
        {/* Slots */}
<section className={styles.section}>
  <h2 className={styles.sectionTitle}>Available Slots</h2>

  <div className={styles.datePicker}>
    <label className={styles.dateLabel}>Select Date</label>
    <input
      type="date"
      value={slotDate}
      min={today}
      onChange={(e) => {
        setSlotDate(e.target.value)
        setSelectedSlot(null)
      }}
      className={styles.dateInput}
    />
  </div>

  {(() => {
    const filteredSlots = slots.filter((s) => s.date === slotDate)
    return filteredSlots.length === 0 ? (
      <p className={styles.empty}>No available slots for this date.</p>
    ) : (
      <div className={styles.slotGrid}>
        {filteredSlots.map((slot) => (
          <div
            key={slot.slot_id}
            className={`${styles.slotCard} ${selectedSlot === slot.slot_id ? styles.selected : ''}`}
            onClick={() => setSelectedSlot(slot.slot_id)}
          >
            <p className={styles.slotTime}>{slot.time.slice(0, 5)}</p>
          </div>
        ))}
      </div>
    )
  })()}
</section>

        {/* Book */}
        <section className={styles.bookSection}>
          {isOwner ? (
            <div className={styles.ownerNotice}>
              🏢 You own this business.{' '}
              <Link to={`/my-businesses/${id}/dashboard`} className={styles.dashLink}>
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <>
              {error && <div className={styles.errorBox}>{error}</div>}
              <button
                onClick={handleBook}
                disabled={booking}
                className={styles.bookBtn}
              >
                {booking ? 'Booking...' : user ? 'Book Appointment' : 'Login to Book'}
              </button>
            </>
          )}
        </section>

      </div>
    </div>
  )
}