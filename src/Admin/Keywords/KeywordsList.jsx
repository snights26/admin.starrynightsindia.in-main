import "./KeywordsList.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";

function KeywordsList() {
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState([]);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const loadKeywords = async () => {
      try {
        const data = await api.get("/keywords");
        setKeywords(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load keywords", error);
        setKeywords([]);
      }
    };

    loadKeywords();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/keywords/${id}`);
      setKeywords((prev) => prev.filter((k) => k.id !== id));
      setPopup({ message: "Keyword removed", type: "error" });
      setTimeout(() => setPopup(null), 2000);
    } catch (error) {
      console.error("Failed to remove keyword", error);
    }
  };

  return (
    <div className="keywords-page">
      <div className="keywords-header">
        <div className="keywords-title">Keywords Management</div>

        <div className="keywords-actions">
          <button className="keywords-btn keywords-add" onClick={() => navigate("/admin/keywords/add")}>
            + Add Keyword
          </button>
          <button className="keywords-btn keywords-back" onClick={() => navigate("/dashboard")}>
            Back
          </button>
        </div>
      </div>

      <div className="keywords-table-wrapper">
        <table className="keywords-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Keywords</th>
              <th>Response</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {keywords.map((k) => (
              <tr key={k.id}>
                <td>{k.id}</td>
                <td>{k.type}</td>
                <td className="keywords-chip-cell">{k.keywords}</td>
                <td className="keywords-response">{k.response}</td>
                <td>
                  <div className="keywords-action-btns">
                    <button className="keywords-btn keywords-edit" onClick={() => navigate(`/admin/keywords/edit/${k.id}`)}>
                      Edit
                    </button>
                    <button className="keywords-btn keywords-delete" onClick={() => handleDelete(k.id)}>
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {popup && <div className={`keywords-popup ${popup.type}`}>{popup.message}</div>}
    </div>
  );
}

export default KeywordsList;
