import { useEffect, useState } from 'react';
import api from '../services/api';

function AlertsPanel({ lectureId, onUnauthorized }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(Boolean(lectureId));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!lectureId) {
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

        const response = await api.get(`/alerts/${lectureId}`);

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
          setErrorMessage(error.response?.data?.error || 'Unable to load lecture alerts.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchAlerts();
    const intervalId = window.setInterval(fetchAlerts, 5000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [lectureId, onUnauthorized]);

  return (
    <section className="dashboard-section">
      <div className="dashboard-section__header">
        <div>
          <h3>Alerts Panel</h3>
          <p>Recent attention warnings and missing-face events.</p>
        </div>
      </div>

      {!lectureId ? (
        <div className="empty-state">
          <h4>No active alerts</h4>
          <p>Alerts will appear once an ongoing lecture begins streaming detections.</p>
        </div>
      ) : null}

      {lectureId && loading ? <div className="loading-spinner" aria-label="Loading" /> : null}
      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {lectureId && !loading && !errorMessage && alerts.length === 0 ? (
        <div className="empty-state">
          <h4>No alerts right now</h4>
          <p>The class currently looks stable. New alerts will refresh automatically.</p>
        </div>
      ) : null}

      {alerts.length > 0 ? (
        <div className="alerts-list">
          {alerts.map((alert, index) => (
            <article className="alert-item" key={alert.id || `${alert.message}-${index}`}>
              <div>
                <h4>{alert.message || 'Student looking away'}</h4>
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

export default AlertsPanel;
