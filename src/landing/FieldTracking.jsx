const FIELD_FEATURES = [
  { icon: '📍', title: 'Real-Time GPS Tracking',  desc: 'Track field reps live with accurate location updates every 30 seconds.' },
  { icon: '🔔', title: 'Geo-Fenced Attendance',   desc: 'Auto punch-in when reps enter client zones. Zero buddy punching.' },
  { icon: '🗺️', title: 'Route Optimization',      desc: 'AI-suggested optimal routes for doctor visits, saving 25% travel time.' },
  { icon: '📊', title: 'Visit Reports',            desc: 'Instant digital call reports synced to CRM and manager dashboard.' },
  { icon: '💊', title: 'Doctor Coverage',          desc: 'Monitor doctor visit frequency, product detailing, and sample distribution.' },
  { icon: '📱', title: 'Offline Mode',             desc: 'Works without internet — syncs when connectivity returns.' },
]

const REP_DOTS = [
  { top: '35%', left: '25%', name: 'Rohit V.',  visits: 6 },
  { top: '55%', left: '55%', name: 'Aisha S.',  visits: 4 },
  { top: '25%', left: '58%', name: 'Priya N.',  visits: 3 },
  { top: '65%', left: '28%', name: 'Ankit J.',  visits: 5 },
]

export default function FieldTracking() {
  return (
    <section id="field" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="text-[12px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-[20px] uppercase tracking-[1px] mb-3 inline-block">
              📍 Field Force Tracking
            </div>
            <h2 className="text-[32px] md:text-[38px] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
              Track Every Rep, Everywhere
            </h2>
            <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
              GPS-based attendance, route planning, and visit reporting — all in one mobile app.
            </p>

            <div className="flex flex-col gap-4">
              {FIELD_FEATURES.map((f, i) => (
                <div key={i} className="flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-lg flex-shrink-0 bg-green-50 border border-green-200 flex items-center justify-center text-[16px]">
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-gray-950 mb-0.5">{f.title}</div>
                    <div className="text-[13px] text-gray-500 leading-[1.55]">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div className="flex justify-center">
            <div className="w-[280px] h-[520px] rounded-[36px] border-[12px] border-gray-900 bg-white shadow-2xl relative overflow-hidden flex flex-col">
              {/* Status bar */}
              <div className="p-3.5 pb-2 flex justify-between">
                <span className="text-[11px] text-gray-400 font-semibold">9:41 AM</span>
                <span className="text-[11px] text-gray-400">● ●</span>
              </div>

              {/* App header */}
              <div className="p-3 pb-2.5 border-b border-gray-150 flex justify-between items-center">
                <div>
                  <div className="text-[13px] font-bold text-green-600">GmaxepayHR Field</div>
                  <div className="text-[10px] text-gray-400">4 Reps Active · May 14</div>
                </div>
                <div className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-[10px] font-bold uppercase tracking-wider">Live</div>
              </div>

              {/* Map */}
              <div className="h-[210px] relative bg-green-50/50 border-b border-gray-150">
                {/* Grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-[size:30px_30px] opacity-60" />
                {/* Roads */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 220 210">
                  <path d="M0,105 Q55,85 110,110 Q165,135 220,95" stroke="#e2e8f0" strokeWidth="7" fill="none" />
                  <path d="M55,0 Q75,60 95,105 Q115,150 105,210" stroke="#e2e8f0" strokeWidth="5" fill="none" />
                </svg>

                {/* Rep dots */}
                {REP_DOTS.map((d, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{ top: d.top, left: d.left, transform: 'translate(-50%,-50%)' }}
                  >
                    <div className="w-3 h-3 rounded-full bg-green-600 border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,0.2)]" />
                    <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 text-[8px] font-bold text-green-800 whitespace-nowrap bg-white/85 px-1 py-0.5 rounded shadow-sm">
                      {d.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* List */}
              <div className="p-3.5 flex-1">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.5px] mb-2">
                  Today's Activity
                </div>
                {REP_DOTS.map((r, i) => (
                  <div key={i} className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                      <span className="text-[11px] text-gray-700">{r.name}</span>
                    </div>
                    <span className="text-[11px] text-green-600 font-bold">{r.visits} visits</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
