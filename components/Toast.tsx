"use client";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const bgColor =
    type === "success"
      ? "bg-success"
      : type === "error"
        ? "bg-danger"
        : "bg-purple";

  return (
    <div
      className={`animate-slide-down ${bgColor} text-white px-4 py-3 rounded-xl flex items-center justify-between gap-3 shadow-lg`}
    >
      <span className="text-sm font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="text-white/70 hover:text-white text-lg leading-none"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
