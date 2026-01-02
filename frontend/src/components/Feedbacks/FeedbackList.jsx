import FeedbackCard from "./FeedbackCard";

export default function FeedbackList() {
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");

  if (feedbacks.length === 0) {
    return <p className="text-center text-gray-600">Nenhum feedback enviado ainda.</p>;
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((fb, index) => (
        <FeedbackCard key={index} feedback={fb} />
      ))}
    </div>
  );
}