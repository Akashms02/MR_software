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
  const { user } = useSelector(state => state.auth || {});

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

  const [selectedMrId, setSelectedMrId] = useState(String(user?.id || ''));
  const [activeReport, setActiveReport] = useState('visit-summary');

  // Filters State
  const [startDate, setStartDate] = useState(getFirstOfMonthString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [date, setDate] = useState(getTodayDateString()); 
  const [dateInWeek, setDateInWeek] = useState(getTodayDateString());
  const [page, setPage] = useState(1);

  // Fetch team on mount
  useEffect(() => {
    dispatch(getMyTeam());
  }, [dispatch]);

  // Sync selectedMrId with user id initially when user loaded
  useEffect(() => {
    if (user?.id && !selectedMrId) {
      setSelectedMrId(String(user.id));
    }
  }, [user, selectedMrId]);

  // Derived MR List from team list (MR, ME, MSE, etc.)
  const mrList = [];
  if (user) {
    mrList.push({
      id: user.id,
      fullName: `${user.fullName || user.name || 'Self'} (Self)`
    });
  }
  (team || []).forEach((member) => {
    if (String(member.id) !== String(user?.id)) {
      const role = (member.role || '').toUpperCase().trim();
      if (role === 'MR' ||
          role === 'MEDICAL_REPRESENTATIVE' ||
          role === 'ME' ||
          role === 'MEDICAL_EXECUTIVE' ||
          role === 'MSE' ||
          role === 'MEDICAL_SALES_EXECUTIVE') {
        mrList.push(member);
      }
    }
  });

  // Trigger Action Dispatch
  const handleFetchReport = (targetPage = page) => {
    dispatch(clearReportErrors());
    if (!selectedMrId) return;

    switch (activeReport) {
      case 'visit-summary':
        dispatch(getVisitSummary(selectedMrId, startDate, endDate, targetPage, 10));
        break;
      case 'datewise-daily':
        dispatch(getDatewiseDaily(selectedMrId, startDate, endDate, targetPage, 10));
        break;
      case 'call-visit':
        dispatch(getCallVisit(selectedMrId, startDate, endDate, targetPage, 10));
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

  // Re-fetch report when category, selected MR, or date filters change (reset page to 1)
  useEffect(() => {
    if (selectedMrId) {
      setPage(1);
      handleFetchReport(1);
    }
  }, [activeReport, selectedMrId, startDate, endDate, date, dateInWeek]);

  // Re-fetch report when page changes
  useEffect(() => {
    if (selectedMrId && page > 1) {
      handleFetchReport(page);
    }
  }, [page]);

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
      return Array.isArray(currentData.list) && currentData.list.length > 0;
    }
    return typeof currentData === 'object' && !Array.isArray(currentData) && Object.keys(currentData).length > 0;
  };

  // Reusable Pagination component
  const renderPagination = (paginator) => {
    if (!paginator || paginator.pageCount <= 1) return null;
    return (
      <div className="flex items-center justify-between px-5 py-3.5 bg-white border-t border-gray-150 rounded-b-2xl">
        <div className="text-[12px] text-gray-500 font-semibold">
          Showing Page <span className="font-bold text-gray-850">{paginator.currentPage}</span> of <span className="font-bold text-gray-850">{paginator.pageCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={paginator.currentPage <= 1}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-150"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(paginator.pageCount, p + 1))}
            disabled={paginator.currentPage >= paginator.pageCount}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-150"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-[fadeIn_0.35s_ease-out] font-[Inter,sans-serif] flex flex-col gap-6">

      {/* Top Filter Panel */}
      <Card style={{ padding: '20px' }} className="flex flex-col gap-5">
        
        {/* Category horizontal tabs */}
        <div>
          <h3 className="text-[12px] font-extrabold text-gray-400 uppercase tracking-wide ml-1.5 mb-3 mt-0">
            Report Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map((t) => {
              const isActive = activeReport === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveReport(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-transparent cursor-pointer font-sans transition-all duration-150 text-[13px] ${
                    isActive 
                      ? 'bg-indigo-500 text-white font-bold shadow-[0_4px_12px_rgba(99,102,241,0.2)]' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 font-semibold'
                  }`}
                >
                  <span className="text-[16px]">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Query parameters fields horizontally */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end border-t border-gray-100 pt-4.5">

          {/* Representative Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-[11px] font-bold text-gray-650 uppercase tracking-wide">Field Representative</label>
            {teamLoading ? (
              <div className="py-2.5 text-xs text-gray-500">Loading representatives...</div>
            ) : (
              <select 
                value={selectedMrId}
                onChange={(e) => setSelectedMrId(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 text-[12.5px] outline-none text-gray-800 font-semibold bg-white cursor-pointer"
              >
                {mrList.map(mr => (
                  <option key={mr.id} value={String(mr.id)}>
                    {mr.fullName || mr.name || `MR #${mr.id}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date range pickers */}
          {(activeReport === 'visit-summary' || activeReport === 'datewise-daily' || activeReport === 'call-visit') && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="block text-[11px] font-bold text-gray-650 uppercase tracking-wide">Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="w-full py-2 px-3 rounded-lg border border-gray-200 text-[12.5px] outline-none text-gray-800" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="block text-[11px] font-bold text-gray-650 uppercase tracking-wide">End Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="w-full py-2 px-3 rounded-lg border border-gray-200 text-[12.5px] outline-none text-gray-800" 
                />
              </div>
            </>
          )}

          {/* Single Date Picker */}
          {(activeReport === 'dcr-day' || activeReport === 'daily-activity') && (
            <div className="flex flex-col gap-1.5">
              <label className="block text-[11px] font-bold text-gray-650 uppercase tracking-wide">Select Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full py-2 px-3 rounded-lg border border-gray-200 text-[12.5px] outline-none text-gray-800" 
              />
            </div>
          )}

          {/* Week Picker */}
          {activeReport === 'weekly-cross' && (
            <div className="flex flex-col gap-1.5">
              <label className="block text-[11px] font-bold text-gray-650 uppercase tracking-wide">Date In Week</label>
              <input 
                type="date" 
                value={dateInWeek} 
                onChange={(e) => setDateInWeek(e.target.value)} 
                className="w-full py-2 px-3 rounded-lg border border-gray-200 text-[12.5px] outline-none text-gray-800" 
              />
            </div>
          )}

        </div>
      </Card>

      {/* Reports Display Section */}
      <div className="flex flex-col gap-6 relative min-h-[300px]">
        
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <Card style={{ padding: '20px', borderLeft: '5px solid #3B82F6', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Working Days</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', marginTop: '6px' }}>{currentData.totalWorkingDays || 0}</div>
              </Card>
              <Card style={{ padding: '20px', borderLeft: '5px solid #10B981', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Doctor Visits</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', marginTop: '6px' }}>{currentData.totalVisits || 0}</div>
              </Card>
              <Card style={{ padding: '20px', borderLeft: '5px solid #8B5CF6', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Chemist Visits</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', marginTop: '6px' }}>{currentData.totalChemistVisits || 0}</div>
              </Card>
              <Card style={{ padding: '20px', borderLeft: '5px solid #6366F1', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Unique Doctors Met</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', marginTop: '6px' }}>{currentData.uniqueDoctorsVisited || 0}</div>
              </Card>
            </div>

            {/* DCR log table */}
            {currentData.dcrs && currentData.dcrs.length > 0 && (
              <div className="flex flex-col">
                <h3 style={{ marginTop: '8px', marginBottom: '12px', fontSize: '14.5px', fontWeight: 800, color: '#1F2937' }}>Daily Call Reports (DCR) Logs</h3>
                <TableWrap>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <Th>DCR Date</Th>
                        <Th>Doctor Visit Count</Th>
                        <Th>Chemist Visit Count</Th>
                        <Th>DCR Verification Status</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.dcrs.map((dcr, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <Td style={{ fontWeight: 700, color: '#1F2937' }}>{dcr.date}</Td>
                          <Td>{dcr.doctorVisitCount || 0} visits</Td>
                          <Td>{dcr.chemistVisitCount || 0} visits</Td>
                          <Td>
                            <span style={{
                              fontWeight: 700,
                              color: dcr.status === 'APPROVED' ? '#059669' : '#B45309',
                              background: dcr.status === 'APPROVED' ? '#ECFDF5' : '#FFFBEB',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '11.5px',
                              textTransform: 'uppercase'
                            }}>
                              {dcr.status || 'SUBMITTED'}
                            </span>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {renderPagination(currentData.paginator)}
                </TableWrap>
              </div>
            )}
          </>
        )}

        {/* Condition: Datewise Daily Report */}
        {activeReport === 'datewise-daily' && hasData() && (
          <>
            {/* Stat summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <Card style={{ padding: '20px', borderLeft: '5px solid #3B82F6' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Total Working Days</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', marginTop: '6px' }}>{currentData.totalWorkingDays || 0}</div>
              </Card>
              <Card style={{ padding: '20px', borderLeft: '5px solid #10B981' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Grand Total Doctor Visits</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', marginTop: '6px' }}>{currentData.grandTotalDoctorVisits || 0}</div>
              </Card>
            </div>

            {/* Chart: Activity Over Time */}
            <Card style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '14.5px', fontWeight: 800, color: '#1F2937' }}>Daily Visit & Call Frequency Logs</h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <AreaChart data={currentData.list}>
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
                    <Area name="Chemist Calls" type="monotone" dataKey="chemistCalls" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCalls)" />
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
                    <Th>DCR Verification Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.list.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <Td style={{ fontWeight: 700, color: '#1F2937' }}>{row.date}</Td>
                      <Td>{row.visits} visits</Td>
                      <Td>{row.chemistCalls || 0} calls</Td>
                      <Td>{row.calls} calls</Td>
                      <Td>
                        <span style={{
                          fontWeight: 700,
                          color: row.dcrStatus === 'APPROVED' ? '#059669' : '#B45309',
                          background: row.dcrStatus === 'APPROVED' ? '#ECFDF5' : '#FFFBEB',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          textTransform: 'uppercase'
                        }}>
                          {row.dcrStatus}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(currentData.paginator)}
            </TableWrap>
          </>
        )}

        {/* Condition: Call Visit Report */}
        {activeReport === 'call-visit' && hasData() && (
          <>
            {/* Stat Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <Card style={{ padding: '20px', borderLeft: '5px solid #3B82F6' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Total Doctor Calls</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', marginTop: '6px' }}>{currentData.totalCalls || 0}</div>
              </Card>
            </div>

            {/* Table */}
            <TableWrap>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Time</Th>
                    <Th>Doctor Name</Th>
                    <Th>Speciality</Th>
                    <Th>Products Discussed</Th>
                    <Th>Feedback</Th>
                    <Th>GPS Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.list.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <Td style={{ fontWeight: 700, color: '#1F2937' }}>{row.date}</Td>
                      <Td>{row.time || '—'}</Td>
                      <Td className="font-semibold" style={{ color: '#1F2937' }}>{row.doctorName}</Td>
                      <Td>{row.speciality || '—'}</Td>
                      <Td>{row.products || '—'}</Td>
                      <Td style={{ fontStyle: 'italic' }}>{row.feedback || '—'}</Td>
                      <Td>
                        <span style={{
                          fontWeight: 750,
                          color: row.gpsVerified ? '#059669' : '#B91C1C',
                          background: row.gpsVerified ? '#ECFDF5' : '#FEF2F2',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '10px'
                        }}>
                          {row.gpsVerified ? 'GPS VERIFIED' : 'UNVERIFIED'}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(currentData.paginator)}
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
                    DCR SHEET: {currentData.status || 'NO_REPORT'}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '8px 0 2px 0' }}>Daily Call Report Sheet</h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Date: <strong>{currentData.date}</strong></p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Verified Status</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>{currentData.status || 'Pending'}</div>
                </div>
              </div>

              {/* Manager Comments */}
              {currentData.managerRemarks && (
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
                  "{currentData.managerRemarks}"
                </div>
              )}

              {/* Stat grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ background: '#FAFAFA', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>DOCTOR VISITS</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', marginTop: '4px' }}>
                    {currentData.totalDoctorVisits || 0} Met
                  </div>
                </div>
                <div style={{ background: '#FAFAFA', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>CHEMIST VISITS</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', marginTop: '4px' }}>
                    {currentData.totalChemistVisits || 0} Met
                  </div>
                </div>
                <div style={{ background: '#FAFAFA', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>GPS VERIFIED VISITS</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', marginTop: '4px' }}>
                    {currentData.gpsVerifiedVisits || 0} Verified
                  </div>
                </div>
              </div>
            </Card>

            {/* Doctors detailed logs fallback - hidden dynamically if empty */}
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
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>DCR Visits Logged</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>Doctor Visits: <strong>{currentData.totalDoctorVisits}</strong> | Chemist Visits: <strong>{currentData.totalChemistVisits}</strong></div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: '#FAFAFA' }}>
                  <CheckCircle2 color="#10B981" size={18} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>Samples Distributed</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>Total Samples Distributed Count: <strong>{currentData.totalSamplesCount || 0}</strong></div>
                  </div>
                </div>

              </div>
            </Card>

            {/* Distributed Samples Section */}
            {currentData.totalSamplesDistributed && currentData.totalSamplesDistributed.length > 0 && (
              <Card style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#1F2937', margin: '0 0 12px 0' }}>Distributed Samples</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {currentData.totalSamplesDistributed.map((sample, idx) => (
                    <div key={idx} style={{ padding: '12px', background: '#FAFAFA', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '13px', fontWeight: 600, color: '#374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{typeof sample === 'object' ? (sample.name || sample.productName || 'Sample') : String(sample)}</span>
                      {typeof sample === 'object' && sample.quantity !== undefined && (
                        <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{sample.quantity}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* Condition: Weekly Cross Report */}
        {activeReport === 'weekly-cross' && hasData() && (
          <>
            {/* Stat summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <Card style={{ padding: '20px', borderLeft: '5px solid #3B82F6' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Week Doctor Visits</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', marginTop: '6px' }}>{currentData.weekTotalDoctorVisits || 0}</div>
              </Card>
              <Card style={{ padding: '20px', borderLeft: '5px solid #10B981' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Week Chemist Visits</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', marginTop: '6px' }}>{currentData.weekTotalChemistVisits || 0}</div>
              </Card>
              <Card style={{ padding: '20px', borderLeft: '5px solid #6366F1' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Date range</div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1F2937', marginTop: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentData.weekStartDate} to {currentData.weekEndDate}
                </div>
              </Card>
            </div>

            {/* Stacked Chart (visits & calls) */}
            <Card style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '14.5px', fontWeight: 800, color: '#1F2937' }}>Weekly Cross Metrics Frequency</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={currentData.list}>
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
                    <Th>Date</Th>
                    <Th>Doctor Visits</Th>
                    <Th>Chemist Calls</Th>
                    <Th>DCR Verification Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.list.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <Td style={{ fontWeight: 700, color: '#1F2937' }}>{row.day}</Td>
                      <Td style={{ fontWeight: 600 }}>{row.date || '—'}</Td>
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
