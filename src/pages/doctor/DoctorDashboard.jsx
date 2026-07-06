import React from 'react';
import DailyQuote from '../../components/DailyQuote';

const DoctorDashboard = () => {
  const stats = [
    { label: 'Patients Today', value: '18 Consults', sub: '12 Completed', color: 'text-violet-600', bg: 'bg-violet-50', icon: '👥' },
    { label: 'Digital Prescriptions', value: '86 Issued', sub: 'This Month', color: 'text-pink-500', bg: 'bg-pink-50', icon: '✍️' },
    { label: 'Next Appointment', value: '04:15 PM', sub: 'Ramanathan Swamy', color: 'text-blue-600', bg: 'bg-blue-50', icon: '⏰' },
    { label: 'Teleconsultations', value: '3 Scheduled', sub: 'Video Portal Link Active', color: 'text-teal-600', bg: 'bg-teal-50', icon: '💻' },
  ];

  const appointments = [
    { patient: 'Ramanathan Swamy', age: '52, Male', time: '04:15 PM', type: 'Follow-up', illness: 'Hypertension review' },
    { patient: 'Meera Deshpande', age: '28, Female', time: '04:45 PM', type: 'First Visit', illness: 'Chronic Migraine consultation' },
    { patient: 'Master Aarav Kapoor', age: '8, Male', time: '05:15 PM', type: 'General Checkup', illness: 'Seasonal Fever & Cough' },
  ];

  return (
    <div className="p-2.5 animate-fade">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] rounded-[20px] p-[30px] text-white mb-[28px] shadow-[0_10px_25px_rgba(124,58,237,0.15)] relative overflow-hidden">
        <div className="relative z-[2]">
          <span className="bg-white/20 px-3 py-1.5 rounded-[20px] text-[12px] font-bold tracking-[1px]">
            PORTAL: MEDICAL CONSULTANT / DOCTOR
          </span>
          <h2 className="text-[28px] font-extrabold my-3.5 mb-1.5 tracking-[-0.5px]">
            Good Afternoon, Dr. Doctor!
          </h2>
          <p className="m-0 text-[14px] text-white/85 max-w-[500px]">
            Access your patient queues, write e-prescriptions directly linked with chemist inventory, and review diagnostic charts.
          </p>
          <DailyQuote userRole="DOCTOR" variant="welcome" />
        </div>
        <div className="absolute right-[-50px] bottom-[-50px] text-[180px] opacity-10 select-none pointer-events-none">
          🩺
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
        {/* Appointments Queue */}
        <div className="lg:col-span-2 bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-[16px] font-extrabold text-gray-800">Patient Consultation Queue</h3>
            <span className="text-[12px] font-bold text-[#7C3AED] cursor-pointer">View Appointment Calendar ➔</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {appointments.map((ap, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-[18px] w-[38px] h-[38px] bg-[#ECE6FC] text-[#7C3AED] rounded-full flex items-center justify-center shrink-0 font-extrabold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[14px] font-bold text-gray-800">{ap.patient}</span>
                    <span className="text-[12px] text-[#7C3AED] font-bold">{ap.time}</span>
                  </div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{ap.age} • <span className="font-semibold text-gray-600">{ap.type}</span></div>
                  <div className="text-[11px] text-gray-400 mt-1 italic">Complaint: {ap.illness}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3.5 py-2 text-[11px] font-bold rounded-lg border-none bg-[#7C3AED] text-white hover:opacity-90 transition-opacity cursor-pointer">Start</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Operations */}
        <div className="bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h3 className="m-0 mb-4.5 text-[16px] font-extrabold text-gray-800">Clinic Controls</h3>
          <div className="flex flex-col gap-2.5">
            <button className="w-full p-3 rounded-xl bg-[#7C3AED] text-white font-bold text-[13px] hover:opacity-90 transition-opacity text-center cursor-pointer">
              ✍️ Write E-Prescription
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              🔍 Patient History Database
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              🔬 Lab Reports Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
