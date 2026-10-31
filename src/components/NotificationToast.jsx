import { CheckCircle2, X } from "lucide-react";

export default function NotificationToast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 text-xs sm:text-sm">
        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-2"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
