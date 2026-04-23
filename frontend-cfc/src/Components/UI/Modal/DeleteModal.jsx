import React, { useEffect, useState, useRef } from "react";
import { FaTrash, FaExclamationTriangle, FaTimes } from "react-icons/fa";

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message, itemName }) => {
  const [isAnimate, setIsAnimate] = useState(false);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimate(true), 10);
      // Focus the close button when modal opens
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else {
      setIsAnimate(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-300 ${isAnimate ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimate ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div 
        ref={modalRef}
        className={`relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 transform ${
          isAnimate ? 'translate-y-0 scale-100 rotate-0' : 'translate-y-20 scale-90 rotate-2'
        }`}
      >
        <div className="absolute top-6 right-6">
          <button 
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group"
          >
            <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="p-10 flex flex-col items-center text-center">
          {/* Animated Icon */}
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-8 relative" aria-hidden="true">
            <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-20" />
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center relative z-10">
                <FaTrash className="text-3xl text-rose-500 animate-bounce" />
            </div>
          </div>

          <h3 id="delete-modal-title" className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            {title || "Confirm Deletion"}
          </h3>
          
          <p id="delete-modal-description" className="text-slate-500 font-medium leading-relaxed mb-8">
            {message || `Are you sure you want to delete this ${itemName || 'item'}? This action cannot be undone.`}
          </p>

          <div className="flex gap-4 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-4 px-6 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 active:scale-95"
            >
              Confirm Delete
            </button>
          </div>
        </div>

        {/* Bottom Safety Bar */}
        <div className="h-2 bg-rose-500 w-full" />
      </div>
    </div>
  );
};

export default DeleteModal;
