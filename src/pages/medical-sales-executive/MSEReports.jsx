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
      <Card className="p-5 flex flex-col gap-5">
        
        {/* Category horizontal tabs */}
        <div>
          <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide mt-0 mb-3 ml-1">
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
                      ? 'bg-teal-600 text-white font-bold shadow-[0_4px_12px_rgba(13,148,136,0.2)]' 
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
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[12.5px] font-sans outline-none text-[#1F2937] bg-white font-semibold cursor-pointer"
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5 border-l-[5px] border-l-blue-500 flex flex-col justify-between">
                <div className="text-[11px] font-bold uppercase text-gray-400">Working Days</div>
                <div className="mt-1.5 text-[24px] font-extrabold text-gray-850">{currentData.totalWorkingDays || 0}</div>
              </Card>
              <Card className="p-5 border-l-[5px] border-l-emerald-500 flex flex-col justify-between">
                <div className="text-[11px] font-bold uppercase text-gray-400">Doctor Visits</div>
                <div className="mt-1.5 text-[24px] font-extrabold text-gray-850">{currentData.totalVisits || 0}</div>
              </Card>
              <Card className="p-5 border-l-[5px] border-l-purple-500 flex flex-col justify-between">
                <div className="text-[11px] font-bold uppercase text-gray-400">Chemist Visits</div>
                <div className="mt-1.5 text-[24px] font-extrabold text-gray-850">{currentData.totalChemistVisits || 0}</div>
              </Card>
              <Card className="p-5 border-l-[5px] border-l-teal-600 flex flex-col justify-between">
                <div className="text-[11px] font-bold uppercase text-gray-400">Unique Doctors Met</div>
                <div className="mt-1.5 text-[24px] font-extrabold text-gray-855">{currentData.uniqueDoctorsVisited || 0}</div>
              </Card>
            </div>

            {/* DCR log table */}
            {currentData.dcrs && currentData.dcrs.length > 0 && (
              <div className="flex flex-col">
                <h3 className="mt-2 mb-3 text-[14.5px] font-extrabold text-gray-850">Daily Call Reports (DCR) Logs</h3>
                <TableWrap>
                  <table className="w-full border-collapse">
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
                          <Td className="font-bold text-gray-805">{dcr.date}</Td>
                          <Td>{dcr.doctorVisitCount || 0} visits</Td>
                          <Td>{dcr.chemistVisitCount || 0} visits</Td>
                          <Td>
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-[10px] uppercase ${dcr.status === 'APPROVED' ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFFBEB] text-[#B45309]'}`}>
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
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-5 border-l-[5px] border-l-blue-500">
                <div className="text-[11px] font-bold uppercase text-gray-400">Total Working Days</div>
                <div className="mt-1.5 text-[24px] font-extrabold text-gray-850">{currentData.totalWorkingDays || 0}</div>
              </Card>
              <Card className="p-5 border-l-[5px] border-l-emerald-500">
                <div className="text-[11px] font-bold uppercase text-gray-400">Grand Total Doctor Visits</div>
                <div className="mt-1.5 text-[24px] font-extrabold text-gray-850">{currentData.grandTotalDoctorVisits || 0}</div>
              </Card>
            </div>

            {/* Chart: Activity Over Time */}
            <Card className="p-6">
              <h3 className="mb-5 text-[14.5px] font-extrabold text-gray-850">Daily Visit & Call Frequency Logs</h3>
              <div className="h-[280px] w-full">
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
              <table className="w-full border-collapse">
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
                      <Td className="font-bold text-gray-800">{row.date}</Td>
                      <Td>{row.visits} visits</Td>
                      <Td>{row.chemistCalls || 0} calls</Td>
                      <Td>{row.calls} calls</Td>
                      <Td>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-[10px] uppercase ${row.dcrStatus === 'APPROVED' ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFFBEB] text-[#B45309]'}`}>
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
            <div className="grid grid-cols-1">
              <Card className="p-5 border-l-[5px] border-l-teal-600">
                <div className="text-[11px] font-bold uppercase text-gray-400">Total Doctor Calls</div>
                <div className="mt-1.5 text-[24px] font-extrabold text-gray-850">{currentData.totalCalls || 0}</div>
              </Card>
            </div>

            {/* Table */}
            <TableWrap>
              <table className="w-full border-collapse">
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
                      <Td className="font-bold text-gray-805">{row.date}</Td>
                      <Td>{row.time || '—'}</Td>
                      <Td className="font-semibold text-gray-805">{row.doctorName}</Td>
                      <Td>{row.speciality || '—'}</Td>
                      <Td>{row.products || '—'}</Td>
                      <Td className="italic">{row.feedback || '—'}</Td>
                      <Td>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.gpsVerified ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FEF2F2] text-[#B91C1C]'}`}>
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
            <Card className="p-6">
              <div className="mb-[18px] flex items-start justify-between border-b border-gray-100 pb-[18px]">
                <div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                    currentData.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    DCR SHEET: {currentData.status || 'NO_REPORT'}
                  </span>
                  <h3 className="mb-0.5 mt-2 text-lg font-extrabold text-gray-900">Daily Call Report Sheet</h3>
                  <p className="text-xs text-gray-500">Date: <strong>{currentData.date}</strong></p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Verified Status</div>
                  <div className="mt-0.5 text-[13px] font-bold text-gray-900">{currentData.status || 'Pending'}</div>
                </div>
              </div>

              {/* Manager Comments */}
              {currentData.managerRemarks && (
                <div className="mb-5 rounded-xl border-l-4 border-l-emerald-500 bg-gray-50 px-4 py-3 text-[13px] italic text-gray-600">
                  "{currentData.managerRemarks}"
                </div>
              )}

              {/* Stat grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-[11px] font-bold uppercase text-gray-400">DOCTOR VISITS</div>
                  <div className="mt-1 text-[20px] font-extrabold text-gray-800">
                    {currentData.totalDoctorVisits || 0} Met
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-[11px] font-bold uppercase text-gray-400">CHEMIST VISITS</div>
                  <div className="mt-1 text-[20px] font-extrabold text-gray-800">
                    {currentData.totalChemistVisits || 0} Met
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-[11px] font-bold uppercase text-gray-400">GPS VERIFIED VISITS</div>
                  <div className="mt-1 text-[20px] font-extrabold text-gray-800">
                    {currentData.gpsVerifiedVisits || 0} Verified
                  </div>
                </div>
              </div>
            </Card>

            {/* Doctors detailed logs fallback - hidden dynamically if empty */}
            {currentData.doctorsMet && currentData.doctorsMet.length > 0 && (
              <Card className="p-6">
                <h3 className="mb-4 text-[14.5px] font-extrabold text-gray-850">Visited Doctor Records</h3>
                <div className="flex flex-col gap-3">
                  {currentData.doctorsMet.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border-[1.5px] border-gray-100 bg-gray-50 p-4">
                      <div>
                        <div className="text-sm font-extrabold text-gray-805">{doc.name}</div>
                        <div className="mt-0.5 text-xs text-gray-500">{doc.clinic} · <span className="font-semibold">{doc.time}</span></div>
                        <div className="mt-1.5 inline-block rounded bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
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
              <h3 className="text-base font-extrabold text-gray-900 m-0 mb-4">Daily Activity Verification Checklist</h3>
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
                    <div className="text-[13.5px] font-bold text-gray-800">DCR Visits Logged</div>
                    <div className="mt-0.5 text-[11px] text-gray-500">Doctor Visits: <strong>{currentData.totalDoctorVisits}</strong> | Chemist Visits: <strong>{currentData.totalChemistVisits}</strong></div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  <div className="flex-1">
                    <div className="text-[13.5px] font-bold text-gray-800">Samples Distributed</div>
                    <div className="mt-0.5 text-[11px] text-gray-500">Total Samples Distributed Count: <strong>{currentData.totalSamplesCount || 0}</strong></div>
                  </div>
                </div>

              </div>
            </Card>

            {/* Distributed Samples Section */}
            {currentData.totalSamplesDistributed && currentData.totalSamplesDistributed.length > 0 && (
              <Card className="p-24" style={{ padding: '24px' }}>
                <h3 className="text-[14.5px] font-extrabold text-gray-800 m-0 mb-3">Distributed Samples</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {currentData.totalSamplesDistributed.map((sample, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[13px] font-semibold text-gray-700 flex justify-between items-center">
                      <span>{typeof sample === 'object' ? (sample.name || sample.productName || 'Sample') : String(sample)}</span>
                      {typeof sample === 'object' && sample.quantity !== undefined && (
                        <span className="bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded text-xs font-bold">{sample.quantity}</span>
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
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-5 border-l-[5px] border-l-blue-500">
                <div className="text-[11px] font-bold uppercase text-gray-400">Week Doctor Visits</div>
                <div className="mt-1.5 text-[24px] font-extrabold text-gray-805">{currentData.weekTotalDoctorVisits || 0}</div>
              </Card>
              <Card className="p-5 border-l-[5px] border-l-emerald-500">
                <div className="text-[11px] font-bold uppercase text-gray-400">Week Chemist Visits</div>
                <div className="mt-1.5 text-[24px] font-extrabold text-gray-855">{currentData.weekTotalChemistVisits || 0}</div>
              </Card>
              <Card className="p-5 border-l-[5px] border-l-teal-650">
                <div className="text-[11px] font-bold uppercase text-gray-400">Date range</div>
                <div className="mt-3.5 text-[12.5px] font-bold text-gray-855 truncate">
                  {currentData.weekStartDate} to {currentData.weekEndDate}
                </div>
              </Card>
            </div>

            {/* Stacked Chart (visits & calls) */}
            <Card className="p-6">
              <h3 className="mb-5 text-[14.5px] font-extrabold text-gray-805">Weekly Cross Metrics Frequency</h3>
              <div className="h-[260px] w-full">
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
              <table className="w-full border-collapse">
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
                      <Td className="font-bold text-gray-805">{row.day}</Td>
                      <Td className="font-semibold">{row.date || '—'}</Td>
                      <Td>{row.doctorVisits} visits</Td>
                      <Td>{row.chemistCalls} calls</Td>
                      <Td>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                          row.dcrStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700'
                          : row.dcrStatus === 'SUBMITTED' ? 'bg-blue-50 text-blue-805'
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
