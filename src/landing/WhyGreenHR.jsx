const PILLARS = [
  { icon: '📈', title: 'Scalable & Customizable', desc: 'Grows from 50 to 50,000 employees. Configure workflows, roles, and policies to fit your exact needs.' },
  { icon: '☁️', title: 'Cloud-Based',             desc: 'Zero infrastructure hassle. Access anywhere with 99.9% uptime SLA and automatic backups.' },
  { icon: '📱', title: 'Mobile-Friendly',          desc: 'Full-featured iOS and Android apps. Field reps can punch attendance and view payslips on the go.' },
  { icon: '🛡️', title: 'Enterprise Security',     desc: 'AES-256 encryption, role-based access control, MFA, and complete audit logging.' },
]

export default function WhyGmaxepayHR() {
  return (
    <section id="whyus" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-14 text-center flex flex-col items-center">
          <div className="text-[12px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-[20px] uppercase tracking-[1px] mb-3">
            🌿 Why GmaxepayHR
          </div>
          <h2 className="text-[32px] md:text-[38px] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            Built on 4 Core Pillars
          </h2>
          <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed">
            The four fundamental principles that make GmaxepayHR the preferred HRMS for pharma enterprises.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((p, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <div className="w-12 h-12 rounded-[10px] bg-green-50 border border-green-200 flex items-center justify-center text-[22px] mb-4">
                {p.icon}
              </div>
              <h3 className="text-[16px] font-bold text-gray-950 mb-2">
                {p.title}
              </h3>
              <p className="text-[14px] text-gray-500 leading-[1.65]">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
