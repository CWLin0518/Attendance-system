import React, { useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAttendance();

  return (
    <div
      id="toast-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{
  toast: { id: string; type: 'success' | 'error' | 'info'; message: string; timestamp: number };
  onClose: () => void;
}> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgStyles = {
    success: 'bg-[#3D3C35] border-[#DDE5B6]/50 text-[#FAFAF8] shadow-[#2C2B26]/30',
    error: 'bg-[#3D3C35] border-[#F2CCB6]/60 text-[#FAFAF8] shadow-[#2C2B26]/30',
    info: 'bg-[#3D3C35] border-[#EBE9E0]/40 text-[#FAFAF8] shadow-[#2C2B26]/30',
  }[toast.type];

  const icon = {
    success: <CheckCircle2 className="w-5 h-5 text-[#DDE5B6] shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-[#F2CCB6] shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-[#EBE9E0] shrink-0 mt-0.5" />,
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-xl ${bgStyles}`}
      role="alert"
    >
      {icon}
      <div className="flex-1 text-sm font-semibold leading-relaxed">{toast.message}</div>
      <button
        type="button"
        onClick={onClose}
        className="text-[#A5A295] hover:text-[#FAFAF8] transition-colors p-1 rounded-full hover:bg-white/10 shrink-0 -mr-1 -mt-1 cursor-pointer"
        aria-label="關閉通知"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
