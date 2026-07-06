import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

export default function Notification({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed top-20 inset-x-0 mx-auto z-[9999] w-fit"
          style={{ maxWidth: '90vw' }}
        >
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{
              background: 'var(--app-bg)',
              border: '1px solid #C9A962',
              boxShadow: '0 8px 32px rgba(201,169,98,0.35), 0 2px 8px rgba(0,0,0,0.6)',
            }}
          >
            <div className="w-6 h-6 rounded-full bg-[#C9A962] flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-[#0A0A0A]" strokeWidth={3} />
            </div>
            <span className="text-[color:var(--app-text)] font-medium text-sm whitespace-nowrap">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
