"use client";

export default function ErrorToast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed top-20 right-6 z-[60] animate-fade-in-up">
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-2xl max-w-md"
        style={{
          background: "rgba(186, 26, 26, 0.9)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 218, 214, 0.3)",
          boxShadow: "0 16px 48px rgba(186, 26, 26, 0.25)",
          color: "white",
        }}
      >
        <span className="material-symbols-outlined text-[20px]">warning</span>
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
