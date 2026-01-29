import { useEffect } from 'react';
// import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export function Modal({ open, onOpenChange, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-0 backdrop-blur-md transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-[101] w-full max-h-full flex items-center justify-center animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>,
    document.body
  );
}

export function ModalContent({ children, className = '' }) {
  return (
    <div className={`relative bg-white rounded-xl shadow-2xl overflow-hidden mx-auto ${className}`}>
      {children}
    </div>
  );
}

export function ModalHeader({ children, className = '' }) {
  return (
    <div className={`sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

export function ModalTitle({ children, className = '' }) {
  return (
    <h2 className={`text-xl font-semibold text-gray-800 ${className}`}>{children}</h2>
  );
}

export function ModalDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
  );
}

export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex justify-end gap-2 px-6 py-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}