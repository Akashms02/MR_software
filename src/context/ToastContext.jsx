import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

// Expose a global proxy helper for non-React files (like Axios interceptors or Redux actions)
let globalShowToast = null;
let globalDismissToast = null;

export const showToast = (msg, type = 'success', status = null) => {
  if (globalShowToast) {
    globalShowToast(msg, type, status);
  } else {
    console.warn("showToast called before ToastProvider was initialized");
  }
};

export const dismissToast = () => {
  if (globalDismissToast) {
    globalDismissToast();
  }
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const show = useCallback((msg, type = 'success', status = null) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    let displayMsg = msg;
    let resolvedStatus = status;

    // Smart parsing for Axios errors / response objects / native Errors
    if (msg && typeof msg === 'object') {
      if (msg.response) {
        displayMsg = msg.response.data?.message || msg.response.data?.msg || msg.message;
        resolvedStatus = msg.response.status || msg.response.data?.status;
      } else {
        displayMsg = msg.message || msg.msg || String(msg);
        resolvedStatus = msg.status || msg.statusCode || msg.response?.status;
      }
    }

    if (!resolvedStatus && typeof displayMsg === 'string') {
      const match = displayMsg.match(/\b(4\d\d|5\d\d)\b/);
      if (match) resolvedStatus = match[0];
    }

    if ((type === 'error' || type === 'red') && !resolvedStatus) {
      resolvedStatus = '400';
    }

    setToast({ msg: displayMsg, type, status: resolvedStatus });

    // Loading toasts persist until manually dismissed or replaced
    if (type !== 'loading') {
      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, 4500);
    }
  }, []);

  // Read initial logout message from localStorage synchronously on mount
  useEffect(() => {
    const directMsg = localStorage.getItem('logoutMsg');
    if (directMsg) {
      localStorage.removeItem('logoutMsg');
      localStorage.removeItem('logoutReason');
      show(directMsg, 'warning');
      return;
    }
    const storedReason = localStorage.getItem('logoutReason');
    if (storedReason) {
      try {
        const { reason } = JSON.parse(storedReason);
        localStorage.removeItem('logoutReason');
        let msg = 'You have been logged out.';
        if (reason === 'multi_device_logout') { 
          msg = 'Logged out — session started on another device.'; 
        } else if (reason === 'missing_refresh_token' || reason === 'refresh_rejected') { 
          msg = 'Session expired. Please log in again.'; 
        }
        show(msg, 'warning');
      } catch (e) { /* ignore */ }
    }
  }, [show]);

  // Update global proxy refs when callbacks change
  useEffect(() => {
    globalShowToast = show;
    globalDismissToast = dismiss;
    return () => {
      globalShowToast = null;
      globalDismissToast = null;
    };
  }, [show, dismiss]);

  const t = toast?.type?.toLowerCase();
  const isError   = t === 'error'   || t === 'red';
  const isSuccess = t === 'success' || t === 'emerald';
  const isLoading = t === 'loading';
  const isWarning = t === 'warning' || t === 'warn' || t === 'pending';

  // Solid Template Color Mapping
  const backgroundColor = (() => {
    if (isSuccess) return '#4CAF50'; // Bright template green
    if (isError) return '#ef4444'; // Solid Red
    if (isWarning) return '#ff9800'; // Solid Amber/Orange
    if (isLoading) return '#673ab7'; // Solid Indigo
    return '#2196f3'; // Solid Blue (Info / Default)
  })();

  return (
    <ToastContext.Provider value={{ showToast: show, dismissToast: dismiss }}>
      {children}

      {toast && (
        <div
          className="toast-card"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 99999,
            minWidth: '280px',
            maxWidth: '420px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: backgroundColor,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '14px 18px',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Message Area */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            {isLoading && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'toastSpin 900ms linear infinite', marginRight: '10px', flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0110 10" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              lineHeight: 1.4,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              wordBreak: 'break-word',
            }}>
              {toast.msg}
            </span>
          </div>

          {/* Close Button */}
          {!isLoading && (
            <button
              onClick={dismiss}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ffffff',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                opacity: 0.85,
                transition: 'opacity 0.15s, background 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.background = 'none'; }}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}

          {/* Style Blocks */}
          <style>{`
            @keyframes toastSlideIn {
              from { transform: translate3d(110%, 0, 0); opacity: 0; }
              to   { transform: translate3d(0, 0, 0);    opacity: 1; }
            }
            @keyframes toastSpin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            .toast-card {
              animation: toastSlideIn 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
