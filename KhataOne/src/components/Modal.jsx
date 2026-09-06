export default function Modal({ title, close, children }) {
  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"
      onMouseDown={close}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[#ebe7e3] bg-white p-5 shadow-2xl dark:border-[#423238] dark:bg-[#2b2226]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold">{title}</h2>
          <button
            className="text-2xl text-[#8b8383]"
            onClick={close}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
