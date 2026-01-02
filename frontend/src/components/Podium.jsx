export default function Podium({ top3 }) {
  return (
    <div className="flex justify-center items-end gap-4 mt-6">
      {top3.map((user, index) => (
        <div
          key={user.id}
          className={`bg-white text-dark p-4 rounded shadow text-center ${
            index === 1 ? 'h-32' : index === 0 ? 'h-40 bg-orange' : 'h-28'
          }`}
        >
          <h4 className="font-bold">{user.name}</h4>
          <p className="text-sm">XP: {user.xp}</p>
        </div>
      ))}
    </div>
  );
}