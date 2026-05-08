import { useEffect, useState } from 'react';
import api from '../services/api';

function ExamAlerts({ examId, onUnauthorized }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(Boolean(examId));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!examId) {
      setAlerts([]);
      setLoading(false);
      return undefined;
    }

    let ignore = false;

    async function fetchAlerts() {
      try {
        if (!ignore) {
          setLoading(true);
        }

        const response = await api.get(`/exam/alerts/${examId}`);

        if (!ignore) {
          setAlerts(Array.isArray(response.data) ? response.data : []);
          setErrorMessage('');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          onUnauthorized?.();
          return;
        }

        if (!ignore) {
          setErrorMessage(error.response?.data?.error || 'Unable to load exam alerts.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchAlerts();
    const intervalId = window.setInterval(fetchAlerts, 3000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [examId, onUnauthorized]);

  return (
    <section className="dashboard-section">
      <div className="dashboard-section__header">
        <div>
          <h3>Exam Alerts</h3>
          <p>Real-time cheating and posture warnings.</p>
        </div>
      </div>

      {loading ? <div className="loading-spinner" aria-label="Loading" /> : null}
      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {!loading && !errorMessage && alerts.length === 0 ? (
        <div className="empty-state">
          <h4>No alerts found</h4>
          <p>Alerts such as sideways movement or multiple faces will appear here.</p>
        </div>
      ) : null}

      {alerts.length > 0 ? (
        <div className="alerts-list">
          {alerts.map((alert, index) => (
            <article className="alert-item" key={alert.id || `${alert.message}-${index}`}>
              <div>
                <h4>{alert.message || 'Student looking sideways'}</h4>
                <p>{alert.studentName || 'Unknown student'}</p>
              </div>
              <span>{alert.time || alert.createdAt || 'Just now'}</span>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default ExamAlerts;
