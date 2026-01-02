export default function QuizCard({ quiz }) {
  return (
    <div className="bg-white border border-orange rounded-lg p-4 shadow hover:shadow-lg transition">
      <h3 className="text-lg font-bold text-orange mb-2">{quiz.title}</h3>
      <p className="text-sm text-dark">{quiz.topic}</p>
      <button className="mt-4 bg-blue text-white px-4 py-2 rounded hover:bg-dark transition">
        Start Quiz
      </button>
    </div>
  );
}