import { useRef } from "react";

function Modal({ isOpen, onCloseRequested, headerLabel, children }) {
  if (!isOpen) return null;

  const modalRef = useRef();

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onCloseRequested();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-sky-500/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div ref={modalRef} className="bg-white p-4 rounded-lg shadow-lg w-80">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">{headerLabel}</h2>
          <button
            onClick={onCloseRequested}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
