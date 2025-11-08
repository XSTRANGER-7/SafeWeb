import React from 'react'
import Hero from '../components/Hero'
import FeatureCards from '../components/FeatureCards'

export default function Home() {
  return (
    <div>
      <Hero />
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <FeatureCards />
      </section>
      <section className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Why CFVSTS?</h3>
        <p className="text-gray-700">A simple portal to file complaints, track FIR progress, and coordinate with banks and cyber cells for refunds & assistance.</p>
      </section>
    </div>
  )
}
