import { useEffect, useState } from "react";
import FeedbackBar from "../components/Feedbacks/FeedbackBar";

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch("/data/quizzes.json")
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error("Erro ao carregar quiz:", err));
  }, []);

  const handleSelect = (index) => {
    if (!confirmed) setSelected(index);
  };

  const handleConfirm = () => {
    if (selected !== null) setConfirmed(true);
  };

  const handleNext = () => {
    setSelected(null);
    setConfirmed(false);
    setCurrent((prev) => prev + 1);
  };

  if (questions.length === 0)
    return <p className="text-center mt-10 text-[#394C97]">Carregando quiz...</p>;

  const q = questions[current];

  return (
    <div className="min-h-screen bg-[#FEF7EC] text-[#394C97] px-4 py-12 flex items-center justify-center relative">
      <div className="w-full max-w-screen-sm bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-center mb-6">Quiz Interativo</h2>

        <div className="mb-6">
          <p className="text-lg font-medium mb-4">
            {current + 1}. {q.question}
          </p>

          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none
                  ${
                    selected === i
                      ? "bg-[#FEF7EC] text-[#394C97] border-[#FE5900]"
                      : "bg-gray-200 hover:bg-gray-300"
                  }
                  ${confirmed ? "cursor-not-allowed opacity-90" : "cursor-pointer"}
                `}
                disabled={confirmed}
              >
                {opt}
              </button>
            ))}
          </div>

          {!confirmed ? (
            <button
              onClick={handleConfirm}
              disabled={selected === null}
              className="mt-6 w-full py-3 bg-[#FE5900] text-white font-semibold rounded-lg hover:bg-orange-600 transition"
            >
              Confirmar Resposta
            </button>
          ) : (
            <div className="mt-6">
              <p
                className={`text-base italic ${
                  selected === q.answer ? "text-green-600" : "text-red-600"
                }`}
              >
                {selected === q.answer ? "✅ Correto!" : "❌ Incorreto."} {q.explanation}
              </p>

              {current < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="mt-4 w-full py-3 bg-[#FE5900] text-white font-semibold rounded-lg hover:bg-[#394C97] transition"
                >
                  Próxima Pergunta
                </button>
              ) : (
                <p className="mt-4 text-center font-semibold text-[#394C97]">
                  🎉 Fim do quiz!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <FeedbackBar />
    </div>
  );
}