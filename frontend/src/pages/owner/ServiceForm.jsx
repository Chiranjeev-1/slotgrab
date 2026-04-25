import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createService, getService, updateService } from '../../api/axios'
import styles from './ServiceForm.module.css'

export default function ServiceForm() {
  const { id, serviceId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(serviceId)

  const [formData, setFormData] = useState({
    service_name: '',
    service_desc: '',
    service_charge: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isEdit) {
      getService(id, serviceId)
        .then((res) => {
          const { service_name, service_desc, service_charge } = res.data
          setFormData({ service_name, service_desc, service_charge })
        })
        .catch(console.error)
        .finally(() => setFetching(false))
    }
  }, [serviceId])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isEdit) {
        await updateService(id, serviceId, formData)
      } else {
        await createService(id, formData)
      }
      navigate(`/my-businesses/${id}/dashboard`)
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className={styles.loader}>Loading...</div>

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.back}>← Back</button>
        <h1 className={styles.title}>{isEdit ? 'Edit Service' : 'Add Service'}</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Service Name *</label>
            <input
              type="text"
              name="service_name"
              value={formData.service_name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="e.g. General Consultation"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description <span className={styles.optional}>(optional)</span></label>
            <textarea
              name="service_desc"
              value={formData.service_desc}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Brief description of this service"
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Charge (₹) *</label>
            <input
              type="number"
              name="service_charge"
              value={formData.service_charge}
              onChange={handleChange}
              required
              min="1"
              className={styles.input}
              placeholder="e.g. 500"
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={() => navigate(-1)} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}