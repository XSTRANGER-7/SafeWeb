import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { I18nProvider } from '../i18n/index.jsx'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Features from './pages/Features'
import Analytics from './pages/Analytics'
import Docs from './pages/Docs'
import Login from './auth/Login'
import Dashboard from './pages/Dashboard'
import PhishingDetection from './pages/PhishingDetection'
import WomenSafety from './pages/WomenSafety'
import CyberFraudReport from './pages/CyberFraudReport'

export default function App() {
  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-2 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/police" element={<Login />} />
            <Route path="/login/bank" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/phishing-detection" element={<PhishingDetection />} />
            <Route path="/women-safety" element={<WomenSafety />} />
            <Route path="/cyber-fraud-report" element={<CyberFraudReport />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </I18nProvider>
  )
}
