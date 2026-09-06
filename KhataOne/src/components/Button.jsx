export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`rounded-lg bg-[#8f2039] px-3.5 py-2.5 text-xs font-bold text-white shadow-[0_4px_10px_rgba(143,32,57,0.18)] transition hover:bg-[#741f2b] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
