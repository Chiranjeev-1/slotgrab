import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import NotFound from './pages/NotFound'


// Auth
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

// Public
import Landing from './pages/public/Landing'
import BusinessList from './pages/public/BusinessList'
import BusinessDetail from './pages/public/BusinessDetail'

// Customer
import MyAppointments from './pages/customer/MyAppointments'
import AppointmentDetail from './pages/customer/AppointmentDetail'

// Owner
import MyBusinesses from './pages/owner/MyBusinesses'
import BusinessForm from './pages/owner/BusinessForm'
import Dashboard from './pages/owner/Dashboard'
import ServiceForm from './pages/owner/ServiceForm'
import SlotManager from './pages/owner/SlotManager'
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute'
import Footer from './components/Footer'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <Routes>

            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/businesses" element={<BusinessList />} />
            <Route path="/businesses/:id" element={<BusinessDetail />} />

            {/* Auth */}
            <Route path="/login" element={
  <PublicOnlyRoute><Login /></PublicOnlyRoute>
} />
<Route path="/signup" element={
  <PublicOnlyRoute><Signup /></PublicOnlyRoute>
} />

<Route path="/forgot-password" element={
  <PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>
} />
<Route path="/reset-password/:uid/:token" element={
  <PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>
} />

<Route path="*" element={<NotFound />} />


            <Route path="/appointments" element={
              <ProtectedRoute><MyAppointments /></ProtectedRoute>
            } />
            <Route path="/appointments/:id" element={
              <ProtectedRoute><AppointmentDetail /></ProtectedRoute>
            } />

            <Route path="/my-businesses" element={
              <ProtectedRoute><MyBusinesses /></ProtectedRoute>
            } />
            <Route path="/my-businesses/new" element={
              <ProtectedRoute><BusinessForm /></ProtectedRoute>
            } />
            <Route path="/my-businesses/:id/edit" element={
              <ProtectedRoute><BusinessForm /></ProtectedRoute>
            } />
            <Route path="/my-businesses/:id/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/my-businesses/:id/services/new" element={
              <ProtectedRoute><ServiceForm /></ProtectedRoute>
            } />
            <Route path="/my-businesses/:id/services/:serviceId/edit" element={
              <ProtectedRoute><ServiceForm /></ProtectedRoute>
            } />
            <Route path="/my-businesses/:id/slots" element={
              <ProtectedRoute><SlotManager /></ProtectedRoute>
            } />

          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  )
}