import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getBusiness, getServices, getSlots,
  getBusinessAppointments, deleteService,
  deleteSlot, updateAppointmentStatus
} from '../../api/axios'
import styles from './Dashboard.module.css'

const statusColors = {
  pending: '#f59e0b',
  confirmed: '#6c63ff',
  completed: '#10b981',
  cancelled: '#ef4444',
}

export default function Dashboard() {
  const { id } = useParams()
  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [slots, setSlots] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('appointments')

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    try {
      const [bizRes, svcRes, slotRes, apptRes] = await Promise.all([
        getBusiness(id),
        getServices(id),
        getSlots(id),
        getBusinessAppointments(id),
      ])
      setBusiness(bizRes.data)
      setServices(svcRes.data)
      setSlots(slotRes.data)
      setAppointments(apptRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Delete this service?')) return
    try {
      await deleteService(id, serviceId)
      setServices((prev) => prev.filter((s) => s.service_id !== serviceId))
    } catch (e) { console.error(e) }
  }

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Delete this slot?')) return
    try {
      await deleteSlot(id, slotId)
      setSlots((prev) => prev.filter((s) => s.slot_id !== slotId))
    } catch (e) { console.error(e) }
  }

  const handleStatusUpdate = async (apptId, status) => {
    try {
      await updateAppointmentStatus(id, apptId, status)
      setAppointments((prev) =>
        prev.map((a) => a.appointment_id === apptId ? { ...a, status } : a)
      )
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className={styles.loader}>Loading dashboard...</div>

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/my-businesses" className={styles.back}>← My Businesses</Link>
          <h1 className={styles.bizName}>{business?.business_name}</h1>
          <p className={styles.bizField}>{business?.business_field}</p>
        </div>
        <div className={styles.headerActions}>
          <Link to={`/my-businesses/${id}/edit`} className={styles.editBtn}>Edit Business</Link>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{services.length}</span>
          <span className={styles.statLabel}>Services</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{slots.filter(s => !s.is_booked).length}</span>
          <span className={styles.statLabel}>Available Slots</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{appointments.filter(a => a.status === 'pending').length}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{appointments.length}</span>
          <span className={styles.statLabel}>Total Bookings</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.container}>
        <div className={styles.tabs}>
          {['appointments', 'services', 'slots'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className={styles.tabContent}>
            {appointments.length === 0 ? (
              <p className={styles.empty}>No appointments yet.</p>
            ) : (
              <div className={styles.apptList}>
                {appointments.map((appt) => (
                  <div key={appt.appointment_id} className={styles.apptCard}>
                    <div className={styles.apptInfo}>
                      <p className={styles.apptUser}>👤 {appt.user?.username}</p>
                      <p className={styles.apptService}>{appt.service?.service_name}</p>
                      <p className={styles.apptSlot}>
                        📅 {appt.slot?.date} at {appt.slot?.time}
                      </p>
                    </div>
                    <div className={styles.apptActions}>
                      <span
                        className={styles.statusBadge}
                        style={{
                          background: statusColors[appt.status] + '20',
                          color: statusColors[appt.status]
                        }}
                      >
                        {appt.status}
                      </span>
                      {appt.status === 'pending' && (
                        <div className={styles.statusBtns}>
                          <button
                            onClick={() => handleStatusUpdate(appt.appointment_id, 'confirmed')}
                            className={styles.confirmBtn}
                          >
                            Confirm
                          </button>
                        </div>
                      )}
                      {appt.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(appt.appointment_id, 'completed')}
                          className={styles.completeBtn}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className={styles.tabContent}>
            <div className={styles.tabTopBar}>
              <Link to={`/my-businesses/${id}/services/new`} className={styles.addBtn}>
                + Add Service
              </Link>
            </div>
            {services.length === 0 ? (
              <p className={styles.empty}>No services yet.</p>
            ) : (
              <div className={styles.serviceList}>
                {services.map((svc) => (
                  <div key={svc.service_id} className={styles.serviceCard}>
                    <div>
                      <p className={styles.svcName}>{svc.service_name}</p>
                      <p className={styles.svcDesc}>{svc.service_desc}</p>
                      <p className={styles.svcCharge}>₹{svc.service_charge}</p>
                    </div>
                    <div className={styles.itemActions}>
                      <Link
                        to={`/my-businesses/${id}/services/${svc.service_id}/edit`}
                        className={styles.editItemBtn}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteService(svc.service_id)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Slots Tab */}
        {activeTab === 'slots' && (
          <div className={styles.tabContent}>
            <div className={styles.tabTopBar}>
              <Link to={`/my-businesses/${id}/slots`} className={styles.addBtn}>
                + Manage Slots
              </Link>
            </div>
            {slots.length === 0 ? (
              <p className={styles.empty}>No slots created yet.</p>
            ) : (
              <div className={styles.slotList}>
                {slots.map((slot) => (
                  <div key={slot.slot_id} className={`${styles.slotCard} ${slot.is_booked ? styles.booked : ''}`}>
                    <div>
                      <p className={styles.slotDate}>{slot.date}</p>
                      <p className={styles.slotTime}>{slot.time}</p>
                    </div>
                    <div className={styles.slotRight}>
                      <span className={slot.is_booked ? styles.bookedBadge : styles.availBadge}>
                        {slot.is_booked ? 'Booked' : 'Available'}
                      </span>
                      {!slot.is_booked && (
                        <button
                          onClick={() => handleDeleteSlot(slot.slot_id)}
                          className={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}