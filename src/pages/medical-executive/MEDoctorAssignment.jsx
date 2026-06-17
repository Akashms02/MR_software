import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MRAssignmentSection from '../../components/MRAssignmentSection';

const MEDoctorAssignment = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/medical-executive/requests');
  };

  return (
    <div className="max-w-[950px] mx-auto pb-10 animate-[fadeSlideIn_0.35s_ease-out]">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6">
        <button
          onClick={handleCancel}
          className="bg-white border border-[#E5E7EB] rounded-xl p-2.5 cursor-pointer flex items-center justify-center text-[#374151] transition-colors duration-200 hover:bg-[#F9FAFB]"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-[11px] text-[#7C3AED] font-extrabold uppercase tracking-[1px]">
            ASSIGNMENT PORTAL
          </span>
          <h2 className="text-[24px] font-extrabold text-[#111827] mt-1 mb-0">
            Assign Targets to MR
          </h2>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] shadow-[0_10px_25px_rgba(0,0,0,0.02)] p-9">
        <MRAssignmentSection />
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MEDoctorAssignment;
