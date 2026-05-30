import React from 'react';

const HRDashboard = () => {
  const stats = [
    { label: 'Total Employees', value: '384 Active', sub: 'Across 4 Regions', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: '👥' },
    { label: 'Pending Approvals', value: '12 Requests', sub: 'Leaves & Attendance', color: 'text-rose-500', bg: 'bg-rose-50', icon: '📝' },
    { label: 'Active Job Openings', value: '6 Positions', sub: 'Recruiting Pipeline', color: 'text-blue-500', bg: 'bg-blue-50', icon: '💼' },
    { label: 'Payroll Status', value: 'May Cycle Done', sub: 'Disbursed on 1st', color: 'text-violet-500', bg: 'bg-violet-50', icon: '💰' },
  ];

  const pendingApprovals = [
    { name: 'Amit Verma', role: 'Medical Representative', request: 'Casual Leave (3 Days)', date: '25-27 May', status: 'Pending' },
    { name: 'Dr. Neha Gupta', role: 'Consulting Physician', request: 'Maternity Extension', date: 'June-Aug', status: 'Review Required' },
    { name: 'Ravi Teja', role: 'Area Manager', request: 'Expense Reimbursement', date: '₹14,500', status: 'Pending' },
  ];

  return (
    <div className="p-2.5 animate-fade">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#047857] to-[#10B981] rounded-[20px] p-[30px] text-white mb-[28px] shadow-[0_10px_25px_rgba(16,185,129,0.15)] relative overflow-hidden">
        <div className="relative z-[2]">
          <span className="bg-white/20 px-3 py-1.5 rounded-[20px] text-[12px] font-bold tracking-[1px]">
            PORTAL: HR MANAGEMENT
          </span>
          <h2 className="text-[28px] font-extrabold my-3.5 mb-1.5 tracking-[-0.5px]">
            Welcome, HR Admin!
          </h2>
          <p className="m-0 text-[14px] text-white/85 max-w-[500px]">
            Oversee company culture, process leave requests, track field recruitment pipelines, and manage employee onboarding.
          </p>
        </div>
        <div className="absolute right-[-50px] bottom-[-50px] text-[180px] opacity-10 select-none pointer-events-none">
          👩‍💼
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
        {/* Pending Approvals Feed */}
        <div className="lg:col-span-2 bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-[16px] font-extrabold text-gray-800">Pending Requests Inbox</h3>
            <span className="text-[12px] font-bold text-[#047857] cursor-pointer">View All Requests ➔</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {pendingApprovals.map((p, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-[20px] w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
                  {p.status.includes('Review') ? '⚠️' : '✉️'}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-gray-800">{p.name}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{p.role} • <span className="font-semibold text-gray-600">{p.request}</span></div>
                  <div className="text-[11px] text-gray-400 mt-1">Duration/Amount: {p.date}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3.5 py-1.5 text-[11px] font-bold rounded-lg border-none bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer">Approve</button>
                  <button className="px-3.5 py-1.5 text-[11px] font-bold rounded-lg border-none bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HR Operations Quick Links */}
        <div className="bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h3 className="m-0 mb-4.5 text-[16px] font-extrabold text-gray-800">HR Operations</h3>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => window.location.href = '/admin/onboard'}
              className="w-full p-3 rounded-xl bg-[#047857] text-white font-bold text-[13px] hover:opacity-90 transition-opacity text-center cursor-pointer"
            >
              ➕ Onboard New Employee
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              📊 Payroll Calculator
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              📁 Compliance Documents
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              🏢 Manage Departments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
