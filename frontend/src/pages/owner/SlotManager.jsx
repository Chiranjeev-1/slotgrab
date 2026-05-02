import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSlots, createSlot, toggleSlot, deleteSlot } from '../../api/axios'
import styles from './SlotManager.module.css'

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
]

const today = new Date().toISOString().split('T')[0]

export default function SlotManager() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [allSlots, setAllSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // add form state
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedTimes, setSelectedTimes] = useState([])
  const [bulkMode, setBulkMode] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [bulkTimes, setBulkTimes] = useState([])

  // filter + selection state
  const [filterDate, setFilterDate] = useState(today)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedSlotIds, setSelectedSlotIds] = useState([])
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchSlots()
  }, [id])

  // reset selection when filter changes
  useEffect(() => {
    setSelectedSlotIds([])
  }, [filterDate, filterStatus])

  const fetchSlots = async () => {
    try {
      const res = await getSlots(id)
      setAllSlots(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // apply filters
  const filteredSlots = allSlots
    .filter((s) => {
      const dateMatch = filterDate ? s.date === filterDate : true
      const statusMatch =
        filterStatus === 'all' ? true :
        filterStatus === 'available' ? (!s.is_booked && s.is_active) :
        filterStatus === 'booked' ? s.is_booked :
        filterStatus === 'disabled' ? !s.is_active : true
      return dateMatch && statusMatch
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.time.localeCompare(b.time)
    })

  // only deletable slots in current filter (not booked)
  const deletableSlots = filteredSlots.filter((s) => !s.is_booked)

  const existingTimes = allSlots
    .filter((s) => s.date === selectedDate)
    .map((s) => s.time.slice(0, 5))

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
      setError('Select at least one time')
      return
    }
    setError(null)
    setAdding(true)
    try {
      const results = await Promise.allSettled(
        selectedTimes.map((time) =>
          createSlot(id, { date: selectedDate, time: time + ':00' })
        )
      )
      const succeeded = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.filter((r) => r.status === 'rejected').length
      await fetchSlots()
      setSelectedTimes([])
      setSuccess(`${succeeded} slot(s) added.${failed > 0 ? ` ${failed} skipped (duplicates).` : ''}`)
      setTimeout(() => setSuccess(null), 4000)
    } catch (e) {
      setError('Failed to add slots')
    } finally {
      setAdding(false)
    }
  }

  const handleAddBulk = async (e) => {
    e.preventDefault()
    if (bulkTimes.length === 0 || !startDate || !endDate) {
      setError('Select date range and at least one time')
      return
    }
    setError(null)
    setAdding(true)
    try {
      const dates = getDatesInRange(startDate, endDate)
      const allSlotRequests = dates.flatMap((d) =>
        bulkTimes.map((time) => ({ date: d, time: time + ':00' }))
      )
      const results = await Promise.allSettled(
        allSlotRequests.map((slot) => createSlot(id, slot))
      )
      const succeeded = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.filter((r) => r.status === 'rejected').length
      await fetchSlots()
      setBulkTimes([])
      setStartDate('')
      setEndDate('')
      setSuccess(`${succeeded} slot(s) added.${failed > 0 ? ` ${failed} skipped.` : ''}`)
      setTimeout(() => setSuccess(null), 4000)
    } catch (e) {
      setError('Failed to add slots')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (slotId) => {
    try {
      const res = await toggleSlot(id, slotId)
      setAllSlots((prev) =>
        prev.map((s) => (s.slot_id === slotId ? res.data : s))
      )
    } catch (e) {
      console.error(e)
    }
  }

  // checkbox selection
  const toggleSelectSlot = (slotId) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId)
        ? prev.filter((s) => s !== slotId)
        : [...prev, slotId]
    )
  }

  const handleSelectAll = () => {
    if (selectedSlotIds.length === deletableSlots.length) {
      setSelectedSlotIds([])
    } else {
      setSelectedSlotIds(deletableSlots.map((s) => s.slot_id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedSlotIds.length === 0) return
    if (!confirm(`Delete ${selectedSlotIds.length} slot(s)? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await Promise.allSettled(
        selectedSlotIds.map((slotId) => deleteSlot(id, slotId))
      )
      setAllSlots((prev) =>
        prev.filter((s) => !selectedSlotIds.includes(s.slot_id))
      )
      setSelectedSlotIds([])
      setSuccess(`${selectedSlotIds.length} slot(s) deleted.`)
      setTimeout(() => setSuccess(null), 4000)
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  const allDeletableSelected =
    deletableSlots.length > 0 &&
    selectedSlotIds.length === deletableSlots.length

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
            Date Range
          </button>
        </div>

        {/* Add form */}
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {bulkMode ? 'Add Slots for Date Range' : 'Add Slots for a Day'}
          </h2>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.successMsg}>{success}</div>}

          <form onSubmit={bulkMode ? handleAddBulk : handleAddSingle}>
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
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    min={today}
                    className={styles.input}
                  />
                </div>
              )}
            </div>

            <div className={styles.timeSection}>
              <label className={styles.label}>Select Times</label>
              <div className={styles.timeGrid}>
                {TIME_SLOTS.map((time) => {
                  const isSelected = bulkMode
                    ? bulkTimes.includes(time)
                    : selectedTimes.includes(time)
                  const alreadyExists = !bulkMode && existingTimes.includes(time)
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={alreadyExists}
                      onClick={() => toggleTime(time, bulkMode)}
                      className={`${styles.timeChip} ${isSelected ? styles.activeChip : ''} ${alreadyExists ? styles.existsChip : ''}`}
                      title={alreadyExists ? 'Already added' : ''}
                    >
                      {time}
                      {alreadyExists && <span className={styles.existsDot}>✓</span>}
                    </button>
                  )
                })}
              </div>
              <p className={styles.selectedCount}>
                {bulkMode ? bulkTimes.length : selectedTimes.length} selected
              </p>
            </div>

            <button type="submit" disabled={adding} className={styles.addBtn}>
              {adding ? 'Adding...' : '+ Add Slots'}
            </button>
          </form>
        </div>

        {/* View + filter section */}
        <div className={styles.viewSection}>

          {/* Filter bar */}
          <div className={styles.filterBar}>
            <div className={styles.filterLeft}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={styles.filterInput}
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <button
                onClick={() => { setFilterDate(''); setFilterStatus('all') }}
                className={styles.clearBtn}
              >
                Clear
              </button>
            </div>

            <div className={styles.filterRight}>
              <span className={styles.resultCount}>
                {filteredSlots.length} slot(s)
              </span>
            </div>
          </div>

          {/* Bulk action bar — shows when slots selected */}
          {selectedSlotIds.length > 0 && (
            <div className={styles.bulkBar}>
              <span className={styles.bulkCount}>
                {selectedSlotIds.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className={styles.bulkDeleteBtn}
              >
                {deleting ? 'Deleting...' : `Delete ${selectedSlotIds.length} slot(s)`}
              </button>
              <button
                onClick={() => setSelectedSlotIds([])}
                className={styles.bulkCancelBtn}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Select all row */}
          {deletableSlots.length > 0 && (
            <div className={styles.selectAllRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={allDeletableSelected}
                  onChange={handleSelectAll}
                  className={styles.checkbox}
                />
                Select all deletable ({deletableSlots.length})
              </label>
            </div>
          )}

          {/* Slot grid */}
          {loading ? (
            <p className={styles.loader}>Loading...</p>
          ) : filteredSlots.length === 0 ? (
            <p className={styles.empty}>No slots match this filter.</p>
          ) : (
            <div className={styles.slotGrid}>
              {filteredSlots.map((slot) => {
                const isDeletable = !slot.is_booked
                const isChecked = selectedSlotIds.includes(slot.slot_id)

                return (
                  <div
                    key={slot.slot_id}
                    className={`
                      ${styles.slotCard}
                      ${slot.is_booked ? styles.bookedCard : ''}
                      ${!slot.is_active ? styles.disabledCard : ''}
                      ${isChecked ? styles.checkedCard : ''}
                    `}
                  >
                    {/* checkbox - only for non-booked */}
                    {isDeletable && (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectSlot(slot.slot_id)}
                        className={styles.slotCheckbox}
                      />
                    )}

                    <div className={styles.slotInfo}>
                      <div>
                        <p className={styles.slotDate}>{slot.date}</p>
                        <p className={styles.slotTime}>{slot.time.slice(0, 5)}</p>
                      </div>
                      <span className={
                        slot.is_booked ? styles.bookedBadge :
                        !slot.is_active ? styles.disabledBadge :
                        styles.availBadge
                      }>
                        {slot.is_booked ? 'Booked' : !slot.is_active ? 'Disabled' : 'Available'}
                      </span>
                    </div>

                    {!slot.is_booked && (
                      <button
                        onClick={() => handleToggle(slot.slot_id)}
                        className={`${styles.toggleBtn} ${!slot.is_active ? styles.enableBtn : styles.disableBtn}`}
                      >
                        {slot.is_active ? 'Disable' : 'Enable'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}