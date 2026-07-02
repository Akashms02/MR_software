import React, { useState, useEffect } from 'react'
import { ChevronRight, Search, Loader2, Mail, Phone, Users, AlertCircle } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { getMyTeam } from '../../redux/actions/teamActions'
import { getFullAssetUrl } from '../../utils/getFullAssetUrl'
import Pagination from '../../components/common/Pagination'

const STATUS_BADGE = {
  'Active':   'bg-[#ECFDF5] text-[#059669]',
  'Inactive': 'bg-[#FFF1F2] text-[#F43F5E]',
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

const formatRole = (roleStr) => {
  if (!roleStr) return 'Employee'
  return roleStr.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function Avatar({ name, size = 72 }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'
  return (
    <div
      className="rounded-full bg-gradient-to-br from-[#CBD5E1] to-[#94A3B8] flex items-center justify-center text-white shrink-0 font-bold"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  )
}

function EmployeeCard({ name, role, status, email, phone, employeeId, joinedOn, photoUrl }) {
  const badgeClass = STATUS_BADGE[status] || STATUS_BADGE['Active']

  return (
    <div 
      className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-[18px] py-[22px] relative flex flex-col items-center text-center transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 border-[1.5px] border-[#F3F4F6]"
    >
      {/* External link top right */}
      <button className="absolute top-3.5 right-3.5 bg-none border-0 cursor-pointer text-[#9CA3AF] text-sm p-0">
        ↗
      </button>

      {/* Avatar */}
      {photoUrl ? (
          <img src={getFullAssetUrl(photoUrl)} alt={name} className="w-18 h-18 rounded-full object-cover" />
        ) : (
          <Avatar name={name} size={72} />
        )}

      {/* Name + Role */}
      <div className="text-sm font-extrabold text-[#111827] mt-3 mb-0.5">{name}</div>
      <div className="text-[11.5px] text-[#9CA3AF] mb-3 font-semibold">{role}</div>

      {/* Status badge */}
      <div className={`px-3.5 py-1 rounded-md text-[10px] font-bold mb-4 tracking-[0.3px] ${badgeClass}`}>
        {status.toUpperCase()}
      </div>

      {/* Details */}
      <div className="w-full border-t border-[#F3F4F6] pt-3.5 flex flex-col gap-1.5 text-left">
        {[
          ['ID', employeeId],
          ['Mail', email],
          ['Phone', phone],
          ['Joined', joinedOn]
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-[#9CA3AF] font-medium">{k}</span>
            <span className="text-[#374151] font-semibold max-w-[130px] text-right truncate whitespace-nowrap">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SidebarItem({ label }) {
  return (
    <div 
      className="flex items-center justify-between px-3.5 py-[11px] bg-[#F9FAFB] rounded-xl cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#F3F4F6] hover:translate-x-1"
    >
      <span className="text-xs font-semibold text-[#374151]">{label}</span>
      <ChevronRight size={15} className="text-[#C8F04A]" strokeWidth={2.5} />
    </div>
  )
}

const SkeletonCard = () => (
  <div className="bg-white rounded-[20px] px-5 py-6 relative flex flex-col items-center border-[1.5px] border-[#F3F4F6] gap-3">
    <div className="w-18 h-18 rounded-full bg-[#F3F4F6] animate-pulse" />
    <div className="w-[120px] h-4 rounded bg-[#F3F4F6] animate-pulse" />
    <div className="w-20 h-3 rounded bg-[#F3F4F6] animate-pulse" />
    <div className="w-[60px] h-5 rounded-md bg-[#F3F4F6] animate-pulse" />
    <div className="w-full border-t border-[#F3F4F6] pt-3.5 flex flex-col gap-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex justify-between">
          <div className="w-[50px] h-2.5 rounded bg-[#F3F4F6] animate-pulse" />
          <div className="w-20 h-2.5 rounded bg-[#F3F4F6] animate-pulse" />
        </div>
      ))}
    </div>
  </div>
)

export default function AdminEmployees() {
  const dispatch = useDispatch()
  const { team, totalElements, totalPages, loading, error } = useSelector((state) => state.team)
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 12 // 12 cards per page (multiple of 4)

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(0)
  }, [searchQuery])

  // Trigger data fetch when page or search changes
  useEffect(() => {
    if (searchQuery) {
      dispatch(getMyTeam(0, 100000))
    } else {
      dispatch(getMyTeam(currentPage, pageSize))
    }
  }, [dispatch, currentPage, pageSize, searchQuery])

  // Filters based on the exact live API fields
  const filteredEmployees = (team || []).filter(
    (emp) =>
      !searchQuery ||
      emp.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // If search is active, do local slicing. If not, use backend paginated team list directly.
  const displayedEmployees = searchQuery 
    ? filteredEmployees.slice(currentPage * pageSize, (currentPage + 1) * pageSize) 
    : (team || [])

  const totalCount = searchQuery ? filteredEmployees.length : totalElements
  const pageCount = searchQuery ? Math.ceil(totalCount / pageSize) : totalPages

  return (
    <div className="animate-fade font-sans">

      {/* Search Input bar and stats (duplicate headings removed) */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
        <div>
          <span className="bg-white border border-[#E5E7EB] text-[#6B7280] text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm">
            {totalCount} Employees Total
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search 
              size={15} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" 
            />
            <input 
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 pr-3 py-2 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13px] outline-none w-[240px] transition-colors duration-200 focus:border-[#111827]"
            />
          </div>
        </div>
      </div>

      {/* Profiles Grid (full width without sidebar) */}
      <div className="w-full">
        {/* Skeleton Loader during fetch */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* API Error Notification */}
        {error && (
          <div className="p-6 bg-[#FEF2F2] border-[1.5px] border-[#FCA5A5] rounded-2xl text-[#B91C1C] flex items-center gap-3 text-[13px] mb-5">
            <AlertCircle size={20} />
            <span><strong>Failed to load employees:</strong> {error}. Please verify server connection parameters.</span>
          </div>
        )}

        {/* Employees List View */}
        {!loading && (
          <div className="flex flex-col gap-6">
            {displayedEmployees.length === 0 ? (
              <div className="px-6 py-[50px] text-center bg-white rounded-2xl border-[1.5px] border-dashed border-[#E5E7EB] text-[#9CA3AF]">
                <Users size={40} className="mb-3 text-[#CBD5E1] mx-auto" />
                <h4 className="text-[15px] font-extrabold text-[#4B5563] mt-0 mb-1.5">No Employees Found</h4>
                <p className="text-xs text-[#9CA3AF] m-0">
                  {searchQuery ? `No employees match "${searchQuery}"` : 'Your database team list is empty.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayedEmployees.map((member) => (
                    <EmployeeCard 
                      key={member.id}
                      name={member.fullName || 'Unknown'}
                      role={formatRole(member.role)}
                      status={member.enabled ? 'Active' : 'Inactive'}
                      email={member.email || 'N/A'}
                      phone={member.phone || 'N/A'}
                      employeeId={member.employeeId || 'N/A'}
                      photoUrl={member.photoUrl}
                      joinedOn={formatDate(member.createdAt)}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={pageCount}
                  totalElements={totalCount}
                  pageSize={pageSize}
                  onPageChange={(page) => setCurrentPage(page)}
                  isLoading={loading}
                  activeBtnClass="bg-[#C8F04A] text-[#111827]"
                  simple={true}
                />
              </>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
