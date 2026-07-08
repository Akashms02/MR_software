import { motion } from 'framer-motion'
import { CalendarCheck, LineChart, CalendarDays, MapPin } from 'lucide-react'

const FEATURES = [
  {
    icon: CalendarCheck,
    title: 'Attendance Management',
    sub: 'Check-In, Check-Out And Track Your Working Hours With Accuracy',
    desc: 'Mark Your Attendance With GPS-Enabled Check-In And Check-Out While Automatically Tracking Your Working Hours. Get Accurate Attendance Records And Real-Time Performance Insights',
    image: '/landing/feature1.svg'
  },
  {
    icon: LineChart,
    title: 'Reports & Analytics',
    sub: 'Monitor Field Activities With Real-Time Reports, DCR Analytics, And Performance',
    desc: "Gain Complete Visibility Into Your Field Team's Performance With Powerful Reports And Real-Time Analytics. Analyze Doctor Visits, DCR Submissions, Call Metrics, And Productivity Trends To Make Informed Business Decisions.",
    image: '/landing/feature2.svg'
  },
  {
    icon: CalendarDays,
    title: 'Leave Management',
    sub: 'Apply For Leaves, Track Your Balance And View Leave History Anytime',
    desc: 'Request Leaves, Monitor Your Available Balance, And Track Approval Status From One Place. Stay Informed With A Simple And Transparent Leave Management System.',
    image: '/landing/feature3.svg'
  },
  {
    icon: MapPin,
    title: 'Live Location Tracking',
    sub: 'Stay Connected With Real-Time Location Tracking For Safety And Transparency',
    desc: "Monitor Your Field Team's Location In Real Time For Improved Visibility, Accountability, And Safety. Track Routes And Movements To Ensure Efficient Field Operations And Better Workforce Management.",
    image: '/landing/feature4.svg'
  }
]

export default function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  return (
    <section id="features" className="py-24 bg-white overflow-hidden font-sans select-none">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 
            className="text-[32px] sm:text-[40px] font-extrabold text-[#0D2411] tracking-tight leading-tight"
            style={{ fontFamily: '"Adelle Cyrillic", "Adelle", Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            Smart Features
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#5C715E] font-medium max-w-2xl mx-auto leading-relaxed">
            Powerful Tools To Plan, Track And Manage Your Field Activities — All From Your Mobile.
          </p>
        </motion.div>

        {/* Features Rows */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-24 lg:space-y-32"
        >
          {FEATURES.map((f, i) => {
            const IconComponent = f.icon
            const isEven = i % 2 === 0
            
            return (
              <motion.div
                variants={itemVariants}
                key={i}
                className={`flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Text Content */}
                <div className="w-full lg:w-[48%] space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#E5F7E3] flex items-center justify-center text-[#28823A] flex-shrink-0 shadow-[0_4px_12px_rgba(40,130,58,0.08)] border border-[#28823A]/5">
                      <IconComponent size={22} className="stroke-[2.2]" />
                    </div>
                    <h3 
                      className="text-[24px] sm:text-[28px] font-extrabold text-[#0D2411] tracking-tight leading-tight"
                      style={{ fontFamily: '"Adelle Cyrillic", "Adelle", Georgia, Cambria, "Times New Roman", Times, serif' }}
                    >
                      {f.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-4 pl-0 lg:pl-2">
                    <h4 className="text-[15px] sm:text-[16px] font-bold text-[#5C715E] leading-snug tracking-normal">
                      {f.sub}
                    </h4>
                    <p className="text-[14px] sm:text-[15px] text-gray-500 leading-relaxed font-normal">
                      {f.desc}
                    </p>
                  </div>
                </div>

                {/* Image Showcase */}
                <div className="w-full lg:w-[48%] flex justify-center">
                  <div className="w-full max-w-[540px] transform hover:scale-[1.02] transition-transform duration-300 pointer-events-none select-none">
                    <img 
                      src={f.image} 
                      alt={f.title} 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

      </div>
    </section>
  )
}
