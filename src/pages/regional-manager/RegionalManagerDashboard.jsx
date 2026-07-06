import React from 'react';
import DailyQuote from '../../components/DailyQuote';

const RegionalManagerDashboard = () => {
  const stats = [
    { label: 'Regional Revenue', value: '₹48.6 Lakhs', sub: '+12.4% vs Last Month', color: 'text-violet-500', bg: 'bg-violet-50', icon: '📈' },
    { label: 'Area Managers', value: '8 Active', sub: 'In 12 Territories', color: 'text-blue-500', bg: 'bg-blue-50', icon: '👔' },
    { label: 'Target Completion', value: '94.2%', sub: 'Q2 Progress', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: '🎯' },
    { label: 'Territory Coverage', value: '89.6%', sub: 'Doctor Visits Coverage', color: 'text-cyan-500', bg: 'bg-cyan-50', icon: '🗺️' },
  ];

  const subRegions = [
    { name: 'North Zone (NCR & Punjab)', manager: 'Rajesh Malhotra', sales: '₹18.4L', target: '₹20.0L', percentage: 92 },
    { name: 'South Zone (Karnataka & TN)', manager: 'Karthik Rao', sales: '₹16.8L', target: '₹15.0L', percentage: 112 },
    { name: 'West Zone (Maharashtra)', manager: 'Sneha Deshmukh', sales: '₹13.4L', target: '₹14.5L', percentage: 92 },
  ];

  return (
    <div className="p-2.5 animate-fade">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#4C1D95] to-[#8B5CF6] rounded-[20px] p-[30px] text-white mb-[28px] shadow-[0_10px_25px_rgba(139,_92,_246,_0.15)] relative overflow-hidden">
        <div className="relative z-[2]">
          <span className="bg-white/20 px-3 py-1.5 rounded-[20px] text-[12px] font-bold tracking-[1px]">
            PORTAL: REGIONAL SALES MANAGER
          </span>
          <h2 className="text-[28px] font-extrabold my-3.5 mb-1.5 tracking-[-0.5px]">
            Hello, Regional Director!
          </h2>
          <p className="m-0 text-[14px] text-white/85 max-w-[500px]">
            Evaluate regional KPIs, coordinate with Area Managers, re-allocate sales targets, and track doctor prescription trends.
          </p>
          <DailyQuote userRole="REGIONAL_MANAGER" variant="welcome" />
        </div>
        <div className="absolute right-[-50px] bottom-[-50px] text-[180px] opacity-10 select-none pointer-events-none">
          🌍
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-[28px]">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white border-[1.5px] border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.01)] hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] transition-all duration-200 cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-xl text-[24px] flex items-center justify-center shrink-0 ${s.bg}`}
            >
              {s.icon}
            </div>
            <div>
              <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-[0.5px]">
                {s.label}
              </div>
              <div className="text-[20px] font-extrabold text-gray-800 my-0.5">
                {s.value}
              </div>
              <div className={`text-[11px] font-semibold ${s.color}`}>
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Sub-Region Tracking */}
        <div className="lg:col-span-2 bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-[16px] font-extrabold text-gray-800">Zone Performance Comparison</h3>
            <span className="text-[12px] font-bold text-[#8B5CF6] cursor-pointer">Generate Report ➔</span>
          </div>

          <div className="flex flex-col gap-4.5">
            {subRegions.map((r, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="text-[14px] font-bold text-gray-800">{r.name}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5">Manager: <span className="font-semibold">{r.manager}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-extrabold text-gray-800">{r.sales} <span className="text-[11px] text-gray-400 font-normal">/ {r.target}</span></div>
                    <span className={`text-[11px] font-bold ${r.percentage >= 100 ? 'text-green-600' : 'text-amber-500'}`}>
                      {r.percentage}% Achieved
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-gray-200 rounded-full">
                  <div className={`h-full rounded-full ${r.percentage >= 100 ? 'bg-green-600' : 'bg-[#8B5CF6]'}`} style={{ width: `${Math.min(r.percentage, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h3 className="m-0 mb-4.5 text-[16px] font-extrabold text-gray-800">Management Tasks</h3>
          <div className="flex flex-col gap-2.5">
            <button className="w-full p-3 rounded-xl bg-[#8B5CF6] text-white font-bold text-[13px] hover:opacity-90 transition-opacity text-center cursor-pointer">
              📊 Allocate Targets
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              📍 Territory Mapping
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              📝 Audit MR Visitions
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              📨 Message All Area Managers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionalManagerDashboard;
