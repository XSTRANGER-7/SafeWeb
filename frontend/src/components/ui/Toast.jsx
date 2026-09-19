import React, { useEffect, useState } from "react";

const CONFIGS = {
  success: {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    border: "border-l-4 border-emerald-500",
    progressBar: "bg-emerald-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    border: "border-l-4 border-red-500",
    progressBar: "bg-red-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  info: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    border: "border-l-4 border-blue-500",
    progressBar: "bg-blue-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

/**
 * Toast — a single animated toast card.
 * Slides in from right with a timed progress bar and auto-dismisses.
 */
function Toast({ toast, onClose }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const duration = toast.duration ?? 5000;

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 20);
    const leaveTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onClose(toast.id), 400);
    }, duration);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id]);

  function dismiss() {
    setLeaving(true);
    setTimeout(() => onClose(toast.id), 400);
  }

  const cfg = CONFIGS[toast.type] ?? CONFIGS.info;

  return (
    <div
      style={{
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(110%) scale(0.95)",
        opacity: visible && !leaving ? 1 : 0,
      }}
      className={`relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 ${cfg.border}`}
    >
      {/* Shrinking progress bar */}
      <div
        className={`absolute top-0 left-0 h-0.5 ${cfg.progressBar} origin-left`}
        style={{ animation: `toastProgress ${duration}ms linear forwards` }}
      />

      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full ${cfg.iconBg} ${cfg.iconColor}`}>
          {cfg.icon}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          {toast.title && (
            <p className="text-sm font-bold text-gray-900 leading-tight">{toast.title}</p>
          )}
          {toast.message && (
            <p className="text-sm text-gray-600 mt-0.5 leading-snug">{toast.message}</p>
          )}
        </div>

        <button
          onClick={dismiss}
          className="flex-shrink-0 ml-1 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes toastProgress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

/**
 * ToastContainer — fixed top-right overlay that stacks all active toasts.
 * Place once at the root of your page/app.
 */
export function ToastContainer({ toasts, onClose }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
      style={{ width: "min(22rem, calc(100vw - 2rem))" }}
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
