import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── AUTH ───────────────────────────────────────────
export const register = (data) => api.post('/auth/register/', data)
export const login = (data) => api.post('/auth/login/', data)
export const logout = (data) => api.post('/auth/logout/', data)
export const refreshToken = (data) => api.post('/auth/token/refresh/', data)
export const getProfile = () => api.get('/auth/profile/')
export const updateProfile = (data) => api.put('/auth/profile/', data)

// ─── BUSINESSES ─────────────────────────────────────
export const getBusinesses = (params) => api.get('/businesses/', { params })
export const getBusiness = (id) => api.get(`/businesses/${id}/`)
export const createBusiness = (data) => api.post('/businesses/', data)
export const updateBusiness = (id, data) => api.put(`/businesses/${id}/`, data)
export const deleteBusiness = (id) => api.delete(`/businesses/${id}/`)
export const getMyBusinesses = () => api.get('/businesses/mine/')

// ─── SERVICES ───────────────────────────────────────
export const getServices = (businessId) => api.get(`/businesses/${businessId}/services/`)
export const getService = (businessId, id) => api.get(`/businesses/${businessId}/services/${id}/`)
export const createService = (businessId, data) => api.post(`/businesses/${businessId}/services/`, data)
export const updateService = (businessId, id, data) => api.put(`/businesses/${businessId}/services/${id}/`, data)
export const deleteService = (businessId, id) => api.delete(`/businesses/${businessId}/services/${id}/`)

// ─── SLOTS ──────────────────────────────────────────
export const getSlots = (businessId, params) => api.get(`/businesses/${businessId}/slots/`, { params })
export const createSlot = (businessId, data) => api.post(`/businesses/${businessId}/slots/`, data)
export const deleteSlot = (businessId, id) => api.delete(`/businesses/${businessId}/slots/${id}/`)

// ─── APPOINTMENTS ───────────────────────────────────
export const getAppointments = () => api.get('/appointments/')
export const getAppointment = (id) => api.get(`/appointments/${id}/`)
export const createAppointment = (data) => api.post('/appointments/', data)
export const cancelAppointment = (id) => api.patch(`/appointments/${id}/`, { status: 'cancelled' })
export const getBusinessAppointments = (businessId) => api.get(`/businesses/${businessId}/appointments/`)
export const updateAppointmentStatus = (apptId, status) =>
  api.patch(`/appointments/${apptId}/`, { status })
export const googleAuth = (data) => api.post('/auth/google/', data)

export const forgotPassword = (data) => api.post('/auth/forgot-password/', data)
export const resetPassword = (data) => api.post('/auth/reset-password/', data)
export default api