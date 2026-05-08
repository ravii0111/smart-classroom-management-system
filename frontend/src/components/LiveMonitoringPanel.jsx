import { useEffect, useState } from 'react';
import api from '../services/api';

function LiveMonitoringPanel({ lectureId, onUnauthorized }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(Boolean(lectureId));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!lectureId) {
      setStudents([]);
      setLoading(false);
      return undefined;
    }

    let ignore = false;

    async function fetchLiveData() {
      try {
        if (!ignore) {
          setLoading(true);
        }

        const response = await api.get(`/monitor/live/${lectureId}`);

        if (!ignore) {
          setStudents(Array.isArray(response.data) ? response.data : []);
          setErrorMessage('');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          onUnauthorized?.();
          return;
        }

        if (!ignore) {
          setErrorMessage(
            error.response?.data?.error || 'Unable to load live monitoring data.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchLiveData();
    const intervalId = window.setInterval(fetchLiveData, 3000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [lectureId, onUnauthorized]);

  return (
    <section className="dashboard-section">
      <div className="dashboard-section__header">
        <div>
          <h3>Live Monitoring Grid</h3>
          <p>Latest student snapshots from the active lecture.</p>
        </div>
      </div>

      {!lectureId ? (
        <div className="empty-state">
          <h4>No ongoing lecture</h4>
          <p>Start monitoring an ongoing lecture to see live student cards here.</p>
        </div>
      ) : null}

      {lectureId && loading ? <div className="loading-spinner" aria-label="Loading" /> : null}
      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {lectureId && !loading && !errorMessage && students.length === 0 ? (
        <div className="empty-state">
          <h4>No live students yet</h4>
          <p>Student detections will appear here as snapshots stream in.</p>
        </div>
      ) : null}

      {students.length > 0 ? (
        <div className="live-student-grid">
          {students.map((student, index) => (
            <article
              className={`live-student-card live-student-card--${String(student.status || '').toLowerCase()}`}
              key={student.id || `${student.name}-${index}`}
            >
              <div className="live-student-card__image-wrap">
                {student.snapshotImage ? (
                  <img
                    src={student.snapshotImage}
                    alt={student.name || 'Student snapshot'}
                    className="live-student-card__image"
                  />
                ) : (
                  <div className="live-student-card__placeholder">No Snapshot</div>
                )}
              </div>
              <div className="live-student-card__body">
                <h4>{student.name || `Student ${index + 1}`}</h4>
                <p>{student.statusIcon || ''} {student.status || 'UNKNOWN'}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default LiveMonitoringPanel;
