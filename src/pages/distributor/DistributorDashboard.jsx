import React from 'react';
import DailyQuote from '../../components/DailyQuote';

const DistributorDashboard = () => {
  const stats = [
    { label: 'Active Shipments', value: '14 Deliveries', sub: '8 In-Transit', color: 'text-orange-600', bg: 'bg-orange-50', icon: '🚚' },
    { label: 'Pending Orders', value: '23 Invoices', sub: 'Require Verification', color: 'text-amber-600', bg: 'bg-amber-50', icon: '📝' },
    { label: 'Dispatched Value', value: '₹14.8 Lakhs', sub: 'This Month', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: '💰' },
    { label: 'Unpaid Invoices', value: '₹3.4 Lakhs', sub: 'Overdue: 2', color: 'text-rose-500', bg: 'bg-rose-50', icon: '📄' },
  ];

  const incomingOrders = [
    { orderId: 'PO-2026-8942', pharmacy: 'Apollo Pharmacy Central', items: 'ColdAct (500 boxes), Asthalin (100 boxes)', amount: '₹1,24,000', status: 'Approved' },
    { orderId: 'PO-2026-8943', pharmacy: 'MedPlus South', items: 'Paracetamol 650 (1000 boxes)', amount: '₹48,000', status: 'Pending Review' },
    { orderId: 'PO-2026-8944', pharmacy: 'Wellness Chemists', items: 'Cardace 5mg (300 packs)', amount: '₹75,500', status: 'Awaiting Payment' },
  ];

  return (
    <div className="p-2.5 animate-fade">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#C2410C] to-[#EA580C] rounded-[20px] p-[30px] text-white mb-[28px] shadow-[0_10px_25px_rgba(234,88,12,0.15)] relative overflow-hidden">
        <div className="relative z-[2]">
          <span className="bg-white/20 px-3 py-1.5 rounded-[20px] text-[12px] font-bold tracking-[1px]">
            PORTAL: PHARMA DISTRIBUTOR / STOCKIST
          </span>
          <h2 className="text-[28px] font-extrabold my-3.5 mb-1.5 tracking-[-0.5px]">
            Welcome, Distributor Partner!
          </h2>
          <p className="m-0 text-[14px] text-white/85 max-w-[500px]">
            Manage warehouse batches, review pharmacy purchase requests, dispatch logistics cargo, and track payment receipts.
          </p>
          <DailyQuote userRole="DISTRIBUTOR" variant="welcome" />
        </div>
        <div className="absolute right-[-50px] bottom-[-50px] text-[180px] opacity-10 select-none pointer-events-none">
          📦
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
        {/* Incoming Orders Table */}
        <div className="lg:col-span-2 bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-[16px] font-extrabold text-gray-800">Purchase Orders Pending dispatch</h3>
            <span className="text-[12px] font-bold text-[#EA580C] cursor-pointer">View All Orders ➔</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {incomingOrders.map((ord, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-[18px] w-[38px] h-[38px] bg-[#FFEDD5] text-[#EA580C] rounded-full flex items-center justify-center shrink-0">
                  📦
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[14px] font-bold text-gray-800">{ord.pharmacy}</span>
                    <span className="text-[12px] text-green-500 font-extrabold">{ord.amount}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Order: {ord.orderId} • Items: {ord.items}</div>
                </div>
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-[20px] ${ord.status.includes('Approved') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {ord.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Distributor Tasks */}
        <div className="bg-white border-[1.5px] border-gray-100 rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h3 className="m-0 mb-4.5 text-[16px] font-extrabold text-gray-800">Warehouse Tasks</h3>
          <div className="flex flex-col gap-2.5">
            <button className="w-full p-3 rounded-xl bg-[#EA580C] text-white font-bold text-[13px] hover:opacity-90 transition-opacity text-center cursor-pointer">
              🚚 Dispatch Cargo Shipment
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              📄 Invoice Generation Center
            </button>
            <button className="w-full p-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors text-center cursor-pointer">
              📦 Inventory Intake Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributorDashboard;
