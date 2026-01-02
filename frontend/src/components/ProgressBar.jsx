export default function ProgressBar({ value, max }) {
  const percentage = Math.round((value / max) * 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className="bg-blue h-full transition-all"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}