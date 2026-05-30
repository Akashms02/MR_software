import React from 'react';

const AreaManagerDashboard = () => {
  const stats = [
    { label: 'MRs Under Management', value: '18 Active', sub: '2 On Leave Today', color: 'text-teal-600', bg: 'bg-teal-50', icon: '🏃‍♂️' },
    { label: 'Visits Submitted', value: '42 / 60', sub: 'Pending Approval: 8', color: 'text-blue-500', bg: 'bg-blue-50', icon: '📝' },
    { label: 'Orders Collected', value: '₹3.2 Lakhs', sub: 'This Week', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: '🛍️' },
    { label: 'Area Target Completion', value: '88.5%', sub: 'Target: ₹4 Lakhs', color: 'text-amber-600', bg: 'bg-amber-50', icon: '🎯' },
  ];

  const mrActivities = [
    { name: 'Rahul Sen', region: 'Downtown', activity: 'Visited 4 Doctors, 2 Chemists', time: '10 Mins Ago', location: 'Apollo Pharmacy, Sector 15' },
    { name: 'Pooja Hegde', region: 'South Hub', activity: 'Logged visit: Dr. Anjali Mehta', time: '45 Mins Ago', location: 'Heart Care Center' },
    { name: 'Kunal Kapoor', region: 'East Suburbs', activity: 'Collected order of ₹45,000', time: '2 Hours Ago', location: 'A-One Chemists' },
  ];

  return (
    <div className="p-2.5 animate-fade">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#0F766E] to-[#0D9488] rounded-[20px] p-[30px] text-white mb-[28px] shadow-[0_10px_25px_rgba(13,_148,_136,_0.15)] relative overflow-hidden">
        <div className="relative z-[2]">
          <span className="bg-white/20 px-3 py-1.5 rounded-[20px] text-[12px] font-bold tracking-[1px]">
            PORTAL: AREA SALES MANAGER
          </span>
          <h2 className="text-[28px] font-extrabold my-3.5 mb-1.5 tracking-[-0.5px]">
            Hello, Area Manager!
          </h2>
          <p className="m-0 text-[14px] text-white/85 max-w-[500px]">
            Supervise field agents, review MR daily reporting, track doctor interactions, and boost pharmaceutical product sales in your area.
          </p>
        </div>
        <div className="absolute right-[-50px] bottom-[-50px] text-[180px] opacity-10 select-none pointer-events-none">
          🗺️
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
        {/* MR Live Activity Tracking */}
        <div className="lg:col-span-2 bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-[16px] font-extrabold text-gray-800">MR Field Activity Timeline</h3>
            <span className="text-[12px] font-bold text-[#0D9488] cursor-pointer">Track GPS Map ➔</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {mrActivities.map((act, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-[18px] w-9 h-9 bg-[#E2F1E8] text-[#0D9488] rounded-full flex items-center justify-center shrink-0">
                  📍
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[14px] font-bold text-gray-800">{act.name}</span>
                    <span className="text-[11px] text-gray-400 font-medium">{act.time}</span>
                  </div>
                  <div className="text-[12px] text-gray-500 mt-0.5">Zone: <span className="font-semibold">{act.region}</span> • {act.activity}</div>
                  <div className="text-[11px] text-gray-400 mt-1 italic">At: {act.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manager Controls */}
        <div className="bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h3 className="m-0 mb-4.5 text-[16px] font-extrabold text-gray-800">Quick Actions</h3>
          <div className="flex flex-col gap-2.5">
            <button className="w-full p-3 rounded-xl bg-[#0D9488] text-white font-bold text-[13px] hover:opacity-90 transition-opacity text-center cursor-pointer">
              ✔️ Approve 8 Pending Logs
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              📦 Allocate Product Samples
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              📅 Schedule Joint Field Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaManagerDashboard;
