export default function Toast({ message }) {
  return (
    message && (
      <div className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-lg bg-[#2b2528] px-4 py-3 text-sm text-white shadow-xl">
        <span>✓</span>
        {message}
      </div>
    )
  );
}
