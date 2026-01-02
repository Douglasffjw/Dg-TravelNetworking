export default function ClientCard({ client }) {
  return (
    <div className="bg-white border border-dark rounded-lg p-4 shadow">
      <h3 className="text-lg font-bold text-dark">{client.name}</h3>
      <p className="text-sm">Level: {client.level}</p>
      <p className="text-sm text-orange">XP: {client.xp}</p>
    </div>
  );
}