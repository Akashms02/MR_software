import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { API_ROUTE } from '../data/env';
import { Search, Loader2, CheckCircle2, User, UserCheck, AlertCircle, RefreshCw, Layers } from 'lucide-react';

const MRAssignmentSection = () => {
  const [mrs, setMrs] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedMrId, setSelectedMrId] = useState('');
  
  // Loaders
  const [loadingMrs, setLoadingMrs] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  
  // Searches & Filters
  const [mrSearch, setMrSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, DOCTOR, CHEMIST
  const [assignFilter, setAssignFilter] = useState('ALL'); // ALL, UNASSIGNED, ASSIGNED_TO_SELECTED, ASSIGNED_TO_OTHERS
  
  // Feedback Messages
  const [toast, setToast] = useState(null);

  const fetchMrs = async () => {
    setLoadingMrs(true);
    try {
      const res = await axios.get(`${API_ROUTE}/mr`);
      if (res.data && (res.data.success || res.data.status === true) && Array.isArray(res.data.data)) {
        setMrs(res.data.data);
        if (res.data.data.length > 0 && !selectedMrId) {
          setSelectedMrId(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching MRs:', err);
      showToast(err.message || 'Failed to fetch Medical Representatives.', 'error');
    } finally {
      setLoadingMrs(false);
    }
  };

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await axios.get(`${API_ROUTE}/doctor/unified-contacts`);
      if (res.data && (res.data.success || res.data.status === true) && res.data.data) {
        const dataObj = res.data.data;
        const doctorsList = Array.isArray(dataObj.doctors) 
          ? dataObj.doctors.map(d => ({ 
              ...d, 
              type: 'DOCTOR',
              clinicName: d.clinicName || d.address || ''
            })) 
          : [];
        const chemistsList = Array.isArray(dataObj.chemists) 
          ? dataObj.chemists.map(c => ({ 
              ...c, 
              fullName: c.name || c.fullName || 'Unknown Chemist',
              speciality: 'CHEMIST',
              type: 'CHEMIST',
              clinicName: c.address || ''
            })) 
          : [];
        setDoctors([...doctorsList, ...chemistsList]);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      showToast(err.message || 'Failed to fetch doctors and chemists.', 'error');
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    fetchMrs();
    fetchDoctors();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAssign = async (doctorId, mrId) => {
    setSubmittingId(doctorId);
    try {
      const res = await axios.put(`${API_ROUTE}/doctor/${doctorId}/assign/${mrId}`);
      if (res.data && (res.data.success || res.data.status === true)) {
        showToast(res.data.message || 'Assignment updated successfully.', 'success');
        // Refresh doctor list to get updated assignment status
        await fetchDoctors();
      } else {
        showToast(res.data.message || 'Assignment failed.', 'error');
      }
    } catch (err) {
      console.error('Error during assignment:', err);
      showToast(err.response?.data?.message || err.message || 'Error updating assignment.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleUnassign = async (doctorId) => {
    setSubmittingId(doctorId);
    try {
      const res = await axios.put(`${API_ROUTE}/doctor/${doctorId}/assign/none`);
      if (res.data && (res.data.success || res.data.status === true)) {
        showToast(res.data.message || 'Unassigned successfully.', 'success');
        await fetchDoctors();
      } else {
        showToast(res.data.message || 'Unassignment failed.', 'error');
      }
    } catch (err) {
      console.error('Error during unassignment:', err);
      showToast(err.response?.data?.message || err.message || 'Error updating assignment.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  // Filter lists
  const filteredMrs = mrs.filter((m) =>
    m.fullName?.toLowerCase().includes(mrSearch.toLowerCase()) ||
    m.email?.toLowerCase().includes(mrSearch.toLowerCase())
  );

  const selectedMrName = mrs.find(m => String(m.id) === String(selectedMrId))?.fullName || 'Selected MR';

  const filteredDoctors = doctors.filter((doc) => {
    // 1. Search Query
    const matchesSearch =
      doc.fullName?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.clinicName?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.speciality?.toLowerCase().includes(doctorSearch.toLowerCase());

    // 2. Type Filter
    const isChemistType = doc.type === 'CHEMIST' || doc.speciality === 'CHEMIST';
    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'DOCTOR' && !isChemistType) ||
      (typeFilter === 'CHEMIST' && isChemistType);

    // 3. Assignment Status Filter
    let matchesAssign = true;
    if (assignFilter === 'UNASSIGNED') {
      matchesAssign = !doc.assignedMrId;
    } else if (assignFilter === 'ASSIGNED_TO_SELECTED') {
      matchesAssign = String(doc.assignedMrId) === String(selectedMrId);
    } else if (assignFilter === 'ASSIGNED_TO_OTHERS') {
      matchesAssign = doc.assignedMrId && String(doc.assignedMrId) !== String(selectedMrId);
    }

    return matchesSearch && matchesType && matchesAssign;
  });

  return (
    <div className="flex flex-col gap-6 w-full text-slate-800">
      {toast && (
        <div 
          className={`fixed bottom-7 right-7 z-[9999] text-white rounded-2xl px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center gap-2.5 max-w-[380px] animate-bounce ${
            toast.type === 'error' ? 'bg-[#7F1D1D]' : 'bg-[#064E3B]'
          }`}
        >
          <span className="text-[20px]">{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span className="text-[13px] font-semibold flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="bg-white/15 border-none text-white rounded-lg px-2 py-0.5 cursor-pointer">✕</button>
        </div>
      )}

      {/* Main Splitscreen Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: MR Selection Sidebar (4 cols) */}
        <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-[20px] p-5 flex flex-col gap-4 max-h-[600px]">
          <div>
            <h4 className="text-[14px] font-extrabold text-[#111827] m-0">Medical Representatives</h4>
            <p className="text-[11px] text-gray-500 m-0 mt-0.5">Select an MR to manage assignments</p>
          </div>

          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search MRs..."
              value={mrSearch}
              onChange={(e) => setMrSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-[12.5px] rounded-xl border border-slate-200 bg-white outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
            {loadingMrs ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <Loader2 size={20} className="animate-spin text-[#7C3AED]" />
                <span className="text-xs font-semibold">Loading MR list...</span>
              </div>
            ) : filteredMrs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-[12px] font-semibold">
                No Medical Representatives found.
              </div>
            ) : (
              filteredMrs.map((m) => {
                const isSelected = String(m.id) === String(selectedMrId);
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMrId(m.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#7C3AED]/10 to-[#7C3AED]/5 border-[#7C3AED] shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#7C3AED] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <User size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-bold text-slate-800 truncate">{m.fullName}</div>
                      <div className="text-[10.5px] text-slate-400 truncate mt-0.5">{m.email}</div>
                    </div>
                    {isSelected && <span className="text-[#7C3AED] text-[14px]">●</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Doctor/Chemist Targets Assignment Panel (8 cols) */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-[20px] p-6 flex flex-col gap-5 max-h-[600px]">
          {/* Header */}
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div>
              <h4 className="text-[15px] font-extrabold text-[#111827] m-0">
                Onboarded Targets & Assignments
              </h4>
              <p className="text-[12px] text-gray-500 m-0 mt-0.5">
                Assign doctor & pharmacy targets to <strong className="text-[#7C3AED]">{selectedMrName}</strong>
              </p>
            </div>
            
            <button
              onClick={fetchDoctors}
              className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw size={12} className={loadingDoctors ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex items-center flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search doctors, chemists, clinic..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-[12.5px] rounded-xl border border-slate-200 bg-[#FAFAFA] outline-none focus:border-[#7C3AED] focus:bg-white transition-colors"
              />
            </div>

            {/* Target Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-[12.5px] rounded-xl border border-slate-200 bg-[#FAFAFA] outline-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="DOCTOR">Doctors Only</option>
              <option value="CHEMIST">Chemists Only</option>
            </select>
          </div>

          {/* Doctors List */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 custom-scrollbar">
            {loadingDoctors ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                <Loader2 size={24} className="animate-spin text-[#7C3AED]" />
                <span className="text-sm font-semibold">Loading targets list...</span>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-16 text-slate-450 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                <Layers className="mx-auto text-slate-300 mb-2" size={24} />
                <span className="text-xs font-semibold block text-slate-500">No matching doctors or chemists found.</span>
                <span className="text-[10px] text-slate-400 block mt-1">Try refining your search query or filters.</span>
              </div>
            ) : (
              filteredDoctors.map((doc) => {
                const isChemist = doc.type === 'CHEMIST' || doc.speciality === 'CHEMIST';
                const isAssignedToSelected = String(doc.assignedMrId) === String(selectedMrId);
                const isAssignedToOther = doc.assignedMrId && !isAssignedToSelected;
                
                return (
                  <div
                    key={`${doc.type}-${doc.id}`}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex justify-between items-center gap-4 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.015)] transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-bold text-slate-800">{doc.fullName || doc.name}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                          isChemist ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isChemist ? 'Chemist' : doc.speciality || 'General'}
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-slate-450 truncate mt-1">
                        🏢 {doc.clinicName || 'Clinic/Pharmacy Address Not Specified'}
                      </div>

                      {/* Assignment State Badge */}
                      <div className="mt-2 flex items-center gap-1.5">
                        {isAssignedToSelected ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.75 rounded-md border border-emerald-100">
                            <UserCheck size={11} />
                            Assigned to {selectedMrName}
                          </span>
                        ) : isAssignedToOther ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.75 rounded-md border border-amber-100">
                            <UserCheck size={11} />
                            Assigned to {doc.assignedMrName || `MR #${doc.assignedMrId}`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.75 rounded-md border border-slate-150">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="shrink-0">
                      {isAssignedToSelected ? (
                        <button
                          type="button"
                          disabled={submittingId === doc.id || !selectedMrId}
                          onClick={() => handleUnassign(doc.id)}
                          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-extrabold text-[11px] px-3.5 py-1.75 rounded-lg cursor-pointer transition-all disabled:opacity-50"
                        >
                          {submittingId === doc.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            'Unassign'
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={submittingId === doc.id || !selectedMrId}
                          onClick={() => handleAssign(doc.id, selectedMrId)}
                          className="bg-[#7C3AED] hover:bg-[#6D28D9] border-0 text-white font-extrabold text-[11px] px-4 py-2 rounded-lg cursor-pointer transition-all shadow-[0_2px_6px_rgba(124,58,237,0.2)] disabled:opacity-50"
                        >
                          {submittingId === doc.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : isAssignedToOther ? (
                            'Reassign'
                          ) : (
                            'Assign'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default MRAssignmentSection;
