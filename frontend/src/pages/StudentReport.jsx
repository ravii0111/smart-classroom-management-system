import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import api from '../services/api';

function StudentReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get(`/student/report/${id}`);
        setReport(response.data);
      } catch (err) {
        setError('Report not available yet.');
        // Mock data for UI demonstration
        setReport({
          focusPercentage: 85,
          behaviorStats: { attentive: 40, distracted: 10, sleeping: 0 },
          finalStatus: 'PRESENT',
          images: [
            'https://via.placeholder.com/180x120?text=Scan+1',
            'https://via.placeholder.com/180x120?text=Scan+2'
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  return (
    <div className="student-shell">
      <StudentNavbar />
      <main className="student-content auth-shell" style={{ padding: '0', minHeight: 'auto', marginTop: '24px' }}>
        <div className="dashboard-card" style={{ margin: '0 auto', display: 'block' }}>
          <div className="auth-copy" style={{ marginBottom: '24px' }}>
            <p className="eyebrow">Analytics</p>
            <h1>My Report</h1>
            <p>Lecture ID: {id}</p>
          </div>

          {loading ? (
            <p>Loading report...</p>
          ) : error && !report ? (
            <p className="form-error">{error}</p>
          ) : (
            <div>
              <div className="report-stats">
                <div className="report-card">
                  <p className="eyebrow">Focus</p>
                  <div className="report-highlight">{report.focusPercentage}%</div>
                </div>
                <div className="report-card">
                  <p className="eyebrow">Final Status</p>
                  <div className={`report-highlight ${report.finalStatus === 'PRESENT' ? 'form-success' : 'form-error'}`} style={{ padding: '0', background: 'transparent' }}>
                    {report.finalStatus}
                  </div>
                </div>
              </div>

              <div className="dashboard-panel" style={{ marginBottom: '24px' }}>
                <h2>Behavior Stats</h2>
                {(() => {
                  const att = report.behaviorStats?.attentive || 0;
                  const dist = report.behaviorStats?.distracted || 0;
                  const sleep = report.behaviorStats?.sleeping || 0;
                  const total = att + dist + sleep || 1; // avoid div by 0
                  const distPct = Math.round((dist / total) * 100);
                  const sleepPct = Math.round((sleep / total) * 100);
                  return (
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem' }}>
                      <li style={{ marginBottom: '8px' }}><strong>Distracted:</strong> <span style={{ color: '#d96c06' }}>{distPct}%</span> ({dist} mins)</li>
                      <li style={{ marginBottom: '8px' }}><strong>Sleeping:</strong> <span style={{ color: '#c83333' }}>{sleepPct}%</span> ({sleep} mins)</li>
                    </ul>
                  );
                })()}
              </div>

              <div className="report-images">
                <h2>Snapshots</h2>
                <div className="report-image-grid">
                  {report.images?.map((img, idx) => (
                    <img key={idx} src={img} alt={`Snapshot ${idx + 1}`} className="report-image" />
                  ))}
                  {(!report.images || report.images.length === 0) && (
                    <p>No snapshots recorded.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentReport;
