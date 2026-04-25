import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSlots, createSlot, deleteSlot } from '../../api/axios'
import styles from './SlotManager.module.css'

export default function SlotManager() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({ date: '', time: '' })

  useEffect(() => {
    getSlots(id)
      .then((res) => setSlots(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError(null)
    setAdding(true)
    try {
      const res = await createSlot(id, formData)
      setSlots((prev) => [...prev, res.data])
      setFormData({ date: '', time: '' })
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to add slot')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (slotId) => {
    if (!confirm('Delete this slot?')) return
    try {
      await deleteSlot(id, slotId)
      setSlots((prev) => prev.filter((s) => s.slot_id !== slotId))
    } catch (e) { console.error(e) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.back}>← Back to Dashboard</button>
        <h1 className={styles.title}>Manage Slots</h1>

        {/* Add slot form */}
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Add New Slot</h2>
          {error && <div className={styles.error}>{error}</div>}
          <form onSubmit={handleAdd} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className={styles.input}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" disabled={adding} className={styles.addBtn}>
              {adding ? 'Adding...' : '+ Add Slot'}
            </button>
          </form>
        </div>

        {/* Slot list */}
        <div className={styles.listSection}>
          <h2 className={styles.listTitle}>All Slots ({slots.length})</h2>
          {loading ? (
            <p className={styles.loader}>Loading...</p>
          ) : slots.length === 0 ? (
            <p className={styles.empty}>No slots yet. Add your first slot above.</p>
          ) : (
            <div className={styles.slotGrid}>
              {slots.map((slot) => (
                <div
                  key={slot.slot_id}
                  className={`${styles.slotCard} ${slot.is_booked ? styles.booked : ''}`}
                >
                  <div className={styles.slotInfo}>
                    <p className={styles.slotDate}>{slot.date}</p>
                    <p className={styles.slotTime}>{slot.time}</p>
                  </div>
                  <div className={styles.slotRight}>
                    <span className={slot.is_booked ? styles.bookedBadge : styles.availBadge}>
                      {slot.is_booked ? 'Booked' : 'Free'}
                    </span>
                    {!slot.is_booked && (
                      <button
                        onClick={() => handleDelete(slot.slot_id)}
                        className={styles.deleteBtn}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}