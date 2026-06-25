import "./UnansweredQuestions.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";

function UnansweredQuestions() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await api.get("/unanswered");
        setQuestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load unanswered questions", error);
        setQuestions([]);
      }
    };

    loadQuestions();
  }, []);

  const handleChange = (id, value) => {
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, response: value } : q));
  };

  const handleSubmit = async (id) => {
    const item = questions.find((q) => q.id === id);
    if (!item?.response?.trim()) {
      setPopup({ message: "Response cannot be empty", type: "error" });
      setTimeout(() => setPopup(null), 2000);
      return;
    }

    try {
      await api.post(`/unanswered/${id}/answer`, { response: item.response });
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setPopup({ message: "Response saved", type: "success" });
      setTimeout(() => setPopup(null), 2000);
    } catch (error) {
      console.error("Failed to save answer", error);
    }
  };

  const handleRemove = async (id) => {
    try {
      await api.delete(`/unanswered/${id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setPopup({ message: "Question removed", type: "error" });
      setTimeout(() => setPopup(null), 2000);
    } catch (error) {
      console.error("Failed to remove question", error);
    }
  };

  return (
    <div className="unanswered-page">
      <div className="unanswered-header">
        <div className="unanswered-title">Unanswered Questions</div>
        <button className="unanswered-back-btn" onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </div>

      <div className="unanswered-table-wrapper">
        <table className="unanswered-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Question</th>
              <th>Response</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td className="qid">{q.id}</td>
                <td className="question-text">{q.question}</td>
                <td>
                  <textarea
                    className="unanswered-input"
                    placeholder="Write a smart response..."
                    value={q.response || ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                </td>
                <td>
                  <div className="unanswered-actions">
                    <button className="unanswered-submit" onClick={() => handleSubmit(q.id)}>Save</button>
                    <button className="unanswered-remove" onClick={() => handleRemove(q.id)}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {popup && <div className={`unanswered-popup ${popup.type}`}>{popup.message}</div>}
    </div>
  );
}

export default UnansweredQuestions;
