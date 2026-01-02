export default function FeedbackCard({ feedback }) {
  const date = new Date(feedback.date).toLocaleDateString("pt-BR");

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-[#262626]/10">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-[#394C97]">{feedback.name}</h3>
        <span className="text-sm text-gray-500">{date}</span>
      </div>
      <p className="text-gray-700">{feedback.message}</p>
    </div>
  );
}