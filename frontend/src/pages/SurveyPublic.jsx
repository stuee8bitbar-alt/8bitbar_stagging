import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";

const SurveyPublic = () => {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userDetails, setUserDetails] = useState({ name: "", email: "", phone: "" });
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await axios.get(`/surveys/${surveyId}`);
        setSurvey(res.data.survey);
        setAnswers(res.data.survey.questions.map(() => ""));
      } catch (err) {
        setError("Survey not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [surveyId]);

  const handleUserDetailChange = (field, value) => {
    setUserDetails({ ...userDetails, [field]: value });
  };

  const handleAnswerChange = (idx, value) => {
    const updated = [...answers];
    updated[idx] = value;
    setAnswers(updated);
  };

  const handleCheckboxChange = (idx, option) => {
    const current = answers[idx] || [];
    let updated;
    if (current.includes(option)) {
      updated = current.filter((o) => o !== option);
    } else {
      updated = [...current, option];
    }
    handleAnswerChange(idx, updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`/surveys/${survey._id}/submit`, {
        userDetails,
        answers: survey.questions.map((q, idx) => ({
          questionId: q._id || idx,
          answer: answers[idx],
        })),
      });
      setSuccess("Thank you for your feedback!");
    } catch (err) {
      setError("Failed to submit survey. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-12">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-12">{error}</div>;
  if (!survey) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl md:text-3xl font-bold text-slate-800 text-center">
          Thank you for completing this survey
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <style>{`
        .survey-public-form input,
        .survey-public-form select,
        .survey-public-form textarea {
          color: #111 !important;
          background: #fff !important;
        }
        .survey-public-form label,
        .survey-public-form label span {
          color: #111 !important;
        }
      `}</style>
      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white rounded-lg shadow p-8 survey-public-form">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">{survey.title}</h2>
        <p className="mb-8 text-gray-500">Please fill out the form below. Your feedback is valuable to us.</p>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4 text-lg font-semibold">{success}</div>}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Name</label>
            <input type="text" className="border rounded px-3 py-2 w-full" value={userDetails.name} onChange={e => handleUserDetailChange("name", e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email</label>
            <input type="email" className="border rounded px-3 py-2 w-full" value={userDetails.email} onChange={e => handleUserDetailChange("email", e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Phone</label>
            <input type="tel" className="border rounded px-3 py-2 w-full" value={userDetails.phone} onChange={e => handleUserDetailChange("phone", e.target.value)} />
          </div>
        </div>
        <div className="space-y-8">
          {survey.questions.map((q, idx) => (
            <div key={idx} className="">
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                {idx + 1}. {q.questionText}
              </label>
              {q.type === "text" && (
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full"
                  value={answers[idx] || ""}
                  onChange={e => handleAnswerChange(idx, e.target.value)}
                  required
                />
              )}
              {q.type === "radio" && (
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, oIdx) => (
                    <label key={oIdx} className="flex items-center bg-gray-50 rounded px-3 py-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`q${idx}`}
                        value={opt}
                        checked={answers[idx] === opt}
                        onChange={() => handleAnswerChange(idx, opt)}
                        className="mr-3"
                        required
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.type === "checkbox" && (
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, oIdx) => (
                    <label key={oIdx} className="flex items-center bg-gray-50 rounded px-3 py-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name={`q${idx}`}
                        value={opt}
                        checked={Array.isArray(answers[idx]) && answers[idx].includes(opt)}
                        onChange={() => handleCheckboxChange(idx, opt)}
                        className="mr-3"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="mt-10 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-lg transition"
          disabled={submitting || success}
        >
          {submitting ? "Submitting..." : success ? "Submitted" : "Send"}
        </button>
      </form>
    </div>
  );
};

export default SurveyPublic;
