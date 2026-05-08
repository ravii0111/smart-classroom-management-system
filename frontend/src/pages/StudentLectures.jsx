import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import api from '../services/api';

function StudentLectures() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const profileRes = await api.get('/student/profile');
        setStudentProfile(profileRes.data);

        if (!profileRes.data?.class || !profileRes.data?.division) {
          setLectures([]);
          return;
        }

        const response = await api.get('/lectures');
        
        const filteredLectures = (Array.isArray(response.data) ? response.data : []).filter(lecture => 
          lecture.class === profileRes.data.class && 
          lecture.division === profileRes.data.division
        );
        
        setLectures(filteredLectures);
      } catch (err) {
        setError('Failed to fetch lectures');
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []);

  const getLectureStatus = (lecture) => {
    const now = new Date();
    const start = new Date(lecture.startTime);
    const end = new Date(lecture.endTime);
    if (now < start) return 'UPCOMING';
    if (now >= start && now <= end) return 'ONGOING';
    if (now > end) return 'COMPLETED';
    return 'UPCOMING';
  };

  const getStatusBadge = (lecture) => {
    const status = getLectureStatus(lecture);
    switch (status) {
      case 'UPCOMING': return <span className="lecture-badge badge-upcoming" style={{backgroundColor: '#e8f1ff', color: '#185adb'}}>Upcoming</span>;
      case 'ONGOING': return <span className="lecture-badge badge-ongoing" style={{backgroundColor: '#e9f9ef', color: '#0f8a3b'}}>Ongoing</span>;
      case 'COMPLETED': return <span className="lecture-badge badge-completed" style={{backgroundColor: '#ffeaea', color: '#c83333'}}>Completed</span>;
      default: return <span className="lecture-badge badge-upcoming">Upcoming</span>;
    }
  };

  return (
    <div className="student-shell">
      <StudentNavbar />
      <main className="student-content auth-shell" style={{ padding: '0', minHeight: 'auto', marginTop: '24px' }}>
        <div className="dashboard-card" style={{ margin: '0 auto', display: 'block' }}>
          <div className="auth-copy" style={{ marginBottom: '24px' }}>
            <p className="eyebrow">Academics</p>
            <h1>My Lectures</h1>
          </div>

          {loading ? (
            <p>Loading lectures...</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : !studentProfile?.class || !studentProfile?.division ? (
            <p>Please update your profile with class and division first to view your lectures.</p>
          ) : lectures.length === 0 ? (
            <p>No lectures found for your class.</p>
          ) : (
            <div className="lecture-list">
              {lectures.map((lecture) => (
                <div key={lecture.id} className="lecture-item">
                  <div className="lecture-item-header">
                    <h2>{lecture.title || lecture.name || `Lecture ${lecture.id}`}</h2>
                    {getStatusBadge(lecture)}
                  </div>
                  <p><strong>Time:</strong> {new Date(lecture.startTime).toLocaleString()} - {new Date(lecture.endTime).toLocaleString()}</p>
                  
                  <div className="lecture-actions">
                    {getLectureStatus(lecture) === 'COMPLETED' && (
                      <Link to={`/student/report/${lecture.id}`} className="primary-button teacher-link-button">
                        View Report
                      </Link>
                    )}
                    <Link to={`/chat/${lecture.id}`} className="primary-button teacher-link-button">
                      Ask Doubt
                    </Link>
                    <Link to={`/student/material/${lecture.id}`} className="secondary-button teacher-link-button">
                      View Material
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentLectures;
