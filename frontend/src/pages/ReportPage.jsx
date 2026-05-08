import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getReportPercentages } from '../utils/lectureHelpers';

function ReportPage({ reportType = 'lecture' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const endpoint = useMemo(
    () => (reportType === 'exam' ? `/exam/report/${id}` : `/report/${id}`),
    [id, reportType]
  );

  useEffect(() => {
    let ignore = false;

    async function fetchReport() {
      try {
        setLoading(true);
        const response = await api.get(endpoint);

        if (!ignore) {
          setReport(response.data);
          setErrorMessage('');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }

        if (!ignore) {
          setErrorMessage(
            error.response?.data?.error || 'Unable to load report. Please try again.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchReport();

    return () => {
      ignore = true;
    };
  }, [endpoint, id, logout, navigate]);

  return (
    <div className="dashboard-page">
      <Navbar />

      <section className="dashboard-section">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">Analytics Report</p>
            <h2>{reportType === 'exam' ? `Exam Report #${id}` : `Lecture Report #${id}`}</h2>
            <p>Behavior summary generated from stored monitoring snapshots and timeline data.</p>
          </div>
        </div>

        <div className="teacher-panel">
        {loading ? <p>Loading report...</p> : null}
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        {!loading && !errorMessage && report ? (
          <>
            <div className="report-grid">
              <div className="report-card">
                <h2>Focus %</h2>
                <p className="report-highlight">{report.focusPercentage}%</p>
              </div>
              <div className="report-card">
                <h2>Final Status</h2>
                <p className="report-highlight">{report.finalStatus}</p>
              </div>
              <div className="report-card">
                <h2>Total Images</h2>
                <p className="report-highlight">{report.totalImages || 0}</p>
              </div>
            </div>

            <div className="report-stats">
              <div className="report-card">
                <h3>Focused</h3>
                <p>{report.focusedCount}</p>
              </div>
              <div className="report-card">
                <h3>Distracted</h3>
                <p>{report.distractedCount}</p>
              </div>
              <div className="report-card">
                <h3>Sleeping</h3>
                <p>{report.sleepingCount}</p>
              </div>
              {reportType === 'exam' ? (
                <div className="report-card">
                  <h3>Cheating</h3>
                  <p>{report.cheatingCount || 0}</p>
                </div>
              ) : null}
            </div>

            <div className="report-insights-grid">
              <div className="report-card">
                <h3>AI Summary</h3>
                <p>{report.summary || 'Students were mostly attentive with a few distraction moments.'}</p>
              </div>
              <div className="report-card">
                <h3>Suggestions</h3>
                <p>{report.suggestions || 'Add short interaction breaks whenever distracted behavior starts increasing.'}</p>
              </div>
            </div>

            <div className="behavior-bars report-bars">
              <div className="behavior-bars__track">
                <div
                  className="behavior-bars__segment behavior-bars__segment--focused"
                  style={{ width: `${report.focusPercentage}%` }}
                />
                <div
                  className="behavior-bars__segment behavior-bars__segment--distracted"
                  style={{ width: `${getReportPercentages(report).distractedPercentage}%` }}
                />
                <div
                  className="behavior-bars__segment behavior-bars__segment--sleeping"
                  style={{ width: `${getReportPercentages(report).sleepingPercentage}%` }}
                />
              </div>
            </div>

            <div className="report-insights-grid">
              <div className="report-card">
                <h3>Student Ranking</h3>
                <ul className="ranking-list">
                  <li>
                    <span>Top focused student</span>
                    <strong>{report.topFocusedStudent?.name || report.topFocusedStudent || 'N/A'}</strong>
                  </li>
                  <li>
                    <span>Least focused student</span>
                    <strong>{report.leastFocusedStudent?.name || report.leastFocusedStudent || 'N/A'}</strong>
                  </li>
                </ul>
              </div>
              <div className="report-card">
                <h3>Timeline</h3>
                {report.timeline?.length ? (
                  <div className="timeline-list">
                    {report.timeline.map((item, index) => (
                      <div className="timeline-item" key={`${item.time}-${index}`}>
                        <span>{item.time}</span>
                        <strong>{item.behavior}</strong>
                      </div>
                    ))}
                  </div>
                ) : <p>No timeline data yet.</p>}
              </div>
            </div>

            <div className="report-images">
              <h2>Captured Images</h2>
              {report.images?.length ? (
                <div className="report-image-grid">
                  {report.images.map((imageUrl, index) => (
                    <img
                      key={`${id}-report-image-${index}`}
                      src={imageUrl}
                      alt={`Lecture snapshot ${index + 1}`}
                      className={`report-image ${
                        report.suspiciousImages?.includes?.(imageUrl) ? 'report-image--suspicious' : ''
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <p>No saved snapshots yet.</p>
              )}
            </div>
          </>
        ) : null}
        </div>
      </section>
    </div>
  );
}

export default ReportPage;
