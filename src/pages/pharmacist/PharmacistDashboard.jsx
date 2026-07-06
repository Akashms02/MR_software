import React from 'react';
import DailyQuote from '../../components/DailyQuote';

const PharmacistDashboard = () => {
  const stats = [
    { label: 'Validated Today', value: '42 Scripts', sub: 'Pending: 5', color: 'text-cyan-500', bg: 'bg-cyan-50', icon: '📄' },
    { label: 'Stock Alerts', value: '8 Items Low', sub: 'Reorder needed', color: 'text-rose-500', bg: 'bg-rose-50', icon: '🚨' },
    { label: 'Orders Dispensed', value: '112 Packs', sub: 'Today\'s Total', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: '💊' },
    { label: 'Counter Sales', value: '₹18,450', sub: 'Cash & Card', color: 'text-blue-500', bg: 'bg-blue-50', icon: '💵' },
  ];

  const stockAlerts = [
    { name: 'Paracetamol 650mg (Dolo)', currentStock: '120 tablets', minStock: '500 tablets', status: 'Critical' },
    { name: 'Amoxicillin 500mg (Penicillin)', currentStock: '45 capsules', minStock: '200 capsules', status: 'Critical' },
    { name: 'Metformin 500mg (Glycomet)', currentStock: '180 tablets', minStock: '300 tablets', status: 'Moderate' },
  ];

  return (
    <div className="p-2.5 animate-fade">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#0891B2] to-[#06B6D4] rounded-[20px] p-[30px] text-white mb-[28px] shadow-[0_10px_25px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="relative z-[2]">
          <span className="bg-white/20 px-3 py-1.5 rounded-[20px] text-[12px] font-bold tracking-[1px]">
            PORTAL: MEDICAL PHARMACIST
          </span>
          <h2 className="text-[28px] font-extrabold my-3.5 mb-1.5 tracking-[-0.5px]">
            Hello, Pharmacist Partner!
          </h2>
          <p className="m-0 text-[14px] text-white/85 max-w-[500px]">
            Verify digital doctor prescriptions, manage medicine inventory controls, check drug batch expiry codes, and dispense supplies.
          </p>
          <DailyQuote userRole="PHARMACIST" variant="welcome" />
        </div>
        <div className="absolute right-[-50px] bottom-[-50px] text-[180px] opacity-10 select-none pointer-events-none">
          💊
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
        {/* Inventory Stock Warning */}
        <div className="lg:col-span-2 bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-[16px] font-extrabold text-gray-800">Low Stock Inventory Warnings</h3>
            <span className="text-[12px] font-bold text-[#0891B2] cursor-pointer">Inventory Manager ➔</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {stockAlerts.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`text-[20px] w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 ${item.status === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                  ⚠️
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-gray-800">{item.name}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">Current: <span className="font-bold text-rose-600">{item.currentStock}</span> • Threshold: {item.minStock}</div>
                </div>
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-[20px] ${item.status === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Counter Actions */}
        <div className="bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h3 className="m-0 mb-4.5 text-[16px] font-extrabold text-gray-800">Quick Actions</h3>
          <div className="flex flex-col gap-2.5">
            <button className="w-full p-3 rounded-xl bg-[#0891B2] text-white font-bold text-[13px] hover:opacity-90 transition-opacity text-center cursor-pointer">
              🔍 Scan Prescription
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              📥 Log Supplier Delivery
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              ⌛ Drug Expiry Checklist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
