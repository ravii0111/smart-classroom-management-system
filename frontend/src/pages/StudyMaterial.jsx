import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import api from '../services/api';

function StudyMaterial() {
  const { lectureId } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const profileRes = await api.get('/student/profile').catch(() => ({ data: { class: '10', division: 'A' } }));
        const lecturesRes = await api.get('/lectures').catch(() => ({ data: [] }));
        
        const lecture = lecturesRes.data.find(l => String(l.id) === String(lectureId));
        
        if (lecture && (lecture.class !== profileRes.data.class || lecture.division !== profileRes.data.division)) {
          setError('You do not have permission to access material for this lecture.');
          setLoading(false);
          return;
        }

        const response = await api.get(`/material/${lectureId}`);
        if(response.data) {
          setMaterial(response.data);
        } else {
          throw new Error("No data");
        }
      } catch (err) {
        setError('Failed to fetch study material. It may not be uploaded yet.');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [lectureId]);

  const handleDownload = async () => {
    try {
      const response = await api.get(`/material/download/${lectureId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', material.fileName || 'Document.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to securely download file!");
    }
  };

  return (
    <div className="student-shell">
      <StudentNavbar />
      <main className="student-content auth-shell" style={{ padding: '0', minHeight: 'auto', marginTop: '24px' }}>
        <div className="dashboard-card" style={{ margin: '0 auto', display: 'block', textAlign: 'center' }}>
          <div className="auth-copy" style={{ marginBottom: '24px' }}>
            <p className="eyebrow">Resources</p>
            <h1>Study Material</h1>
            <p>Lecture ID: {lectureId}</p>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : error && !material ? (
            <p className="form-error">{error}</p>
          ) : (
            <div className="monitor-detection-card" style={{ padding: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <h3>{material.fileName || 'Document'}</h3>
              <button 
                onClick={handleDownload}
                className="primary-button teacher-link-button" 
                style={{ marginTop: '16px' }}
              >
                Download File
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudyMaterial;
