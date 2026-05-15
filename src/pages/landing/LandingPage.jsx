import Navbar from './Navbar'
import HeroSection from './HeroSection'
import StatsBar from './StatsBar'
import FeaturesSection from './FeaturesSection'
import WorkflowSection from './WorkflowSection'
import WhyGreenHR from './WhyGreenHR'
import DemoPreview from './DemoPreview'
import FieldTracking from './FieldTracking'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <WorkflowSection />
      <WhyGreenHR />
      <DemoPreview />
      <FieldTracking />
      <Footer />
    </div>
  )
}
