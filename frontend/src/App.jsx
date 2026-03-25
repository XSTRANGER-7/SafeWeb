import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { I18nProvider } from '../i18n/index.jsx'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppBot from './components/WhatsAppBot'
import Home from './pages/Home'
import Features from './pages/Features'
import Analytics from './pages/Analytics'
import Docs from './pages/Docs'
import Login from './auth/Login'
import PBLogin from './auth/P-B-Login'
import SetupAccounts from './pages/SetupAccounts'
import Dashboard from './pages/Dashboard'
import PhishingDetection from './pages/PhishingDetection'
import WomenSafety from './pages/WomenSafety'
import CyberFraudReport from './pages/CyberFraudReport'
import Admin from './pages/Admin'
import PoliceDashboard from './pages/PoliceDashboard.jsx'
import PoliceStats from "./pages/PoliceStats.jsx"
import BankDashboard from "./pages/BankDashboard.jsx"
import BankStats from "./pages/BankStats.jsx"
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Navbar />
        <main className="container mx-auto flex-1 px-3 py-4 sm:px-4 sm:py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/setup-accounts" element={<SetupAccounts />} />
            <Route path="/login/police" element={<PBLogin key="police" />} />
            <Route path="/login/bank" element={<PBLogin key="bank" />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['normal']}><Dashboard /></ProtectedRoute>} />
            <Route path="/phishing-detection" element={<PhishingDetection />} />
            <Route path="/women-safety" element={<ProtectedRoute><WomenSafety /></ProtectedRoute>} />
            <Route path="/cyber-fraud-report" element={<ProtectedRoute><CyberFraudReport /></ProtectedRoute>} />
            <Route path="/police-dashboard" element={<ProtectedRoute allowedRoles={['police']}><PoliceDashboard /></ProtectedRoute>} />
            <Route path="/bank-dashboard" element={<ProtectedRoute allowedRoles={['bank']}><BankDashboard /></ProtectedRoute>} />
            <Route path="/police-stats" element={<ProtectedRoute allowedRoles={['police']}><PoliceStats /></ProtectedRoute>} />
            <Route path="/bank-stats" element={<ProtectedRoute allowedRoles={['bank']}><BankStats /></ProtectedRoute>} />

          </Routes>
        </main>
        <Footer />
        <WhatsAppBot />
      </div>
    </I18nProvider>
  )
}
