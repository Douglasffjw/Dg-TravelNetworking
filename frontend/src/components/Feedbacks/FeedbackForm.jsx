import { useState } from "react";

export default function FeedbackForm() {
  const [form, setForm] = useState({ name: "", message: "" });
  const [feedbacks, setFeedbacks] = useState(
    JSON.parse(localStorage.getItem("feedbacks") || "[]")
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newFeedback = { ...form, date: new Date().toISOString() };
    const updated = [...feedbacks, newFeedback];
    localStorage.setItem("feedbacks", JSON.stringify(updated));
    setFeedbacks(updated);
    setForm({ name: "", message: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-12">
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Seu nome"
        className="w-full px-4 py-2 border rounded-lg"
        required
      />
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder="Escreva seu feedback..."
        className="w-full px-4 py-2 border rounded-lg h-24 resize-none"
        required
      />
      <button
        type="submit"
        className="w-full py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
      >
        Enviar Feedback
      </button>
    </form>
  );
}