import React from 'react';
import { useNavigate } from 'react-router-dom';

const MedicalSalesExecutiveDashboard = () => {
  const navigate = useNavigate();
  const stats = [
    { label: 'Monthly Sales Target', value: '₹2.4L / ₹4.0L', sub: '60% Achieved', color: 'text-teal-600', bg: 'bg-teal-50', icon: '📈' },
    { label: 'Distributor Orders', value: '18 Booked', sub: 'This Week', color: 'text-blue-500', bg: 'bg-blue-50', icon: '🛒' },
    { label: 'Chemist & Stockist Visits', value: '4 / 6', sub: "Today's Target", color: 'text-amber-500', bg: 'bg-amber-50', icon: '🏬' },
    { label: 'Sample Stock Remaining', value: '140 Units', sub: 'Replenish Soon', color: 'text-red-500', bg: 'bg-red-50', icon: '🧪' },
  ];

  const salesActivities = [
    { targetName: 'Metro Pharmacy', type: 'Order Booking', time: '11:00 AM', status: 'Pending Order', detail: 'Quoted ₹18,500 for Cardace orders' },
    { targetName: 'City Stockists', type: 'Payment Collection', time: '01:30 PM', status: 'Completed', detail: 'Collected Cheque of ₹42,000' },
    { targetName: 'Wellness Chemists', type: 'Sample Delivery', time: '04:00 PM', status: 'Scheduled', detail: 'Deliver Asthalin and generic samples' },
  ];

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] p-2.5">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[20px] p-[30px] text-white mb-7" style={{ background: 'linear-gradient(135deg, #115E59 0%, #0D9488 100%)', boxShadow: '0 10px 25px rgba(13, 148, 136, 0.15)' }}>
        <div className="relative z-10">
          <span className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest">
            PORTAL: MEDICAL SALES EXECUTIVE
          </span>
          <h2 className="text-[28px] font-extrabold mt-3.5 mb-1.5 tracking-tight">
            Sales Executive Dashboard
          </h2>
          <p className="text-sm text-white/85 max-w-[500px] m-0">
            Monitor your monthly sales quotas, log new distributor order receipts, and record payment collections in the field.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 text-[180px] opacity-10 select-none pointer-events-none">
          💼
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
        {/* Daily Schedule & Visits */}
        <div className="bg-white border border-gray-100 rounded-[18px] p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-base font-extrabold text-gray-800">Daily Sales Calls & Tasks</h3>
            <span className="text-xs font-bold text-teal-600 cursor-pointer">View Sales Route ➔</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {salesActivities.map((v, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`text-xl w-10 h-10 rounded-full flex items-center justify-center ${v.status === 'Completed' ? 'bg-teal-100' : 'bg-amber-50'}`}>
                  {v.status === 'Completed' ? '✓' : '🛒'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-800">{v.targetName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Type: {v.type} • <span className="font-semibold">{v.time}</span></div>
                  <div className="text-[11px] text-gray-400 mt-1 italic">{v.detail}</div>
                </div>
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${v.status === 'Completed' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white border border-gray-100 rounded-[18px] p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 className="m-0 mb-4 text-base font-extrabold text-gray-800">Sales Actions</h3>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigate('/medical-sales-executive/onboard-doctor')}
              className="w-full py-3 rounded-xl border-none bg-teal-600 text-white font-bold text-[13px] hover:opacity-90 transition-opacity text-center cursor-pointer"
            >
              ➕ Onboard Doctor / Pharmacist
            </button>
            <button
              onClick={() => navigate('/medical-sales-executive/fieldtracking')}
              className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center"
            >
              📍 Field Tracking
            </button>
            <button
              onClick={() => navigate('/medical-sales-executive/leaves')}
              className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center"
            >
              📅 Leave Approvals
            </button>
            <button className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center">
              📝 Book Distributor Order
            </button>
            <button className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center">
              🔍 Stockist Inventory Audit
            </button>
            <button className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center">
              💵 Log Payment Collection
            </button>
            <button className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center">
              📋 Submit Sales Call Report
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

export default MedicalSalesExecutiveDashboard;
