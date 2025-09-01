import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";

const defaultQuestion = { questionText: "", type: "text", options: [""] };

const SurveyAdmin = () => {
  const [tab, setTab] = useState("list");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ ...defaultQuestion }]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [surveys, setSurveys] = useState([]);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedSurveyId, setSelectedSurveyId] = useState("");
  const [responses, setResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Fetch surveys for the list tab
  useEffect(() => {
    if (tab === "list") {
      setLoading(true);
      axios.get("/surveys")
        .then(res => setSurveys(res.data.surveys))
        .catch(() => setSurveys([]))
        .finally(() => setLoading(false));
    }
  }, [tab, success]);

  // Fetch responses when a survey is selected in Results tab
  useEffect(() => {
    if (tab === "results" && selectedSurveyId) {
      setLoadingResponses(true);
      axios.get(`/surveys/${selectedSurveyId}/responses`)
        .then(res => setResponses(res.data.responses))
        .catch(() => setResponses([]))
        .finally(() => setLoadingResponses(false));
    }
  }, [tab, selectedSurveyId]);

  // Handlers for questions
  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    if (field === "type" && value === "text") updated[idx].options = [""];
    setQuestions(updated);
  };
  const handleOptionChange = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };
  const addQuestion = () => setQuestions([
    ...questions,
    { questionText: "", type: "text", options: [""] } // always new array
  ]);
  const removeQuestion = (idx) => setQuestions(questions.length > 1 ? questions.filter((_, i) => i !== idx) : questions);
  const addOption = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].options.push("");
    setQuestions(updated);
  };
  const removeOption = (qIdx, oIdx) => {
    const updated = [...questions];
    if (updated[qIdx].options.length > 1) updated[qIdx].options.splice(oIdx, 1);
    setQuestions(updated);
  };

  const handleCopyLink = (link) => {
    const url = `${window.location.origin}/survey/${link}`;
    navigator.clipboard.writeText(url);
    setCopiedId(link);
    setTimeout(() => setCopiedId(null), 1200);
  };

  // Submit survey
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post("/surveys", {
        title,
        questions: questions.map(q => ({
          questionText: q.questionText,
          type: q.type,
          options: q.type === "text" ? [] : q.options.filter(opt => opt.trim() !== "")
        }))
      });
      setSuccess("Survey created successfully!");
      setTitle("");
      setQuestions([{ ...defaultQuestion }]);
      setTab("list");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create survey");
    } finally {
      setLoading(false);
    }
  };

  // Delete survey
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this survey?")) return;
    setLoading(true);
    setError("");
    try {
      await axios.delete(`/surveys/${id}`);
      setSuccess("Survey deleted successfully!");
    } catch (err) {
      setError("Failed to delete survey");
    } finally {
      setLoading(false);
    }
  };

  // Edit survey (load into form)
  const handleEdit = (survey) => {
    setEditingSurvey(survey._id);
    setTitle(survey.title);
    setQuestions(survey.questions.map(q => ({
      questionText: q.questionText,
      type: q.type,
      options: q.type === "text" ? [""] : (q.options && q.options.length ? [...q.options] : [""])
    })));
    setTab("create");
  };

  // Update survey
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.put(`/surveys/${editingSurvey}`, {
        title,
        questions: questions.map(q => ({
          questionText: q.questionText,
          type: q.type,
          options: q.type === "text" ? [] : q.options.filter(opt => opt.trim() !== "")
        }))
      });
      setSuccess("Survey updated successfully!");
      setTitle("");
      setQuestions([{ ...defaultQuestion }]);
      setEditingSurvey(null);
      setTab("list");
    } catch (err) {
      setError("Failed to update survey");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .survey-admin-form input,
        .survey-admin-form select,
        .survey-admin-form textarea {
          color: #111 !important;
          background: #fff !important;
        }
      `}</style>
      <div className="bg-white rounded-lg shadow p-6 survey-admin-form">
        <h2 className="text-2xl font-bold mb-4" style={{color:'#111'}}>Survey Management</h2>
        <div className="flex space-x-4 mb-6">
          <button className={`px-4 py-2 rounded ${tab === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => { setTab("list"); setEditingSurvey(null); }}>List</button>
          <button className={`px-4 py-2 rounded ${tab === "create" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => { setTab("create"); setEditingSurvey(null); }}>Create</button>
          <button className={`px-4 py-2 rounded ${tab === "results" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTab("results")}>Results</button>
        </div>
        {tab === "list" && (
          <div>
            {loading ? <div>Loading...</div> : (
              <ul>
                {surveys.length === 0 && <li>No surveys found.</li>}
                {surveys.map(s => (
                  <li key={s._id} className="mb-2 p-2 border rounded flex items-center justify-between" style={{color:'#111'}}>
                    <span><b>{s.title}</b> <span className="text-xs text-gray-500">({s.link})</span></span>
                    <span className="flex items-center gap-2">
                      <button className="mr-2" style={{color:'#111', textDecoration:'underline'}} onClick={() => handleEdit(s)}>Edit</button>
                      <button style={{color:'#111', textDecoration:'underline'}} onClick={() => handleDelete(s._id)}>Delete</button>
                      <button style={{color:'#111', border:'1px solid #bbb', borderRadius:4, padding:'2px 8px', marginLeft:8, background:'#f9f9f9', fontSize:'0.95em'}} onClick={() => handleCopyLink(s.link)} type="button">
                        {copiedId === s.link ? 'Copied!' : 'Copy Link'}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {tab === "create" && (
          <form onSubmit={editingSurvey ? handleUpdate : handleSubmit} className="space-y-4">
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}
            <div>
              <label className="block font-semibold mb-1" style={{color:'#111'}}>Survey Title</label>
              <input type="text" className="border rounded px-3 py-2 w-full" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block font-semibold mb-1" style={{color:'#111'}}>Questions</label>
              {questions.map((q, idx) => (
                <div key={idx} className="border rounded p-3 mb-3 bg-gray-50">
                  <div className="flex items-center mb-2">
                    <input type="text" className="border rounded px-2 py-1 flex-1" placeholder={`Question #${idx + 1}`} value={q.questionText} onChange={e => handleQuestionChange(idx, "questionText", e.target.value)} required />
                    <select className="ml-2 border rounded px-2 py-1" value={q.type} onChange={e => handleQuestionChange(idx, "type", e.target.value)}>
                      <option value="text">Text</option>
                      <option value="radio">Radio</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                    <button type="button" className="ml-2 text-red-500" onClick={() => removeQuestion(idx)} title="Remove question">&times;</button>
                  </div>
                  {(q.type === "radio" || q.type === "checkbox") && (
                    <div className="ml-4">
                      <label className="block text-sm mb-1" style={{color:'#111'}}>Options</label>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center mb-1">
                          <input type="text" className="border rounded px-2 py-1 flex-1" placeholder={`Option #${oIdx + 1}`} value={opt} onChange={e => handleOptionChange(idx, oIdx, e.target.value)} required />
                          <button type="button" className="ml-2 text-red-500" onClick={() => removeOption(idx, oIdx)} title="Remove option">&times;</button>
                        </div>
                      ))}
                      <button type="button" className="mt-1 text-blue-600 text-sm" onClick={() => addOption(idx)}>+ Add Option</button>
                    </div>
                  )}
                </div>
              ))}
              <button type="button" className="text-blue-600" onClick={addQuestion}>+ Add Question</button>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded" disabled={loading}>{loading ? (editingSurvey ? "Updating..." : "Creating...") : (editingSurvey ? "Update Survey" : "Create Survey")}</button>
            {editingSurvey && <button type="button" className="ml-4 text-gray-600 underline" onClick={() => { setEditingSurvey(null); setTitle(""); setQuestions([{ ...defaultQuestion }]); }}>Cancel Edit</button>}
          </form>
        )}
        {tab === "results" && (
          <div style={{color:'#111'}}>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Select Survey</label>
              <select
                className="border rounded px-3 py-2"
                value={selectedSurveyId}
                onChange={e => setSelectedSurveyId(e.target.value)}
              >
                <option value="">-- Select --</option>
                {surveys.map(s => (
                  <option key={s._id} value={s._id}>{s.title}</option>
                ))}
              </select>
            </div>
            {loadingResponses && <div>Loading responses...</div>}
            {!loadingResponses && selectedSurveyId && responses.length === 0 && <div>No responses found.</div>}
            {!loadingResponses && responses.length > 0 && (
              <div className="space-y-6 mt-4">
                {responses.map((r, i) => {
                  const surveyObj = surveys.find(s => s._id === selectedSurveyId);
                  return (
                    <div key={r._id || i} className="border rounded-lg p-4 bg-gray-50">
                      <div className="mb-2 text-sm text-gray-600">
                        <b>Name:</b> {r.userDetails?.name || '-'} &nbsp; <b>Email:</b> {r.userDetails?.email || '-'} &nbsp; <b>Phone:</b> {r.userDetails?.phone || '-'}
                        {r.submittedAt && (<span> &nbsp; <b>Submitted:</b> {new Date(r.submittedAt).toLocaleString()}</span>)}
                      </div>
                      <div className="space-y-2">
                        {surveyObj?.questions.map((q, idx) => {
                          const ans = r.answers?.find(a => (a.questionId === (q._id || idx) || a.questionId === idx));
                          return (
                            <div key={idx}>
                              <div className="font-semibold">Q{idx+1}: {q.questionText}</div>
                              <div className="ml-2">A: {Array.isArray(ans?.answer) ? ans.answer.join(", ") : (ans?.answer || <span className="text-gray-400">No answer</span>)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SurveyAdmin;
