import { useState } from "react";

/**
 * useToast — lightweight hook to manage toast state.
 *
 * Usage:
 *   const { toasts, showToast, removeToast } = useToast();
 *   showToast({ type: 'success', title: 'Done!', message: 'Your form was submitted.' });
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  function showToast({ type = "info", title = "", message = "", duration = 5000 }) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, showToast, removeToast };
}
