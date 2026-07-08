import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Dr. Vikram Mehta',
    role: 'Director of Sales, Apex Pharma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4,
    quote: 'Medistrax transformed our field force management. We replaced manual call logs with real-time GPS tracking and doctor check-ins, saving our MRs 10+ hours per week.'
  },
  {
    name: 'Sarah Jenkins',
    role: 'HR Head, Zydus Group',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    quote: 'Managing leaves and attendance for over 500 medical representatives used to be a nightmare. Medistrax simplified leaves and automated our entire HR processing.'
  },
  {
    name: 'Rajesh Sharma',
    role: 'National Sales Director',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    rating: 4,
    quote: 'The daily call reports (DCR) and analytics inside Medistrax give us complete visibility into field coverage. Our doctor visit compliance rate improved by 35%.'
  },
  {
    name: 'Neha Deshmukh',
    role: 'Regional Manager, Sun Pharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    rating: 4,
    quote: 'The GPS-verified field attendance solved all our tracking disputes. The system is incredibly reliable and our MRs find the mobile self-service app very easy to use.'
  },
  {
    name: 'Dr. Amit Sen',
    role: 'Director of Operations',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    quote: 'With Medistrax, tour planning and distributor sales tracking are seamless. It has bridged the gap between our warehouse supply chain and on-field demand.'
  },
  {
    name: 'David Vance',
    role: 'Chief Compliance Officer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    rating: 4,
    quote: "The built-in compliance and automated expense reporting features are stellar. Medistrax has made our medical representatives' daily operations transparent and audits simple."
  }
]

export default function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  return (
    <section id="testimonials" className="py-24 bg-white overflow-hidden font-sans select-none">
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
            Testimonials
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#5C715E] font-medium max-w-2xl mx-auto leading-relaxed">
            Discover How Pharmaceutical Teams Streamline Their Field Operations, Manage HR Workflows, And Achieve Outstanding Results With Medistrax
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              variants={cardVariants}
              key={i}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-[#E5F7E3]/50 border border-[#28823A]/10 rounded-[32px] p-8 shadow-[0_10px_35px_rgba(40,130,58,0.02)] flex flex-col justify-between min-h-[220px]"
            >
              {/* Top Row: User info and Stars */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#28823A]/20"
                  />
                  <div>
                    <h3 className="text-[15px] font-extrabold text-[#0D2411] leading-tight">{t.name}</h3>
                    <p className="text-[11px] text-[#5C715E] font-semibold mt-0.5">{t.role}</p>
                  </div>
                </div>

                {/* Stars Rating */}
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, index) => {
                    const isStarred = index < t.rating
                    return (
                      <Star
                        key={index}
                        size={15}
                        className={isStarred ? 'fill-[#FFB800] text-[#FFB800]' : 'text-gray-200'}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Description Quote */}
              <p className="text-[14px] text-gray-600 leading-relaxed font-normal flex-grow">
                "{t.quote}"
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
