import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import axios from '../api/axiosInstance';
import { API_ROUTE } from '../data/env';

export default function DailyQuote({ userRole, variant = "card" }) {
  const [quoteData, setQuoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_ROUTE}/quotes/today`);
      const data = res.data?.data || res.data;
      if (data && data.quote) {
        setQuoteData(data);
      } else {
        throw new Error("No quote content found");
      }
    } catch (err) {
      console.error("Error fetching daily quote:", err);
      setError("Unable to load daily quote today.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await axios.post(`${API_ROUTE}/quotes/refresh`);
      const res = await axios.get(`${API_ROUTE}/quotes/today`);
      const data = res.data?.data || res.data;
      if (data && data.quote) {
        setQuoteData(data);
      }
    } catch (err) {
      console.error("Error refreshing daily quote:", err);
      setError("Failed to refresh daily quote.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  const normalizedRole = (userRole || '').toUpperCase().trim();
  const canRefresh = normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'SUPERADMIN' || normalizedRole === 'SUPER ADMIN' || normalizedRole === 'ADMIN';

  if (loading) {
    if (variant === "welcome") {
      return (
        <div className="mt-4 border-t border-white/10 pt-3 flex items-center gap-2 text-white/50 text-xs animate-pulse">
          <RefreshCw size={12} className="animate-spin text-[#C8F04A]" />
          <span>Loading quote...</span>
        </div>
      );
    }
    return (
      <div className="bg-slate-900 border border-slate-800 text-white/50 rounded-2xl p-6 mb-6 flex items-center justify-center gap-3 animate-pulse h-28">
        <RefreshCw size={18} className="animate-spin text-[#C8F04A]" />
        <span>Loading daily quote...</span>
      </div>
    );
  }

  if (error && !quoteData) {
    if (variant === "welcome") {
      return (
        <div className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between text-white/60 text-xs gap-3">
          <span>{error}</span>
          <button 
            onClick={fetchQuote}
            className="bg-white/10 hover:bg-white/20 border border-white/10 px-2 py-0.5 rounded text-white text-[10px] font-bold cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return (
      <div className="bg-red-950/20 border border-red-900/30 text-red-400 rounded-2xl p-4 mb-6 text-sm flex items-center justify-between">
        <span>{error}</span>
        {canRefresh && (
          <button 
            onClick={fetchQuote}
            className="flex items-center gap-1 text-[12px] bg-red-900/35 hover:bg-red-900/50 px-3 py-1 rounded-lg text-white font-semibold transition-colors duration-200"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!quoteData) return null;

  if (variant === "welcome") {
    return (
      <div className="mt-4 border-t border-white/15 pt-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-4xl text-white">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <Quote size={13} className="text-[#C8F04A] shrink-0 mt-1 fill-[#C8F04A]/10" />
          <div className="min-w-0">
            <p className="text-[13px] md:text-[13.5px] leading-relaxed text-white/90 font-medium italic m-0">
              "{quoteData.quote}"
            </p>
            <span className="text-[11px] tracking-wider text-white/60 font-bold block mt-1">
              — {quoteData.author || "Unknown"}
            </span>
          </div>
        </div>
        {canRefresh && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 py-1.5 px-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-[11px] rounded-lg cursor-pointer transition-all duration-200 disabled:opacity-50 select-none shadow-sm shrink-0 ml-auto md:ml-2"
            title="Fetch new quote"
          >
            <RefreshCw size={11} className={refreshing ? "animate-spin text-[#C8F04A]" : "text-white/60"} />
            <span>{refreshing ? "Refreshed" : "Refresh"}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 mb-6 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8F04A]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="flex items-start gap-4 flex-1">
        <div className="p-3 bg-slate-800/80 rounded-xl shrink-0 text-[#C8F04A] border border-slate-700/50 flex items-center justify-center">
          <Quote size={20} className="fill-[#C8F04A]/10" />
        </div>
        <div className="flex-1">
          <p className="text-[15px] md:text-[16px] leading-relaxed text-gray-100 font-medium italic">
            "{quoteData.quote}"
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-[2px] w-4 bg-[#C8F04A]/70" />
            <span className="text-[12px] uppercase tracking-wider text-gray-400 font-semibold">
              {quoteData.author || "Unknown"}
            </span>
          </div>
        </div>
      </div>

      {canRefresh && (
        <div className="shrink-0 flex items-center self-end md:self-center">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 py-2 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-gray-300 font-bold text-[13px] rounded-xl cursor-pointer transition-all duration-200 disabled:opacity-50 select-none shadow-sm hover:text-white"
            title="Fetch new quote from API"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-[#C8F04A]" : "text-gray-400"} />
            <span>{refreshing ? "Refreshing..." : "Refresh Quote"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
