import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function UploadNotes() {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('lectureId', lectureId);

    try {
      await api.post('/material/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage({ type: 'success', text: 'Notes uploaded successfully!' });
      setTimeout(() => {
        navigate('/lectures');
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to upload notes. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <section className="dashboard-section create-layout">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">Materials</p>
            <h2>Upload Notes</h2>
            <p>Attach notes or references for Lecture {lectureId}.</p>
          </div>
        </div>

        <div className="teacher-panel">
          <form className="auth-form" onSubmit={handleUpload}>
            <label htmlFor="fileUpload">
              Select Document
              <input
                id="fileUpload"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={handleFileChange}
                required
              />
            </label>

            {message.text && (
              <p className={message.type === 'error' ? 'form-error' : 'form-success'}>
                {message.text}
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button 
                type="submit" 
                className="primary-button" 
                style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1', flex: 1, color: '#fff' }} 
                disabled={loading || !file}
              >
                {loading ? 'Uploading...' : 'Upload Notes'}
              </button>
              <button type="button" className="secondary-button" onClick={() => navigate('/lectures')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default UploadNotes;
