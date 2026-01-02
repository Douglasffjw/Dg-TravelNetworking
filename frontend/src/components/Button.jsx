export default function Button({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-orange text-white px-4 py-2 rounded hover:bg-blue transition"
    >
      {label}
    </button>
  );
}