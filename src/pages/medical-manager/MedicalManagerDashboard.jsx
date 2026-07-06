import React from 'react';
import { useNavigate } from 'react-router-dom';
import DailyQuote from '../../components/DailyQuote';

const MedicalManagerDashboard = () => {
  const navigate = useNavigate();
  const stats = [
    { label: 'Clinical Trials', value: '4 Active', sub: 'Phase II & III Progress', color: 'text-violet-700', bg: 'bg-violet-50', icon: '🧪' },
    { label: 'Compliance Rate', value: '98.4%', sub: 'Medical Guidelines Coverage', color: 'text-blue-600', bg: 'bg-blue-50', icon: '📋' },
    { label: 'Medical Queries', value: '12 Pending', sub: 'Resolved in 24h avg', color: 'text-teal-600', bg: 'bg-teal-50', icon: '❓' },
    { label: 'Adverse Events', value: '0 Active', sub: 'Safety metrics clean', color: 'text-red-600', bg: 'bg-red-50', icon: '🛡️' },
  ];

  const researchProjects = [
    { name: 'Cardio-Z Trial (Efficacy Evaluation)', lead: 'Dr. Ramesh Sharma', status: 'In Progress', progress: 78, phase: 'Phase III' },
    { name: 'Pediatric Asthma Study (Safety Check)', lead: 'Dr. Sunita Patel', status: 'In Progress', progress: 45, phase: 'Phase II' },
    { name: 'Ortho-Joint Reliever Clinical Trial', lead: 'Dr. Vivek Verma', status: 'Completed', progress: 100, phase: 'Phase IV' },
  ];

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] p-2.5">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[20px] p-[30px] text-white mb-7" style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)', boxShadow: '0 10px 25px rgba(124, 58, 237, 0.15)' }}>
        <div className="relative z-10">
          <span className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest">
            PORTAL: MEDICAL MANAGER
          </span>
          <h2 className="text-[28px] font-extrabold mt-3.5 mb-1.5 tracking-tight">
            Hello, Medical Manager!
          </h2>
          <p className="text-sm text-white/85 max-w-[500px] m-0">
            Monitor active clinical trials, track compliance to safety guidelines, manage medical representative query escalations, and audit doctor engagement quality.
          </p>
          <DailyQuote userRole="MEDICAL_MANAGER" variant="welcome" />
        </div>
        <div className="absolute -right-10 -bottom-[50px] text-[180px] opacity-10 select-none pointer-events-none">
          🧬
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 mb-7">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`w-12 h-12 rounded-xl ${s.bg} text-2xl flex items-center justify-center shrink-0`}>
              {s.icon}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {s.label}
              </div>
              <div className="text-xl font-extrabold text-gray-800 my-0.5">
                {s.value}
              </div>
              <div className={`text-[11px] font-semibold ${s.color}`}>
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-6 items-start">
        {/* Research & Trials Tracking */}
        <div className="bg-white border border-gray-100 rounded-[18px] p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-base font-extrabold text-gray-800">Clinical Research Status</h3>
            <span className="text-xs font-bold text-violet-600 cursor-pointer">View All Trials ➔</span>
          </div>

          <div className="flex flex-col gap-[18px]">
            {researchProjects.map((r, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="text-sm font-bold text-gray-800">{r.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Principal Investigator: <span className="font-semibold">{r.lead}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-gray-800">{r.phase}</div>
                    <span className={`text-[11px] font-bold ${r.progress === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {r.progress}% Enrolled
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-gray-200 rounded-full">
                  <div
                    className={`h-full rounded-full ${r.progress === 100 ? 'bg-emerald-500' : 'bg-violet-600'}`}
                    style={{ width: `${r.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white border border-gray-100 rounded-[18px] p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 className="m-0 mb-4 text-base font-extrabold text-gray-800">Management Tasks</h3>
          <div className="flex flex-col gap-2.5">
            <button
              className="w-full py-3 rounded-xl border-none bg-violet-600 text-white font-bold text-[13px] cursor-pointer transition-opacity hover:opacity-90 text-center"
              onClick={() => navigate('/medical-manager/onboard-doctor')}
            >
              ➕ Onboard Doctor
            </button>
            <button className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center">
              📖 Audit Clinical Guidelines
            </button>
            <button className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center">
              💰 Allocate Research Budget
            </button>
            <button className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center">
              📨 Message Research Team
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default MedicalManagerDashboard;
