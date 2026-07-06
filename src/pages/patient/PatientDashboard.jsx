import React from 'react';
import DailyQuote from '../../components/DailyQuote';

const PatientDashboard = () => {
  const stats = [
    { label: 'My Consultations', value: '4 Sessions', sub: 'Last: 12 May 2026', color: 'text-indigo-500', bg: 'bg-indigo-50', icon: '👨‍⚕️' },
    { label: 'Active Prescriptions', value: '2 Active', sub: 'View details', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: '💊' },
    { label: 'Health Reports', value: '6 Files', sub: 'Lab Results synced', color: 'text-violet-500', bg: 'bg-violet-50', icon: '📄' },
    { label: 'Next Consult', value: 'June 04, 11 AM', sub: 'Dr. Ramesh Sharma', color: 'text-pink-500', bg: 'bg-pink-50', icon: '📅' },
  ];

  const prescriptions = [
    { medicine: 'Asthalin Inhaler 100mcg', dosage: '2 puffs as needed', doctor: 'Dr. Sunita Patel', pharmacyStatus: 'Ready for Pickup', duration: 'Refill allowed' },
    { medicine: 'Cardace 5mg (Ramipril)', dosage: 'Once daily (morning)', doctor: 'Dr. Ramesh Sharma', pharmacyStatus: 'Dispensed (Home Delivery)', duration: 'Expires June 30' },
  ];

  return (
    <div className="p-2.5 animate-fade">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-[20px] p-[30px] text-white mb-[28px] shadow-[0_10px_25px_rgba(99,102,241,0.15)] relative overflow-hidden">
        <div className="relative z-[2]">
          <span className="bg-white/20 px-3 py-1.5 rounded-[20px] text-[12px] font-bold tracking-[1px]">
            PORTAL: PATIENT HEALTH PORTAL
          </span>
          <h2 className="text-[28px] font-extrabold my-3.5 mb-1.5 tracking-[-0.5px]">
            Hello, Health Partner!
          </h2>
          <p className="m-0 text-[14px] text-white/85 max-w-[500px]">
            Check your doctor consultation plans, read active e-prescriptions, review lab reports, and manage appointment bookings.
          </p>
          <DailyQuote userRole="PATIENT" variant="welcome" />
        </div>
        <div className="absolute right-[-50px] bottom-[-50px] text-[180px] opacity-10 select-none pointer-events-none">
          💖
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
        {/* Prescription Feed */}
        <div className="lg:col-span-2 bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-[16px] font-extrabold text-gray-800">My Active Prescriptions</h3>
            <span className="text-[12px] font-bold text-[#6366F1] cursor-pointer">View All Records ➔</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {prescriptions.map((p, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-[20px] w-[38px] h-[38px] bg-[#EEF2FF] text-[#6366F1] rounded-full flex items-center justify-center shrink-0">
                  💊
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[14px] font-bold text-gray-800">{p.medicine}</span>
                    <span className="text-[11px] text-green-600 font-bold">{p.pharmacyStatus}</span>
                  </div>
                  <div className="text-[12px] text-gray-500 mt-0.5">Dosage: <span className="font-semibold">{p.dosage}</span> • Prescribed by: {p.doctor}</div>
                  <div className="text-[11px] text-gray-400 mt-1">Refill Info: {p.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Wallet / Links */}
        <div className="bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h3 className="m-0 mb-4.5 text-[16px] font-extrabold text-gray-800">Health Desk</h3>
          <div className="flex flex-col gap-2.5">
            <button className="w-full p-3 rounded-xl bg-[#6366F1] text-white font-bold text-[13px] hover:opacity-90 transition-opacity text-center cursor-pointer">
              📅 Book Appointment
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              💊 Re-order Active Medicine
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              📁 Sync Medical History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
