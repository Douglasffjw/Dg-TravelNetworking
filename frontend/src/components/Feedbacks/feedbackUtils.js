export function saveFeedback(feedback) {
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  const updated = [...feedbacks, feedback];
  localStorage.setItem("feedbacks", JSON.stringify(updated));
}