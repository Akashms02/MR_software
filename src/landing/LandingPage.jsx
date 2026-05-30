import Navbar from './Navbar'
import HeroSection from './HeroSection'
import StatsBar from './StatsBar'
import FeaturesSection from './FeaturesSection'
import WorkflowSection from './WorkflowSection'
import WhyGmaxepayHR from './WhyGreenHR'
import DemoPreview from './DemoPreview'
import FieldTracking from './FieldTracking'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <WorkflowSection />
      <WhyGmaxepayHR />
      <DemoPreview />
      <FieldTracking />
      <Footer />
    </div>
  )
}
