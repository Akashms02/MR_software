import React from 'react';
import { Trash2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const cn = (...inputs) => twMerge(clsx(inputs));

const DeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Confirmation", 
  message, 
  itemName,
  loading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 px-4">
      <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-rose-50/50">
            <Trash2 className="w-7 h-7 text-rose-500" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-2">{title}</h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-6">
            {message || (
              <>
                Are you sure you want to remove <span className="text-slate-900">"{itemName}"</span>? 
                This action cannot be undone.
              </>
            )}
          </p>

          <div className="flex flex-col w-full gap-2">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full py-3.5 bg-rose-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Confirm Delete'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all border border-slate-200 rounded-2xl hover:bg-slate-50 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
