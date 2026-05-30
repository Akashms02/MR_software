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
import { getMyTeam } from '../../redux/actions/teamActions';
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
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg font-sans">
        <p className="mb-1.5 text-[13px] font-bold text-gray-900">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="my-1 flex items-center gap-2 text-xs text-gray-600">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
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

export default function MSEReports() {
  const dispatch = useDispatch();

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

  // Team state from Redux
  const { team = [], loading: teamLoading } = useSelector(state => state.team || {});

  // Derived MR List from team list
  const mrList = (team || []).filter(
    (member) => (member.role || '').toUpperCase().trim() === 'MR'
  );
  const mrLoading = teamLoading;

  const [selectedMrId, setSelectedMrId] = useState('');
  const [activeReport, setActiveReport] = useState('visit-summary');

  // Filters State
  const [startDate, setStartDate] = useState(getFirstOfMonthString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [date, setDate] = useState(getTodayDateString()); 
  const [dateInWeek, setDateInWeek] = useState(getTodayDateString());

  // Fetch team on mount
  useEffect(() => {
    dispatch(getMyTeam());
  }, [dispatch]);

  // Automatically select the first MR in the team when loaded
  useEffect(() => {
    if (mrList.length > 0 && !selectedMrId) {
      setSelectedMrId(String(mrList[0].id));
    }
  }, [mrList, selectedMrId]);

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

  // Re-fetch report when category, selected MR, or date filters change
  useEffect(() => {
    if (selectedMrId) {
      handleFetchReport();
    }
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
    <div className="animate-[fadeIn_0.35s_ease-out] font-[Inter,sans-serif]">


      {/* Grid: Selectors on Left, Charts on Right */}
      <div className="grid grid-cols-[1fr_3fr] gap-6 items-start min-h-[600px]">
        
        {/* Left Side: Report Selector & Date configurations */}
        <div className="flex flex-col gap-5">
          {/* selectors */}
          <Card className="p-4">
            <h3 className="text-[12px] font-extrabold text-gray-400 uppercase tracking-wide ml-1.5 mb-3 mt-0">
              Report Category
            </h3>
            <div className="flex flex-col gap-1">
              {REPORT_TYPES.map((t) => {
                const isActive = activeReport === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveReport(t.id)}
                    className={`flex items-center gap-3 py-3 px-3.5 rounded-[10px] border-none cursor-pointer text-left w-full transition-all duration-150 font-[inherit] ${isActive ? 'bg-teal-600 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] ${isActive ? 'font-bold' : 'font-semibold'}`}>{t.label}</div>
                      <div className={`text-[10.5px] whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? 'text-teal-100' : 'text-gray-400'}`}>{t.sub}</div>
                    </div>
                    <ChevronRight size={14} color={isActive ? '#FFFFFF' : '#9CA3AF'} />
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Date Parameters & Representative Selector */}
          <Card className="p-[18px]">
            <h3 className="text-[12px] font-extrabold text-gray-400 uppercase tracking-wide mb-3.5 mt-0">
              Query Filters
            </h3>

            {/* Representative Selector */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5">FIELD REPRESENTATIVE</label>
              {mrLoading ? (
                <div className="text-xs text-gray-500">Loading representatives...</div>
              ) : mrList.length === 0 ? (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] text-red-500">No MR profiles found.</span>
                  <input
                    placeholder="Enter MR ID manually..."
                    value={selectedMrId}
                    onChange={(e) => setSelectedMrId(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-red-300 text-[12.5px] outline-none"
                  />
                </div>
              ) : (
                <select 
                  value={selectedMrId}
                  onChange={(e) => setSelectedMrId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-lg border border-gray-200 text-[13px] outline-none text-gray-800 bg-white font-semibold"
                >
                  {mrList.map(mr => (
                    <option key={mr.id} value={String(mr.id)}>
                      {mr.fullName || mr.name || `MR #${mr.id}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Range Pickers */}
            {(activeReport === 'visit-summary' || activeReport === 'datewise-daily' || activeReport === 'call-visit') && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1.5">START DATE</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full py-2 px-3 rounded-lg border border-gray-200 text-[12.5px] outline-none text-gray-800" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1.5">END DATE</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full py-2 px-3 rounded-lg border border-gray-200 text-[12.5px] outline-none text-gray-800" />
                </div>
              </div>
            )}

            {/* Single Date Picker */}
            {(activeReport === 'dcr-day' || activeReport === 'daily-activity') && (
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1.5">SELECT DATE</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full py-2 px-3 rounded-lg border border-gray-200 text-[12.5px] outline-none text-gray-800" />
              </div>
            )}

            {/* Week Picker */}
            {activeReport === 'weekly-cross' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1.5">DATE IN WEEK</label>
                <input type="date" value={dateInWeek} onChange={(e) => setDateInWeek(e.target.value)} className="w-full py-2 px-3 rounded-lg border border-gray-200 text-[12.5px] outline-none text-gray-800" />
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Visual Reports Screen */}
        <div className="flex flex-col gap-6 relative">
          
          {/* Loading Indicator */}
          {loading && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center z-50 rounded-2xl">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="animate-spin" size={30} color="#0D9488" />
                <span className="text-[13px] font-bold text-gray-800">Retrieving log metrics...</span>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2.5 py-3.5 px-[18px] bg-red-50 border border-red-300 rounded-xl text-red-700 text-[13px] font-medium">
              <AlertCircle size={18} />
              <span><strong>API Fetch Failed:</strong> {error}</span>
            </div>
          )}

          {/* Condition: Visit Summary */}
          {activeReport === 'visit-summary' && hasData() && (
            <>
              {/* Stat summary cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-5 border-l-[5px] border-l-blue-500">
                  <div className="text-[11px] font-bold uppercase text-gray-400">Planned Visits</div>
                  <div className="mt-1.5 text-[26px] font-extrabold text-gray-800">{currentData.totalPlanned || 0}</div>
                </Card>
                <Card className="p-5 border-l-[5px] border-l-emerald-500">
                  <div className="text-[11px] font-bold uppercase text-gray-400">Completed Visits</div>
                  <div className="mt-1.5 text-[26px] font-extrabold text-gray-800">{currentData.totalCompleted || 0}</div>
                </Card>
                <Card className="p-5 border-l-[5px] border-l-teal-600">
                  <div className="text-[11px] font-bold uppercase text-gray-400">Success Rate</div>
                  <div className="mt-1.5 text-[26px] font-extrabold text-gray-800">
                    {currentData.successRate || (currentData.totalPlanned ? `${Math.round((currentData.totalCompleted / currentData.totalPlanned) * 100)}%` : '0%')}
                  </div>
                </Card>
              </div>

              {/* Chart: planned vs completed per territory */}
              {currentData.territories && currentData.territories.length > 0 && (
                <Card className="p-6">
                  <h3 className="mb-5 text-[14.5px] font-extrabold text-gray-800">Territory Performance Breakdown</h3>
                  <div className="h-[300px] w-full">
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
                            <Td className="font-bold text-gray-800">{t.name}</Td>
                            <Td>{t.planned}</Td>
                            <Td>{t.completed}</Td>
                            <Td>
                              <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-bold ${
                                (t.completed/t.planned >= 0.8)
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
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
                <h3 className="mb-5 text-[14.5px] font-extrabold text-gray-800">Daily Visit & Call Frequency Logs</h3>
                <div className="h-[280px] w-full">
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
                        <Td className="font-bold text-gray-800">{row.date}</Td>
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
                <h3 className="mb-5 text-[14.5px] font-extrabold text-gray-800">Specialty Target Call vs Actual Detailed</h3>
                <div className="h-[300px] w-full">
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
                          <Td className="font-bold text-gray-800">{row.specialty}</Td>
                          <Td>{row.target}</Td>
                          <Td>{row.actual}</Td>
                          <Td>{row.samples || 0} units</Td>
                          <Td>
                            <span className={`font-bold ${
                              (row.actual/row.target >= 0.9) ? 'text-emerald-500' : 'text-red-500'
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
                <div className="mb-[18px] flex items-start justify-between border-b border-gray-100 pb-[18px]">
                  <div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                      currentData.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      DCR SHEET: {currentData.status || 'SUBMITTED'}
                    </span>
                    <h3 className="mb-0.5 mt-2 text-lg font-extrabold text-gray-900">Daily Call Report Sheet</h3>
                    <p className="text-xs text-gray-500">Date: <strong>{currentData.date}</strong></p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Verified By</div>
                    <div className="mt-0.5 text-[13px] font-bold text-gray-900">{currentData.approvedBy || 'Pending'}</div>
                  </div>
                </div>

                {/* Manager Comments */}
                {currentData.comments && (
                  <div className="mb-5 rounded-xl border-l-4 border-l-emerald-500 bg-gray-50 px-4 py-3 text-[13px] italic text-gray-600">
                    "{currentData.comments}"
                  </div>
                )}

                {/* Stat grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-[11px] font-bold uppercase text-gray-400">DOCTORS VISITED</div>
                    <div className="mt-1 text-[20px] font-extrabold text-gray-800">
                      {currentData.doctorsMet?.length || 0} Met
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-[11px] font-bold uppercase text-gray-400">DAILY EXPENSES</div>
                    <div className="mt-1 text-[20px] font-extrabold text-gray-800">
                      ₹{currentData.expenses ? Object.values(currentData.expenses).reduce((acc, v) => typeof v === 'number' ? acc + v : acc, 0) : 0}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-[11px] font-bold uppercase text-gray-400">EXPENSE STATUS</div>
                    <div className="mt-2.5 flex items-center gap-1 text-[13px] font-bold text-emerald-500">
                      <CheckCircle2 size={14} /> {currentData.expenses?.status || 'APPROVED'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Doctors detailed logs */}
              {currentData.doctorsMet && currentData.doctorsMet.length > 0 && (
                <Card className="p-6">
                  <h3 className="mb-4 text-[14.5px] font-extrabold text-gray-800">Visited Doctor Records</h3>
                  <div className="flex flex-col gap-3">
                    {currentData.doctorsMet.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-xl border-[1.5px] border-gray-100 bg-gray-50 p-4">
                        <div>
                          <div className="text-sm font-extrabold text-gray-800">{doc.name}</div>
                          <div className="mt-0.5 text-xs text-gray-500">{doc.clinic} · <span className="font-semibold">{doc.time}</span></div>
                          <div className="mt-1.5 inline-block rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                            Samples: {doc.samples}
                          </div>
                        </div>
                        <div className="max-w-[250px] text-right">
                          <div className="text-[11px] font-bold uppercase text-gray-400">VISIT DETAIL FEEDBACK</div>
                          <div className="mt-1 text-[12.5px] italic text-gray-600">{doc.feedback}</div>
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
                <h3 className="mb-4 text-base font-extrabold text-gray-900">Daily Activity Verification Checklist</h3>
                <div className="flex flex-col gap-3.5">
                  
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <CheckCircle2 className="text-emerald-500" size={18} />
                    <div className="flex-1">
                      <div className="text-[13.5px] font-bold text-gray-800">Daily Attendance Status</div>
                      <div className="mt-0.5 text-[11px] text-gray-500">Checked-In Status: <strong>{currentData.summary?.workingStatus || 'Present'}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <CheckCircle2 className="text-emerald-500" size={18} />
                    <div className="flex-1">
                      <div className="text-[13.5px] font-bold text-gray-800">Tour Plan Coverage</div>
                      <div className="mt-0.5 text-[11px] text-gray-500">Target Territory: <strong>{currentData.plannedTerritory}</strong> (Status: <strong>{currentData.tourPlanStatus}</strong>)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <CheckCircle2 className="text-emerald-500" size={18} />
                    <div className="flex-1">
                      <div className="text-[13.5px] font-bold text-gray-800">DCR Visit Verification</div>
                      <div className="mt-0.5 text-[11px] text-gray-500">Productive: <strong>{currentData.summary?.productiveVisits}</strong> / Non-Productive: <strong>{currentData.summary?.nonProductiveVisits}</strong> (Total: <strong>{currentData.summary?.totalVisits}</strong>)</div>
                    </div>
                  </div>

                </div>
              </Card>

              {/* Tour Plan Remarks Card */}
              {currentData.summary?.remarks && (
                <Card className="p-6">
                  <h3 className="mb-3 text-[14.5px] font-extrabold text-gray-800">Field Representative Remarks</h3>
                  <p className="m-0 rounded-xl border border-gray-100 bg-gray-50 p-4 text-[13.5px] leading-relaxed text-gray-600">
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
                <h3 className="mb-5 text-[14.5px] font-extrabold text-gray-800">Weekly Cross Metrics Frequency</h3>
                <div className="h-[260px] w-full">
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
                        <Td className="font-bold text-gray-800">{row.day}</Td>
                        <Td className="font-semibold">{row.territory}</Td>
                        <Td>{row.doctorVisits} visits</Td>
                        <Td>{row.chemistCalls} calls</Td>
                        <Td>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                            row.dcrStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700'
                            : row.dcrStatus === 'SUBMITTED' ? 'bg-blue-50 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
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
            <Card className="border-[1.5px] border-dashed border-gray-300 bg-white px-6 py-10 text-center">
              <ShieldAlert size={48} className="mx-auto mb-4 text-gray-400" />
              <h4 className="text-[15px] font-extrabold text-gray-700 mb-1.5 mt-0">No Database Records Found</h4>
              <p className="text-[12.5px] text-gray-500 m-0 max-w-[420px] mx-auto">
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
      `}</style>
    </div>
  );
}
