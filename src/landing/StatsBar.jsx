const STATS = [
  { value: '80%',   label: 'Faster HR Tasks',       icon: '⚡' },
  { value: '1,250+', label: 'Employees Managed',     icon: '👥' },
  { value: '100%',  label: 'Compliance Rate',         icon: '✅' },
  { value: '85%',   label: 'Employee Satisfaction',   icon: '⭐' },
]

export default function StatsBar() {
  return (
    <div className="bg-white border-y border-gray-200 py-7">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="text-[22px] mb-1.5">{s.icon}</div>
              <div className="text-[28px] font-extrabold text-gray-900 leading-tight mb-1">{s.value}</div>
              <div className="text-[13px] text-gray-400 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
