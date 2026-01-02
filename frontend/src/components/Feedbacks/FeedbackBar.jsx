import { useState } from "react";
import { saveFeedback } from "./feedbackUtils";

export default function FeedbackBar() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveFeedback({ ...form, date: new Date().toISOString() });
    setForm({ name: "", message: "" });
    setOpen(false);
  };

  const handleSatisfactionClick = (level) => {
    const current = `Nível de satisfação: ${level}`;
    setForm({
      ...form,
      message: form.message === current ? "" : current,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <form
          onSubmit={handleSubmit}
          className="feedback-form bg-white shadow-xl rounded-2xl p-5 space-y-4 border border-gray-200"
        >
          <h3 className="text-base sm:text-lg font-semibold text-[#394C97]">
            Feedback
          </h3>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Seu nome"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#394C97] text-sm"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nível de satisfação
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleSatisfactionClick(level)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border text-xs sm:text-sm font-semibold transition duration-200 ease-in-out ${
                    form.message === `Nível de satisfação: ${level}`
                      ? "bg-[#394C97] text-white border-[#394C97] scale-105"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {form.message && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center gap-1">
              ✍️{" "}
              <span>
                Escreva o porquê da sua avaliação. Sua opinião ajuda muito!
              </span>
            </p>
          )}

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Comentário..."
            className="w-full px-3 py-2 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#394C97] text-sm"
            required
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2">
            <button
              type="submit"
              className="bg-[#FE5900] text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition w-full sm:w-auto text-sm"
            >
              Enviar
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-gray-500 hover:underline w-full sm:w-auto text-center"
            >
              Fechar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#394C97] text-white px-5 py-2 rounded-full shadow-lg hover:bg-[#2f3c7e] transition text-sm"
        >
          💬 Feedback
        </button>
      )}
    </div>
  );
}
