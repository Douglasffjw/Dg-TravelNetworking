import Navbar from "../components/Navbar";
import FeedbackForm from "../components/Feedbacks/FeedbackForm";
import FeedbackList from "../components/Feedbacks/FeedbackList";

export default function Feedbacks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF7EC] to-[#394C97] text-[#262626]">
      <Navbar />
      <section className="pt-[160px] px-6 pb-12 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#394C97] mb-10">
          Envie seu Feedback
        </h1>
        <FeedbackForm />
        <FeedbackList />
      </section>
    </div>
  );
}