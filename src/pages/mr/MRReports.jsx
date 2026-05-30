import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
   getVisitSummary, 
   getDatewiseDaily, 
   getCallVisit, 
   getDcrDay, 
   getDailyActivity, 
   getWeeklyCross,
   clearReportErrors
} from '../../redux/actions/reportActions';
import { Card, TableWrap, Th, Td } from '../../components/ui';
import { 
   Calendar, MapPin, CheckCircle2, AlertCircle, ChevronRight, 
   RefreshCw, ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

// Date helpers
const getTodayDateString = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const getFirstOfMonthString = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${month}-01`;
};

// Recharts Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 border border-gray-200 rounded-xl shadow-lg font-sans">
        <p className="m-0 font-bold text-gray-900 text-[13px] mb-1.5">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[12px] text-gray-500 my-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
            <span>{item.name}:</span>
            <span className="font-bold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// REPORT TYPES CONFIGURATION
const REPORT_TYPES = [
  { id: 'visit-summary', label: 'Visit Summary', icon: '📊', sub: 'Planned vs completed visits' },
  { id: 'datewise-daily', label: 'Datewise Daily', icon: '📈', sub: 'Day-by-day activity logs' },
  { id: 'call-visit', label: 'Doctor Call Metrics', icon: '🩺', sub: 'Specialty call analysis' },
  { id: 'dcr-day', label: 'DCR Day Sheets', icon: '📝', sub: 'Full daily verification log' },
  { id: 'daily-activity', label: 'Daily Activity', icon: '🏃‍♂️', sub: 'Productive visits & tour plans' },
  { id: 'weekly-cross', label: 'Weekly Cross-Tab', icon: '🗓️', sub: 'Weekly log overview' },
];

export default function MRReports() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // Reports state from Redux
  const { 
    loading, 
    error, 
    visitSummary, 
    datewiseDaily, 
    callVisit, 
    dcrDay, 
    dailyActivity, 
    weeklyCross 
  } = useSelector(state => state.reports || {});

  const selectedMrId = String(user?.id || '1');
  const [activeReport, setActiveReport] = useState('visit-summary');

  // Filters State
  const [startDate, setStartDate] = useState(getFirstOfMonthString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [date, setDate] = useState(getTodayDateString()); 
  const [dateInWeek, setDateInWeek] = useState(getTodayDateString());

  // Trigger Action Dispatch
  const handleFetchReport = () => {
    dispatch(clearReportErrors());
    if (!selectedMrId) return;

    switch (activeReport) {
      case 'visit-summary':
        dispatch(getVisitSummary(selectedMrId, startDate, endDate));
        break;
      case 'datewise-daily':
        dispatch(getDatewiseDaily(selectedMrId, startDate, endDate));
        break;
      case 'call-visit':
        dispatch(getCallVisit(selectedMrId, startDate, endDate));
        break;
      case 'dcr-day':
        dispatch(getDcrDay(selectedMrId, date));
        break;
      case 'daily-activity':
        dispatch(getDailyActivity(selectedMrId, date));
        break;
      case 'weekly-cross':
        dispatch(getWeeklyCross(selectedMrId, dateInWeek));
        break;
      default:
        break;
    }
  };

  // Re-fetch report when category, or date filters change
  useEffect(() => {
    handleFetchReport();
  }, [activeReport, selectedMrId, startDate, endDate, date, dateInWeek]);

  // Resolve Active Redux Data
  const getActiveData = () => {
    switch (activeReport) {
      case 'visit-summary': return visitSummary?.data || visitSummary;
      case 'datewise-daily': return datewiseDaily?.data || datewiseDaily;
      case 'call-visit': return callVisit?.data || callVisit;
      case 'dcr-day': return dcrDay?.data || dcrDay;
      case 'daily-activity': return dailyActivity?.data || dailyActivity;
      case 'weekly-cross': return weeklyCross?.data || weeklyCross;
      default: return null;
    }
  };

  const currentData = getActiveData();

  // Check if data holds valid results
  const hasData = () => {
    if (!currentData) return false;
    
    if (activeReport === 'datewise-daily' || activeReport === 'call-visit' || activeReport === 'weekly-cross') {
      return Array.isArray(currentData) && currentData.length > 0;
    }
    
    if (Array.isArray(currentData) && currentData.length === 0) return false;
    if (activeReport === 'visit-summary' && !currentData.totalPlanned && (!currentData.territories || currentData.territories.length === 0)) return false;
    if (activeReport === 'dcr-day' && !currentData.date && (!currentData.doctorsMet || currentData.doctorsMet.length === 0)) return false;
    if (activeReport === 'daily-activity' && !currentData.date && !currentData.summary) return false;
    return true;
  };

  return (
    <div className="animate-[fadeIn_0.35s_ease-out] font-sans">

      {/* Grid: Selectors on Left, Charts on Right */}
      <div className="grid grid-cols-[1fr_3fr] gap-6 items-start min-h-[600px]">
        
        {/* Left Side: Report Selector & Date configurations */}
        <div className="flex flex-col gap-5">
          {/* selectors */}
          <Card className="p-4">
            <h3 className="text-[12px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-3 ml-1.5 mt-0">
              Report Category
            </h3>
            <div className="flex flex-col gap-1">
              {REPORT_TYPES.map((t) => {
                const isActive = activeReport === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveReport(t.id)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border-none cursor-pointer text-left w-full transition-all duration-150 font-sans ${
                      isActive 
                        ? 'bg-[#C8F04A] text-[#1A1A1A]' 
                        : 'bg-transparent text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[18px]">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] ${isActive ? 'font-bold' : 'font-semibold'}`}>{t.label}</div>
                      <div className={`text-[10.5px] truncate ${isActive ? 'text-[#374151]' : 'text-[#9CA3AF]'}`}>{t.sub}</div>
                    </div>
                    <ChevronRight size={14} className={isActive ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'} />
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Date Parameters */}
          <Card className="p-4.5">
            <h3 className="text-[12px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-3.5 mt-0">
              Date Filters
            </h3>

            {/* Range Pickers */}
            {(activeReport === 'visit-summary' || activeReport === 'datewise-daily' || activeReport === 'call-visit') && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4B5563] mb-1.5">START DATE</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[12.5px] font-sans outline-none text-[#1F2937]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4B5563] mb-1.5">END DATE</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[12.5px] font-sans outline-none text-[#1F2937]"
                  />
                </div>
              </div>
            )}

            {/* Single Date Picker */}
            {(activeReport === 'dcr-day' || activeReport === 'daily-activity') && (
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] mb-1.5">SELECT DATE</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[12.5px] font-sans outline-none text-[#1F2937]"
                />
              </div>
            )}

            {/* Week Picker */}
            {activeReport === 'weekly-cross' && (
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] mb-1.5">DATE IN WEEK</label>
                <input 
                  type="date" 
                  value={dateInWeek}
                  onChange={(e) => setDateInWeek(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[12.5px] font-sans outline-none text-[#1F2937]"
                />
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Visual Reports Screen */}
        <div className="flex flex-col gap-6 relative">
          
          {/* Loading Indicator */}
          {loading && (
            <div className="bg-white/75 backdrop-blur-[1px] absolute inset-0 flex items-center justify-center z-50 rounded-2xl">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="animate-spin text-[#C8F04A]" size={30} />
                <span className="text-[13px] font-bold text-[#1E2937]">Retrieving your log metrics...</span>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 px-4.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-[#B91C1C] text-[13px] font-medium">
              <AlertCircle size={18} />
              <span><strong>API Fetch Failed:</strong> {error}</span>
            </div>
          )}

          {/* Condition: Visit Summary */}
          {activeReport === 'visit-summary' && hasData() && (
            <>
              {/* Stat summary cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-5 border-l-[5px] border-l-[#3B82F6]">
                  <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Planned Visits</div>
                  <div className="text-[26px] font-extrabold text-[#1F2937] mt-1.5">{currentData.totalPlanned || 0}</div>
                </Card>
                <Card className="p-5 border-l-[5px] border-l-[#10B981]">
                  <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Completed Visits</div>
                  <div className="text-[26px] font-extrabold text-[#1F2937] mt-1.5">{currentData.totalCompleted || 0}</div>
                </Card>
                <Card className="p-5 border-l-[5px] border-l-[#C8F04A]">
                  <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Success Rate</div>
                  <div className="text-[26px] font-extrabold text-[#1F2937] mt-1.5">
                    {currentData.successRate || (currentData.totalPlanned ? `${Math.round((currentData.totalCompleted / currentData.totalPlanned) * 100)}%` : '0%')}
                  </div>
                </Card>
              </div>

              {/* Chart: planned vs completed per territory */}
              {currentData.territories && currentData.territories.length > 0 && (
                <Card className="p-6">
                  <h3 className="m-0 mb-5 text-[14.5px] font-extrabold text-[#1F2937]">Territory Performance Breakdown</h3>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer>
                      <BarChart data={currentData.territories}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="name" fontSize={11} stroke="#9CA3AF" />
                        <YAxis fontSize={11} stroke="#9CA3AF" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                        <Bar name="Planned Visits" dataKey="planned" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                        <Bar name="Completed Visits" dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* Detailed territory list */}
              {currentData.territories && currentData.territories.length > 0 && (
                <TableWrap>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <Th>Territory Name</Th>
                        <Th>Planned visits</Th>
                        <Th>Completed visits</Th>
                        <Th>Success Rate</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.territories.map((t, idx) => {
                        const pct = t.planned ? `${Math.round((t.completed / t.planned) * 100)}%` : '0%';
                        return (
                          <tr key={idx}>
                            <Td className="font-bold text-[#1F2937]">{t.name}</Td>
                            <Td>{t.planned}</Td>
                            <Td>{t.completed}</Td>
                            <Td>
                              <span className={`font-bold px-2 py-0.5 rounded-full text-[11.5px] ${
                                (t.completed/t.planned >= 0.8) ? 'text-[#059669] bg-[#ECFDF5]' : 'text-[#D97706] bg-[#FFFBEB]'
                              }`}>
                                {pct}
                              </span>
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </TableWrap>
              )}
            </>
          )}

          {/* Condition: Datewise Daily Report */}
          {activeReport === 'datewise-daily' && hasData() && (
            <>
              {/* Chart: Activity Over Time */}
              <Card className="p-6">
                <h3 className="m-0 mb-5 text-[14.5px] font-extrabold text-[#1F2937]">Daily Visit & Call Frequency Logs</h3>
                <div className="w-full h-[280px]">
                  <ResponsiveContainer>
                    <AreaChart data={currentData}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="date" fontSize={11} stroke="#9CA3AF" />
                      <YAxis fontSize={11} stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                      <Area name="Completed Visits" type="monotone" dataKey="visits" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisits)" />
                      <Area name="Doctor Calls" type="monotone" dataKey="calls" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCalls)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Detailed logs table */}
              <TableWrap>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>Visits Completed</Th>
                      <Th>Chemist Calls</Th>
                      <Th>Total Doctor Calls</Th>
                      <Th>Travel (km)</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((row, idx) => (
                      <tr key={idx}>
                        <Td className="font-bold text-[#1F2937]">{row.date}</Td>
                        <Td>{row.visits} visits</Td>
                        <Td>{row.chemistCalls || 0} calls</Td>
                        <Td>{row.calls} calls</Td>
                        <Td>{row.travelKm || 0} km</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </>
          )}

          {/* Condition: Call Visit Report */}
          {activeReport === 'call-visit' && hasData() && (
            <>
              {/* Chart: Specialty Target vs Actual */}
              <Card className="p-6">
                <h3 className="m-0 mb-5 text-[14.5px] font-extrabold text-[#1F2937]">Specialty Target Call vs Actual Detailed</h3>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer>
                    <BarChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="specialty" fontSize={11} stroke="#9CA3AF" />
                      <YAxis fontSize={11} stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                      <Bar name="Target Calls" dataKey="target" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar name="Actual Calls" dataKey="actual" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Table of detail */}
              <TableWrap>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <Th>Doctor Specialty</Th>
                      <Th>Target Calls</Th>
                      <Th>Actual Calls Met</Th>
                      <Th>Chemist Samples Distributed</Th>
                      <Th>Achievement</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((row, idx) => {
                      const rate = row.target ? `${Math.round((row.actual / row.target) * 100)}%` : '0%';
                      return (
                        <tr key={idx}>
                          <Td className="font-bold text-[#1F2937]">{row.specialty}</Td>
                          <Td>{row.target}</Td>
                          <Td>{row.actual}</Td>
                          <Td>{row.samples || 0} units</Td>
                          <Td>
                            <span className={`font-bold ${
                              (row.actual/row.target >= 0.9) ? 'text-[#10B981]' : 'text-[#EF4444]'
                            }`}>
                              {rate}
                            </span>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableWrap>
            </>
          )}

          {/* Condition: DCR Day Report */}
          {activeReport === 'dcr-day' && hasData() && (
            <>
              {/* DCR Verification Sheet */}
              <Card className="p-6">
                <div className="flex justify-between items-start border-b border-[#F3F4F6] pb-[18px] mb-[18px]">
                  <div>
                    <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                      currentData.status === 'APPROVED' ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFFBEB] text-[#B45309]'
                    }`}>
                      DCR SHEET: {currentData.status || 'SUBMITTED'}
                    </span>
                    <h3 className="text-[18px] font-extrabold text-[#111827] mt-2 mb-0.5">Daily Call Report Sheet</h3>
                    <p className="text-[12px] text-[#6B7280] m-0">Date: <strong>{currentData.date}</strong></p>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] text-[#6B7280]">Verified By</div>
                    <div className="text-[13px] font-bold text-[#111827] mt-0.5">{currentData.approvedBy || 'Pending'}</div>
                  </div>
                </div>

                {/* Manager Comments */}
                {currentData.comments && (
                  <div className="bg-[#F9FAFB] p-4 rounded-xl border-l-4 border-l-[#10B981] text-[13px] text-[#4B5563] mb-5 italic">
                    "{currentData.comments}"
                  </div>
                )}

                {/* Stat grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#F3F4F6]">
                    <div className="text-[11px] text-[#9CA3AF] font-bold">DOCTORS VISITED</div>
                    <div className="text-[20px] font-extrabold text-[#1F2937] mt-1">
                      {currentData.doctorsMet?.length || 0} Met
                    </div>
                  </div>
                  <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#F3F4F6]">
                    <div className="text-[11px] text-[#9CA3AF] font-bold">DAILY EXPENSES</div>
                    <div className="text-[20px] font-extrabold text-[#1F2937] mt-1">
                      ₹{currentData.expenses ? Object.values(currentData.expenses).reduce((acc, v) => typeof v === 'number' ? acc + v : acc, 0) : 0}
                    </div>
                  </div>
                  <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#F3F4F6]">
                    <div className="text-[11px] text-[#9CA3AF] font-bold">EXPENSE STATUS</div>
                    <div className="text-[13px] font-bold text-[#10B981] mt-2.5 flex items-center gap-1">
                      <CheckCircle2 size={14} /> {currentData.expenses?.status || 'APPROVED'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Doctors detailed logs */}
              {currentData.doctorsMet && currentData.doctorsMet.length > 0 && (
                <Card className="p-6">
                  <h3 className="m-0 mb-4 text-[14.5px] font-extrabold text-[#1F2937]">Visited Doctor Records</h3>
                  <div className="flex flex-col gap-3">
                    {currentData.doctorsMet.map((doc, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] flex justify-between items-center">
                        <div>
                          <div className="font-extrabold text-[#1F2937] text-[14px]">{doc.name}</div>
                          <div className="text-[12px] text-[#6B7280] mt-0.5">{doc.clinic} · <span className="font-semibold">{doc.time}</span></div>
                          <div className="text-[12px] mt-1.5 bg-[#E0F2FE] text-[#0369A1] inline-block px-2.5 py-0.5 rounded font-semibold">
                            Samples: {doc.samples}
                          </div>
                        </div>
                        <div className="text-right max-w-[250px]">
                          <div className="text-[11px] text-[#9CA3AF] font-bold">VISIT DETAIL FEEDBACK</div>
                          <div className="text-[12.5px] text-[#4B5563] mt-1 italic">{doc.feedback}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Condition: Daily Activity Summary */}
          {activeReport === 'daily-activity' && hasData() && (
            <>
              {/* Daily Checklist card */}
              <Card className="p-6">
                <h3 className="text-[16px] font-extrabold text-[#111827] m-0 mb-4">Daily Activity Verification Checklist</h3>
                <div className="flex flex-col gap-3.5">
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFA]">
                    <CheckCircle2 color="#10B981" size={18} />
                    <div className="flex-1">
                      <div className="text-[13.5px] font-bold text-[#1F2937]">Daily Attendance Status</div>
                      <div className="text-[11px] text-[#6B7280] mt-0.5">Checked-In Status: <strong>{currentData.summary?.workingStatus || 'Present'}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFA]">
                    <CheckCircle2 color="#10B981" size={18} />
                    <div className="flex-1">
                      <div className="text-[13.5px] font-bold text-[#1F2937]">Tour Plan Coverage</div>
                      <div className="text-[11px] text-[#6B7280] mt-0.5">Target Territory: <strong>{currentData.plannedTerritory}</strong> (Status: <strong>{currentData.tourPlanStatus}</strong>)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFA]">
                    <CheckCircle2 color="#10B981" size={18} />
                    <div className="flex-1">
                      <div className="text-[13.5px] font-bold text-[#1F2937]">DCR Visit Verification</div>
                      <div className="text-[11px] text-[#6B7280] mt-0.5">Productive: <strong>{currentData.summary?.productiveVisits}</strong> / Non-Productive: <strong>{currentData.summary?.nonProductiveVisits}</strong> (Total: <strong>{currentData.summary?.totalVisits}</strong>)</div>
                    </div>
                  </div>

                </div>
              </Card>

              {/* Tour Plan Remarks Card */}
              {currentData.summary?.remarks && (
                <Card className="p-6">
                  <h3 className="text-[14.5px] font-extrabold text-[#1F2937] m-0 mb-3">Field Representative Remarks</h3>
                  <p className="text-[13.5px] text-[#4B5563] m-0 leading-relaxed bg-[#FAFAFA] p-4 rounded-xl border border-[#F3F4F6]">
                    {currentData.summary.remarks}
                  </p>
                </Card>
              )}
            </>
          )}

          {/* Condition: Weekly Cross Report */}
          {activeReport === 'weekly-cross' && hasData() && (
            <>
              {/* Stacked Chart (visits & calls) */}
              <Card className="p-6">
                <h3 className="m-0 mb-5 text-[14.5px] font-extrabold text-[#1F2937]">Weekly Cross Metrics Frequency</h3>
                <div className="w-full h-[260px]">
                  <ResponsiveContainer>
                    <BarChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="day" fontSize={11} stroke="#9CA3AF" />
                      <YAxis fontSize={11} stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                      <Bar name="Doctor Visits" dataKey="doctorVisits" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} barSize={24} />
                      <Bar name="Chemist Calls" dataKey="chemistCalls" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Cross-tab Weekly Table */}
              <TableWrap>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <Th>Day</Th>
                      <Th>Target Territory Covered</Th>
                      <Th>Doctor Visits</Th>
                      <Th>Chemist Calls</Th>
                      <Th>DCR Verification Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((row, idx) => (
                      <tr key={idx}>
                        <Td className="font-bold text-[#1F2937]">{row.day}</Td>
                        <Td className="font-semibold">{row.territory}</Td>
                        <Td>{row.doctorVisits} visits</Td>
                        <Td>{row.chemistCalls} calls</Td>
                        <Td>
                          <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                            row.dcrStatus === 'APPROVED' ? 'bg-[#ECFDF5] text-[#047857]' : row.dcrStatus === 'SUBMITTED' ? 'bg-[#EFF6FF] text-[#1E40AF]' : 'bg-[#F3F4F6] text-[#4B5563]'
                          }`}>
                            {row.dcrStatus}
                          </span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </>
          )}

          {/* Fallback state when there's no data */}
          {!hasData() && !loading && (
            <Card className="p-10 text-center bg-white border border-dashed border-gray-200">
              <ShieldAlert size={48} className="text-[#9CA3AF] mx-auto mb-4" />
              <h4 className="text-[15px] font-extrabold text-[#374151] m-0 mb-1.5">No Database Records Found</h4>
              <p className="text-[12.5px] text-[#6B7280] m-0 max-w-[420px] mx-auto">
                There are no logs matching the active selection. This is a live query; configure different dates or represent another representative.
              </p>
            </Card>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
