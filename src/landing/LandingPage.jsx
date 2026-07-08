import { useState, useEffect, useRef } from 'react'
import Navbar from './Navbar'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import FAQ from './FAQ'
import DemoPreview from './DemoPreview'
import Testimonials from './Testimonials'
import ContactSection from './ContactSection'
import Footer from './Footer'
import DemoModal from './DemoModal'

export default function LandingPage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const reopenTimeoutRef = useRef(null)

  const openModal = () => {
    // Clear any scheduled auto-reopens
    if (reopenTimeoutRef.current) {
      clearTimeout(reopenTimeoutRef.current)
    }
    setIsDemoModalOpen(true)
  }

  const closeModal = () => {
    setIsDemoModalOpen(false)
    // Schedule to pop up again in 1 minute (60 seconds) after being closed
    if (reopenTimeoutRef.current) {
      clearTimeout(reopenTimeoutRef.current)
    }
    reopenTimeoutRef.current = setTimeout(() => {
      openModal()
    }, 60000)
  }

  useEffect(() => {
    // Automatically trigger the first pop-up after a short 3-second delay
    const initialTimer = setTimeout(() => {
      openModal()
    }, 3000)

    return () => {
      clearTimeout(initialTimer)
      if (reopenTimeoutRef.current) {
        clearTimeout(reopenTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="bg-white min-h-screen">
      <Navbar onBookDemoClick={openModal} />
      <HeroSection onBookDemoClick={openModal} />
      <FeaturesSection />
      <FAQ />
      <DemoPreview />
      <Testimonials />
      <ContactSection />
      <Footer />
      <DemoModal isOpen={isDemoModalOpen} onClose={closeModal} />
    </div>
  )
}

