import React from "react";
import Button from "../../components/ui/Button";

const Modal = ({ isVisible, onClose, onYes, onNo, title, desc, note }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg mx-4 md:mx-auto rounded-xl shadow-2xl p-6 relative z-30 border border-gray-200">
        <button
          className="absolute top-4 right-4 text-text-muted hover:text-secondary transition-colors"
          onClick={onClose}
        >
          &times;
        </button>
        {title && <h2 className="text-xl font-bold mb-4 text-secondary font-heading">{title}</h2>}
        <div className="mb-4 text-text-secondary">{desc}</div>
        {note && <div className="mb-6 text-sm text-text-muted bg-gray-50 p-3 rounded-lg">{note}</div>}
        <div className="flex justify-end space-x-3">
          <Button
            variant="danger"
            onClick={onNo}
          >
            No
          </Button>
          <Button
            variant="success"
            onClick={onYes}
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
