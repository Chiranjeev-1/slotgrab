import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSlots, createSlot, deleteSlot } from '../../api/axios'
import styles from './SlotManager.module.css'

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
]

export default function SlotManager() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // single slot form
  const [date, setDate] = useState('')
  const [selectedTimes, setSelectedTimes] = useState([])

  // bulk form
  const [bulkMode, setBulkMode] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [bulkTimes, setBulkTimes] = useState([])

  useEffect(() => {
    fetchSlots()
  }, [id])

  const fetchSlots = async () => {
    try {
      const res = await getSlots(id)
      setSlots(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggleTime = (time, bulk = false) => {
    if (bulk) {
      setBulkTimes((prev) =>
        prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
      )
    } else {
      setSelectedTimes((prev) =>
        prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
      )
    }
  }

  const getDatesInRange = (start, end) => {
    const dates = []
    const current = new Date(start)
    const last = new Date(end)
    while (current <= last) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  const handleAddSingle = async (e) => {
    e.preventDefault()
    if (selectedTimes.length === 0) {
      setError('Please select at least one time slot')
      return
    }
    setError(null)
    setAdding(true)
    try {
      const results = await Promise.allSettled(
        selectedTimes.map((time) =>
          createSlot(id, { date, time: time + ':00' })
        )
      )
      const succeeded = results.filter((r) => r.status === 'fulfilled')
      const failed = results.filter((r) => r.status === 'rejected')
      await fetchSlots()
      setSelectedTimes([])
      setDate('')
      setSuccess(`${succeeded.length} slot(s) added successfully.${failed.length > 0 ? ` ${failed.length} already existed.` : ''}`)
      setTimeout(() => setSuccess(null), 4000)
    } catch (e) {
      setError('Failed to add slots')
    } finally {
      setAdding(false)
    }
  }

  const handleAddBulk = async (e) => {
    e.preventDefault()
    if (bulkTimes.length === 0) {
      setError('Please select at least one time slot')
      return
    }
    if (!startDate || !endDate) {
      setError('Please select a date range')
      return
    }
    setError(null)
    setAdding(true)
    try {
      const dates = getDatesInRange(startDate, endDate)
      const allSlots = dates.flatMap((d) =>
        bulkTimes.map((time) => ({ date: d, time: time + ':00' }))
      )
      const results = await Promise.allSettled(
        allSlots.map((slot) => createSlot(id, slot))
      )
      const succeeded = results.filter((r) => r.status === 'fulfilled')
      const failed = results.filter((r) => r.status === 'rejected')
      await fetchSlots()
      setBulkTimes([])
      setStartDate('')
      setEndDate('')
      setSuccess(`${succeeded.length} slot(s) added.${failed.length > 0 ? ` ${failed.length} skipped (duplicates).` : ''}`)
      setTimeout(() => setSuccess(null), 4000)
    } catch (e) {
      setError('Failed to add slots')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (slotId) => {
    if (!confirm('Delete this slot?')) return
    try {
      await deleteSlot(id, slotId)
      setSlots((prev) => prev.filter((s) => s.slot_id !== slotId))
    } catch (e) {
      console.error(e)
    }
  }

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {})

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.back}>
          ← Back to Dashboard
        </button>
        <h1 className={styles.title}>Manage Slots</h1>

        {/* Mode toggle */}
        <div className={styles.modeToggle}>
          <button
            onClick={() => setBulkMode(false)}
            className={`${styles.modeBtn} ${!bulkMode ? styles.activeModeBtn : ''}`}
          >
            Single Day
          </button>
          <button
            onClick={() => setBulkMode(true)}
            className={`${styles.modeBtn} ${bulkMode ? styles.activeModeBtn : ''}`}
          >
            Date Range (Bulk)
          </button>
        </div>

        {/* Add slot form */}
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {bulkMode ? 'Add Slots for Date Range' : 'Add Slots for a Day'}
          </h2>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.successMsg}>{success}</div>}

          <form onSubmit={bulkMode ? handleAddBulk : handleAddSingle}>
            {/* Date inputs */}
            <div className={styles.dateRow}>
              {bulkMode ? (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      min={today}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      min={startDate || today}
                      className={styles.input}
                    />
                  </div>
                </>
              ) : (
                <div className={styles.field}>
                  <label className={styles.label}>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    min={today}
                    className={styles.input}
                  />
                </div>
              )}
            </div>

            {/* Time grid */}
            <div className={styles.timeSection}>
              <label className={styles.label}>Select Time Slots</label>
              <div className={styles.timeGrid}>
                {TIME_SLOTS.map((time) => {
                  const active = bulkMode
                    ? bulkTimes.includes(time)
                    : selectedTimes.includes(time)
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => toggleTime(time, bulkMode)}
                      className={`${styles.timeChip} ${active ? styles.activeChip : ''}`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
              <p className={styles.selectedCount}>
                {bulkMode ? bulkTimes.length : selectedTimes.length} time(s) selected
              </p>
            </div>

            <button
              type="submit"
              disabled={adding}
              className={styles.addBtn}
            >
              {adding ? 'Adding...' : '+ Add Slots'}
            </button>
          </form>
        </div>

        {/* Slot list grouped by date */}
        <div className={styles.listSection}>
          <h2 className={styles.listTitle}>All Slots ({slots.length})</h2>
          {loading ? (
            <p className={styles.loader}>Loading...</p>
          ) : Object.keys(groupedSlots).length === 0 ? (
            <p className={styles.empty}>No slots yet. Add your first slots above.</p>
          ) : (
            Object.keys(groupedSlots).sort().map((date) => (
              <div key={date} className={styles.dateGroup}>
                <h3 className={styles.dateHeading}>{date}</h3>
                <div className={styles.slotRow}>
                  {groupedSlots[date]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((slot) => (
                      <div
                        key={slot.slot_id}
                        className={`${styles.slotChip} ${slot.is_booked ? styles.bookedChip : styles.freeChip}`}
                      >
                        <span>{slot.time.slice(0, 5)}</span>
                        <span className={styles.slotStatus}>
                          {slot.is_booked ? '🔴 Booked' : '🟢 Free'}
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
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}