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
  Calendar, MapPin, Award, CheckCircle2, AlertCircle, ChevronRight, BarChart3, 
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
      <div className="bg-white p-3 border border-[#E5E7EB] rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.02)] font-sans">
        <p className="m-0 font-bold text-xs text-[#111827] mb-1.5">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[12px] color-[#4B5563] my-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
            <span>{item.name}:</span>
            <span className="font-bold text-[#111827]">{item.value}</span>
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

export default function AdminReports() {
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

  // Derived MR List from team list (MR, ME, MSE, etc.)
  const mrList = (team || []).filter((member) => {
    const role = (member.role || '').toUpperCase().trim();
    return role === 'MR' ||
           role === 'MEDICAL_REPRESENTATIVE' ||
           role === 'ME' ||
           role === 'MEDICAL_EXECUTIVE' ||
           role === 'MSE' ||
           role === 'MEDICAL_SALES_EXECUTIVE';
  });
  const mrLoading = teamLoading;

  const [selectedMrId, setSelectedMrId] = useState('');
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

  // Automatically select the first MR in the team when loaded
  useEffect(() => {
    if (mrList.length > 0 && !selectedMrId) {
      setSelectedMrId(String(mrList[0].id));
    }
  }, [mrList, selectedMrId]);

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
      <div className="flex items-center justify-between px-5 py-3 bg-[#F9FAFB] border-t border-[#E5E7EB] rounded-b-2xl">
        <div className="text-[12px] text-[#4B5563] font-semibold">
          Showing Page <span className="font-bold text-[#1F2937]">{paginator.currentPage}</span> of <span className="font-bold text-[#1F2937]">{paginator.pageCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={paginator.currentPage <= 1}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-[#E5E7EB] bg-white text-[#4B5563] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-150"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(paginator.pageCount, p + 1))}
            disabled={paginator.currentPage >= paginator.pageCount}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-[#E5E7EB] bg-white text-[#4B5563] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-150"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-[fadeIn_0.35s_ease-out] font-sans flex flex-col gap-6">

      {/* Top Filter Panel */}
      <Card className="p-5 flex flex-col gap-5">
        
        {/* Category horizontal tabs */}
        <div>
          <h3 className="text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-[0.5px] mt-0 mb-3 ml-1">
            Report Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map((t) => {
              const isActive = activeReport === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveReport(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-transparent cursor-pointer font-sans transition-all duration-150 text-[13px] ${isActive ? 'bg-[#C8F04A] text-[#1A1A1A] font-bold shadow-[0_4px_12px_rgba(200,240,74,0.2)]' : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] font-semibold'}`}
                >
                  <span className="text-[16px]">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Query parameters fields horizontally */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end border-t border-[#F3F4F6] pt-4.5">
          
          {/* Representative Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-[0.5px]">Field Representative</label>
            {mrLoading ? (
              <div className="py-2.5 text-xs text-[#6B7280]">Loading representatives...</div>
            ) : mrList.length === 0 ? (
              <input
                placeholder="Enter MR ID manually..."
                value={selectedMrId}
                onChange={(e) => setSelectedMrId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border-[1.5px] border-[#FCA5A5] text-[12.5px] font-sans outline-none"
              />
            ) : (
              <select 
                value={selectedMrId}
                onChange={(e) => setSelectedMrId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13px] font-sans outline-none text-[#1F2937] bg-white font-semibold cursor-pointer"
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
                <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-[0.5px]">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-[1.5px] border-[#E5E7EB] text-[12.5px] font-sans outline-none text-[#1F2937] font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-[0.5px]">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-[1.5px] border-[#E5E7EB] text-[12.5px] font-sans outline-none text-[#1F2937] font-medium"
                />
              </div>
            </>
          )}

          {/* Single Date Picker */}
          {(activeReport === 'dcr-day' || activeReport === 'daily-activity') && (
            <div className="flex flex-col gap-1.5">
              <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-[0.5px]">Select Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-[1.5px] border-[#E5E7EB] text-[12.5px] font-sans outline-none text-[#1F2937] font-medium"
              />
            </div>
          )}

          {/* Week Picker */}
          {activeReport === 'weekly-cross' && (
            <div className="flex flex-col gap-1.5">
              <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-[0.5px]">Date In Week</label>
              <input 
                type="date" 
                value={dateInWeek}
                onChange={(e) => setDateInWeek(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-[1.5px] border-[#E5E7EB] text-[12.5px] font-sans outline-none text-[#1F2937] font-medium"
              />
            </div>
          )}

        </div>
      </Card>

      {/* Reports Display Section */}
      <div className="flex flex-col gap-6 relative min-h-[300px]">
        
        {/* Loading Indicator */}
        {loading && (
          <div className="bg-white/75 backdrop-blur-[1px] absolute inset-0 flex items-center justify-center z-50 rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="animate-spin text-[#10B981]" size={30} />
              <span className="text-[13px] font-bold text-[#1E2937]">Retrieving live database logs...</span>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="flex items-center gap-2.5 px-4.5 py-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-[#B91C1C] text-[13px] font-medium">
            <AlertCircle size={18} />
            <span><strong>API Fetch Failed:</strong> {error}. Please verify the connection parameters.</span>
          </div>
        )}

        {/* Condition: Visit Summary */}
        {activeReport === 'visit-summary' && hasData() && (
          <>
            {/* Stat summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5 border-l-5 border-[#3B82F6] flex flex-col justify-between">
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Working Days</div>
                <div className="text-[24px] font-extrabold text-[#1F2937] mt-1.5">{currentData.totalWorkingDays || 0}</div>
              </Card>
              <Card className="p-5 border-l-5 border-[#10B981] flex flex-col justify-between">
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Doctor Visits</div>
                <div className="text-[24px] font-extrabold text-[#1F2937] mt-1.5">{currentData.totalVisits || 0}</div>
              </Card>
              <Card className="p-5 border-l-5 border-[#8B5CF6] flex flex-col justify-between">
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Chemist Visits</div>
                <div className="text-[24px] font-extrabold text-[#1F2937] mt-1.5">{currentData.totalChemistVisits || 0}</div>
              </Card>
              <Card className="p-5 border-l-5 border-[#F59E0B] flex flex-col justify-between">
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Unique Doctors Met</div>
                <div className="text-[24px] font-extrabold text-[#1F2937] mt-1.5">{currentData.uniqueDoctorsVisited || 0}</div>
              </Card>
            </div>

            {/* DCR log table */}
            {currentData.dcrs && currentData.dcrs.length > 0 && (
              <div className="flex flex-col">
                <h3 className="mt-2 mb-3 text-[14.5px] font-extrabold text-[#1F2937]">Daily Call Reports (DCR) Logs</h3>
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
                        <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                          <Td className="font-bold text-[#1F2937]">{dcr.date}</Td>
                          <Td>{dcr.doctorVisitCount || 0} visits</Td>
                          <Td>{dcr.chemistVisitCount || 0} visits</Td>
                          <Td>
                            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-[12px] uppercase ${dcr.status === 'APPROVED' ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFFBEB] text-[#B45309]'}`}>
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
              <Card className="p-5 border-l-5 border-[#3B82F6]">
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Total Working Days</div>
                <div className="text-[24px] font-extrabold text-[#1F2937] mt-1.5">{currentData.totalWorkingDays || 0}</div>
              </Card>
              <Card className="p-5 border-l-5 border-[#10B981]">
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Grand Total Doctor Visits</div>
                <div className="text-[24px] font-extrabold text-[#1F2937] mt-1.5">{currentData.grandTotalDoctorVisits || 0}</div>
              </Card>
            </div>

            {/* Chart: Activity Over Time */}
            <Card className="p-6">
              <h3 className="mt-0 mb-5 text-[14.5px] font-extrabold text-[#1F2937]">Daily Visit & Call Frequency Logs</h3>
              <div className="w-full h-[280px]">
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
                    <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                      <Td className="font-bold text-[#1F2937]">{row.date}</Td>
                      <Td>{row.visits} visits</Td>
                      <Td>{row.chemistCalls || 0} calls</Td>
                      <Td>{row.calls} calls</Td>
                      <Td>
                        <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-[12px] uppercase ${row.dcrStatus === 'APPROVED' ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFFBEB] text-[#B45309]'}`}>
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
              <Card className="p-5 border-l-5 border-[#3B82F6]">
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Total Doctor Calls</div>
                <div className="text-[24px] font-extrabold text-[#1F2937] mt-1.5">{currentData.totalCalls || 0}</div>
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
                    <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                      <Td className="font-bold text-[#1F2937]">{row.date}</Td>
                      <Td>{row.time || '—'}</Td>
                      <Td className="font-semibold text-[#1F2937]">{row.doctorName}</Td>
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
              <div className="flex justify-between items-start border-b border-[#F3F4F6] pb-4.5 mb-4.5">
                <div>
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-[20px] ${currentData.status === 'APPROVED' ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFFBEB] text-[#B45309]'}`}>
                    DCR SHEET: {currentData.status || 'NO_REPORT'}
                  </span>
                  <h3 className="text-[18px] font-extrabold text-[#111827] mt-2 mb-0.5">Daily Call Report Sheet</h3>
                  <p className="text-xs text-[#6B7280] m-0">Date: <strong>{currentData.date}</strong></p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#6B7280]">Verified Status</div>
                  <div className="text-[13px] font-bold text-[#111827] mt-0.5">{currentData.status || 'Pending'}</div>
                </div>
              </div>

              {/* Manager Comments */}
              {currentData.managerRemarks && (
                <div className="bg-[#F9FAFB] px-4 py-3 rounded-lg border-l-4 border-[#10B981] text-[13px] text-[#4B5563] mb-5 italic">
                  "{currentData.managerRemarks}"
                </div>
              )}

              {/* Stat grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#F3F4F6]">
                  <div className="text-[11px] text-[#9CA3AF] font-bold">DOCTOR VISITS</div>
                  <div className="text-[20px] font-extrabold text-[#1F2937] mt-1">
                    {currentData.totalDoctorVisits || 0} Met
                  </div>
                </div>
                <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#F3F4F6]">
                  <div className="text-[11px] text-[#9CA3AF] font-bold">CHEMIST VISITS</div>
                  <div className="text-[20px] font-extrabold text-[#1F2937] mt-1">
                    {currentData.totalChemistVisits || 0} Met
                  </div>
                </div>
                <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#F3F4F6]">
                  <div className="text-[11px] text-[#9CA3AF] font-bold">GPS VERIFIED VISITS</div>
                  <div className="text-[20px] font-extrabold text-[#1F2937] mt-1">
                    {currentData.gpsVerifiedVisits || 0} Verified
                  </div>
                </div>
              </div>
            </Card>

            {/* Doctors detailed logs fallback - hidden dynamically if empty */}
            {currentData.doctorsMet && currentData.doctorsMet.length > 0 && (
              <Card className="p-6">
                <h3 className="mt-0 mb-4 text-[14.5px] font-extrabold text-[#1F2937]">Visited Doctor Records</h3>
                <div className="flex flex-col gap-3">
                  {currentData.doctorsMet.map((doc, idx) => (
                    <div key={idx} className="p-4 rounded-xl border-[1.5px] border-[#F3F4F6] bg-[#FAFAFA] flex justify-between items-center">
                      <div>
                        <div className="font-extrabold text-[#1F2937] text-sm">{doc.name}</div>
                        <div className="text-xs text-[#6B7280] mt-0.5">{doc.clinic} · <span className="font-semibold">{doc.time}</span></div>
                        <div className="text-xs text-[#0369A1] mt-1.5 bg-[#E0F2FE] inline-block px-2 py-0.5 rounded-md font-semibold">
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

            {/* Chemists detailed logs - highlighted */}
            {currentData.chemistsMet && currentData.chemistsMet.length > 0 && (
              <Card className="p-6">
                <h3 className="mt-0 mb-4 text-[14.5px] font-extrabold text-[#1F2937]">Visited Chemist Records</h3>
                <div className="flex flex-col gap-3">
                  {currentData.chemistsMet.map((chem, idx) => (
                    <div key={idx} className="p-4 rounded-xl border-[1.5px] border-blue-200 bg-blue-50/20 flex justify-between items-center shadow-[0_2px_8px_rgba(59,130,246,0.04)]">
                      <div>
                        <span className="mb-1.5 inline-block rounded bg-blue-105 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-800 uppercase">Chemist / Pharmacy</span>
                        <div className="font-extrabold text-[#1F2937] text-sm">{chem.name}</div>
                        <div className="text-xs text-[#6B7280] mt-0.5">{chem.clinic} · <span className="font-semibold">{chem.time}</span></div>
                      </div>
                      <div className="text-right max-w-[250px]">
                        <div className="text-[11px] text-blue-600 font-bold">VISIT DETAIL FEEDBACK</div>
                        <div className="text-[12.5px] text-[#4B5563] mt-1 italic">{chem.feedback}</div>
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
              <h3 className="text-base font-extrabold text-[#111827] mt-0 mb-4">Daily Activity Verification Checklist</h3>
              <div className="flex flex-col gap-3.5">
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FAFAFA]">
                  <CheckCircle2 color="#10B981" size={18} />
                  <div className="flex-1">
                    <div className="text-[13.5px] font-bold text-[#1F2937]">Daily Attendance Status</div>
                    <div className="text-[11px] text-[#6B7280] mt-0.5">Checked-In Status: <strong>{currentData.summary?.workingStatus || 'Present'}</strong></div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FAFAFA]">
                  <CheckCircle2 color="#10B981" size={18} />
                  <div className="flex-1">
                    <div className="text-[13.5px] font-bold text-[#1F2937]">DCR Visits Logged</div>
                    <div className="text-[11px] text-[#6B7280] mt-0.5">Doctor Visits: <strong>{currentData.totalDoctorVisits}</strong> | Chemist Visits: <strong>{currentData.totalChemistVisits}</strong></div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FAFAFA]">
                  <CheckCircle2 color="#10B981" size={18} />
                  <div className="flex-1">
                    <div className="text-[13.5px] font-bold text-[#1F2937]">Samples Distributed</div>
                    <div className="text-[11px] text-[#6B7280] mt-0.5">Total Samples Distributed Count: <strong>{currentData.totalSamplesCount || 0}</strong></div>
                  </div>
                </div>

              </div>
            </Card>

            {/* Distributed Samples Section */}
            {currentData.totalSamplesDistributed && currentData.totalSamplesDistributed.length > 0 && (
              <Card className="p-6">
                <h3 className="text-[14.5px] font-extrabold text-[#1F2937] mt-0 mb-3">Distributed Samples</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {currentData.totalSamplesDistributed.map((sample, idx) => (
                    <div key={idx} className="p-3 bg-[#FAFAFA] rounded-xl border border-[#F3F4F6] text-[13px] font-semibold text-gray-700 flex justify-between items-center">
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
              <Card className="p-5 border-l-5 border-[#3B82F6]">
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Week Doctor Visits</div>
                <div className="text-[24px] font-extrabold text-[#1F2937] mt-1.5">{currentData.weekTotalDoctorVisits || 0}</div>
              </Card>
              <Card className="p-5 border-l-5 border-[#10B981]">
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Week Chemist Visits</div>
                <div className="text-[24px] font-extrabold text-[#1F2937] mt-1.5">{currentData.weekTotalChemistVisits || 0}</div>
              </Card>
              <Card className="p-5 border-l-5 border-[#F59E0B]">
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Date range</div>
                <div className="text-[12.5px] font-bold text-[#1F2937] mt-3.5 truncate">
                  {currentData.weekStartDate} to {currentData.weekEndDate}
                </div>
              </Card>
            </div>

            {/* Stacked Chart (visits & calls) */}
            <Card className="p-6">
              <h3 className="mt-0 mb-5 text-[14.5px] font-extrabold text-[#1F2937]">Weekly Cross Metrics Frequency</h3>
              <div className="w-full h-[260px]">
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
                    <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                      <Td className="font-bold text-[#1F2937]">{row.day}</Td>
                      <Td className="font-semibold">{row.date || '—'}</Td>
                      <Td>{row.doctorVisits} visits</Td>
                      <Td>{row.chemistCalls} calls</Td>
                      <Td>
                        <span className={`text-[11px] font-extrabold px-2 py-0.75 rounded-xl ${row.dcrStatus === 'APPROVED' ? 'bg-[#ECFDF5] text-[#047857]' : row.dcrStatus === 'SUBMITTED' ? 'bg-[#EFF6FF] text-[#1E40AF]' : 'bg-[#F3F4F6] text-[#4B5563]'}`}>
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
          <Card className="px-6 py-10 text-center bg-white border-[1.5px] border-dashed border-[#E5E7EB]">
            <ShieldAlert size={48} color="#9CA3AF" className="mx-auto mb-4" />
            <h4 className="text-[15px] font-extrabold text-[#374151] mt-0 mb-1.5">No Database Records Found</h4>
            <p className="text-[12.5px] text-[#6B7280] m-0 max-w-[420px] mx-auto">
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
