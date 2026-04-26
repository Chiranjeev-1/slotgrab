import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createBusiness, getBusiness, updateBusiness } from '../../api/axios'
import styles from './BusinessForm.module.css'

export default function BusinessForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const BUSINESS_FIELDS = [
  'Healthcare',
  'Beauty & Salon',
  'Fitness',
  'Legal',
  'Consulting',
  'Education',
  'Finance',
  'Real Estate',
  'Technology',
  'Food & Beverage',
  'Retail',
  'Transportation',
  'Other',
]

  const [formData, setFormData] = useState({
    business_name: '',
    address: '',
    business_field: '',
    domain: '',
    gst_no: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isEdit) {
      getBusiness(id)
        .then((res) => {
          const { business_name, address, business_field, domain, gst_no } = res.data
          setFormData({ business_name, address, business_field, domain, gst_no })
        })
        .catch(console.error)
        .finally(() => setFetching(false))
    }
  }, [id])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isEdit) {
        await updateBusiness(id, formData)
        navigate(`/my-businesses/${id}/dashboard`)
      } else {
        const res = await createBusiness(formData)
        navigate(`/my-businesses/${res.data.business_id}/dashboard`)
      }
    } catch (err) {
      const data = err.response?.data
      const message = data ? Object.values(data).flat().join(' ') : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className={styles.loader}>Loading...</div>

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.back}>← Back</button>
        <h1 className={styles.title}>{isEdit ? 'Edit Business' : 'Create Business'}</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Business Name *</label>
            <input
              type="text"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="e.g. City Health Clinic"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className={styles.textarea}
              placeholder="Full address"
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
  <label className={styles.label}>Business Field</label>
  <select
    name="business_field"
    value={formData.business_field}
    onChange={handleChange}
    className={styles.input}
  >
    <option value="">Select a category</option>
    {BUSINESS_FIELDS.map((field) => (
      <option key={field} value={field}>{field}</option>
    ))}
  </select>
</div>
            <div className={styles.field}>
              <label className={styles.label}>Domain / Website</label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                className={styles.input}
                placeholder="e.g. clinic.com"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>GST Number <span className={styles.optional}>(optional)</span></label>
            <input
              type="text"
              name="gst_no"
              value={formData.gst_no}
              onChange={handleChange}
              className={styles.input}
              placeholder="GST number"
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={() => navigate(-1)} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}