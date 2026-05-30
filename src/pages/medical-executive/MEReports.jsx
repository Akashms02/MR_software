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
      <div style={{
        background: '#ffffff',
        padding: '12px 16px',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        fontFamily: "'Inter', sans-serif"
      }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: '13px', marginBottom: '6px' }}>{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#4B5563', margin: '4px 0' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', backgroundColor: item.color }} />
            <span>{item.name}:</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>{item.value}</span>
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

export default function MEReports() {
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
      <div className="grid gap-6 items-start min-h-[600px]" style={{ gridTemplateColumns: '1fr 3fr' }}>
        
        {/* Left Side: Report Selector & Date configurations */}
        <div className="flex flex-col gap-5">
          {/* selectors */}
          <Card style={{ padding: '16px' }}>
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
                    className={`flex items-center gap-3 py-3 px-3.5 rounded-[10px] border-none cursor-pointer text-left w-full transition-all duration-150 font-[inherit] ${isActive ? 'bg-indigo-500 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] ${isActive ? 'font-bold' : 'font-semibold'}`}>{t.label}</div>
                      <div className={`text-[10.5px] whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>{t.sub}</div>
                    </div>
                    <ChevronRight size={14} color={isActive ? '#FFFFFF' : '#9CA3AF'} />
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Date Parameters & Representative Selector */}
          <Card style={{ padding: '18px' }}>
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
                <RefreshCw className="animate-spin" size={30} color="#6366F1" />
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <Card style={{ padding: '20px', borderLeft: '5px solid #3B82F6' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Planned Visits</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', marginTop: '6px' }}>{currentData.totalPlanned || 0}</div>
                </Card>
                <Card style={{ padding: '20px', borderLeft: '5px solid #10B981' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Completed Visits</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', marginTop: '6px' }}>{currentData.totalCompleted || 0}</div>
                </Card>
                <Card style={{ padding: '20px', borderLeft: '5px solid #6366F1' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Success Rate</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', marginTop: '6px' }}>
                    {currentData.successRate || (currentData.totalPlanned ? `${Math.round((currentData.totalCompleted / currentData.totalPlanned) * 100)}%` : '0%')}
                  </div>
                </Card>
              </div>

              {/* Chart: planned vs completed per territory */}
              {currentData.territories && currentData.territories.length > 0 && (
                <Card style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '14.5px', fontWeight: 800, color: '#1F2937' }}>Territory Performance Breakdown</h3>
                  <div style={{ width: '100%', height: 300 }}>
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
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                            <Td style={{ fontWeight: 700, color: '#1F2937' }}>{t.name}</Td>
                            <Td>{t.planned}</Td>
                            <Td>{t.completed}</Td>
                            <Td>
                              <span style={{
                                fontWeight: 700,
                                color: (t.completed/t.planned >= 0.8) ? '#059669' : '#D97706',
                                background: (t.completed/t.planned >= 0.8) ? '#ECFDF5' : '#FFFBEB',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '11.5px'
                              }}>
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
              <Card style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '14.5px', fontWeight: 800, color: '#1F2937' }}>Daily Visit & Call Frequency Logs</h3>
                <div style={{ width: '100%', height: 280 }}>
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
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                        <Td style={{ fontWeight: 700, color: '#1F2937' }}>{row.date}</Td>
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
              <Card style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '14.5px', fontWeight: 800, color: '#1F2937' }}>Specialty Target Call vs Actual Detailed</h3>
                <div style={{ width: '100%', height: 300 }}>
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
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                          <Td style={{ fontWeight: 700, color: '#1F2937' }}>{row.specialty}</Td>
                          <Td>{row.target}</Td>
                          <Td>{row.actual}</Td>
                          <Td>{row.samples || 0} units</Td>
                          <Td>
                            <span style={{
                              fontWeight: 700,
                              color: (row.actual/row.target >= 0.9) ? '#10B981' : '#EF4444',
                            }}>
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
              <Card style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F3F4F6', paddingBottom: '18px', marginBottom: '18px' }}>
                  <div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: currentData.status === 'APPROVED' ? '#ECFDF5' : '#FFFBEB',
                      color: currentData.status === 'APPROVED' ? '#047857' : '#B45309'
                    }}>
                      DCR SHEET: {currentData.status || 'SUBMITTED'}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '8px 0 2px 0' }}>Daily Call Report Sheet</h3>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Date: <strong>{currentData.date}</strong></p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Verified By</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>{currentData.approvedBy || 'Pending'}</div>
                  </div>
                </div>

                {/* Manager Comments */}
                {currentData.comments && (
                  <div style={{
                    background: '#F9FAFB',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    borderLeft: '4px solid #10B981',
                    fontSize: '13px',
                    color: '#4B5563',
                    marginBottom: '20px',
                    fontStyle: 'italic'
                  }}>
                    "{currentData.comments}"
                  </div>
                )}

                {/* Stat grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ background: '#FAFAFA', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>DOCTORS VISITED</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', marginTop: '4px' }}>
                      {currentData.doctorsMet?.length || 0} Met
                    </div>
                  </div>
                  <div style={{ background: '#FAFAFA', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>DAILY EXPENSES</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', marginTop: '4px' }}>
                      ₹{currentData.expenses ? Object.values(currentData.expenses).reduce((acc, v) => typeof v === 'number' ? acc + v : acc, 0) : 0}
                    </div>
                  </div>
                  <div style={{ background: '#FAFAFA', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>EXPENSE STATUS</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#10B981', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> {currentData.expenses?.status || 'APPROVED'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Doctors detailed logs */}
              {currentData.doctorsMet && currentData.doctorsMet.length > 0 && (
                <Card style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '14.5px', fontWeight: 800, color: '#1F2937' }}>Visited Doctor Records</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentData.doctorsMet.map((doc, idx) => (
                      <div key={idx} style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1.5px solid #F3F4F6',
                        background: '#FAFAFA',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 800, color: '#1F2937', fontSize: '14px' }}>{doc.name}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{doc.clinic} · <span style={{ fontWeight: 600 }}>{doc.time}</span></div>
                          <div style={{ fontSize: '12px', color: '#6366F1', marginTop: '6px', background: '#EEF2FF', color: '#4F46E5', display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                            Samples: {doc.samples}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', maxWidth: '250px' }}>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>VISIT DETAIL FEEDBACK</div>
                          <div style={{ fontSize: '12.5px', color: '#4B5563', marginTop: '4px', fontStyle: 'italic' }}>{doc.feedback}</div>
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
              <Card style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>Daily Activity Verification Checklist</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: '#FAFAFA' }}>
                    <CheckCircle2 color="#10B981" size={18} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>Daily Attendance Status</div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>Checked-In Status: <strong>{currentData.summary?.workingStatus || 'Present'}</strong></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: '#FAFAFA' }}>
                    <CheckCircle2 color="#10B981" size={18} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>Tour Plan Coverage</div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>Target Territory: <strong>{currentData.plannedTerritory}</strong> (Status: <strong>{currentData.tourPlanStatus}</strong>)</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: '#FAFAFA' }}>
                    <CheckCircle2 color="#10B981" size={18} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>DCR Visit Verification</div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>Productive: <strong>{currentData.summary?.productiveVisits}</strong> / Non-Productive: <strong>{currentData.summary?.nonProductiveVisits}</strong> (Total: <strong>{currentData.summary?.totalVisits}</strong>)</div>
                    </div>
                  </div>

                </div>
              </Card>

              {/* Tour Plan Remarks Card */}
              {currentData.summary?.remarks && (
                <Card style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#1F2937', margin: '0 0 12px 0' }}>Field Representative Remarks</h3>
                  <p style={{ fontSize: '13.5px', color: '#4B5563', margin: 0, lineHeight: 1.5, background: '#FAFAFA', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
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
              <Card style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '14.5px', fontWeight: 800, color: '#1F2937' }}>Weekly Cross Metrics Frequency</h3>
                <div style={{ width: '100%', height: 260 }}>
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
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                        <Td style={{ fontWeight: 700, color: '#1F2937' }}>{row.day}</Td>
                        <Td style={{ fontWeight: 600 }}>{row.territory}</Td>
                        <Td>{row.doctorVisits} visits</Td>
                        <Td>{row.chemistCalls} calls</Td>
                        <Td>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: row.dcrStatus === 'APPROVED' ? '#ECFDF5' : row.dcrStatus === 'SUBMITTED' ? '#EFF6FF' : '#F3F4F6',
                            color: row.dcrStatus === 'APPROVED' ? '#047857' : row.dcrStatus === 'SUBMITTED' ? '#1E40AF' : '#4B5563'
                          }}>
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
            <Card style={{ padding: '40px 24px', textAlign: 'center', background: '#FFFFFF', border: '1.5px dashed #E5E7EB' }}>
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
