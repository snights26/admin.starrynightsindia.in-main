import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/api";
import "./ChatbotAnalytics.css";

function ChatbotAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/chatbot/analytics")
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  const escalationRate = analytics?.escalationRate
    ? `${Math.round(analytics.escalationRate * 100)}%`
    : "0%";

  return (
    <div className="chat-analytics-page">
      <div className="chat-analytics-header">
        <div>
          <h1>Chat Analytics</h1>
          <p>Monitor chatbot usage, unanswered volume, and intent patterns.</p>
        </div>
        <button type="button" onClick={() => navigate("/dashboard")}>Back</button>
      </div>

      {loading ? (
        <div className="chat-analytics-empty">Loading analytics...</div>
      ) : !analytics ? (
        <div className="chat-analytics-empty">Analytics could not be loaded.</div>
      ) : (
        <>
          <div className="chat-analytics-stats">
            <div>
              <span>Total Queries</span>
              <strong>{analytics.totalQueries || 0}</strong>
            </div>
            <div>
              <span>Escalations</span>
              <strong>{analytics.escalationCount || 0}</strong>
            </div>
            <div>
              <span>Escalation Rate</span>
              <strong>{escalationRate}</strong>
            </div>
          </div>

          <div className="chat-analytics-grid">
            <section>
              <h2>Intent Breakdown</h2>
              {(analytics.intentBreakdown || []).length === 0 ? (
                <p className="chat-analytics-muted">No intent data yet.</p>
              ) : (
                <div className="chat-analytics-list">
                  {analytics.intentBreakdown.map((item) => (
                    <div key={item.intent}>
                      <span>{item.intent}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2>Top Questions</h2>
              {(analytics.topQuestions || []).length === 0 ? (
                <p className="chat-analytics-muted">No repeated questions yet.</p>
              ) : (
                <div className="chat-analytics-list questions">
                  {analytics.topQuestions.map((item) => (
                    <div key={item.question}>
                      <span>{item.question}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatbotAnalytics;
