import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getLectureStatus, formatDateTimeRange } from '../utils/lectureHelpers';

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/lectures', label: 'Lectures' },
  { to: '/admin/exams', label: 'Exams' },
];

function LectureManagement() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/lectures');
      setLectures(Array.isArray(response.data) ? response.data : []);
      setErrorMessage('');
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setErrorMessage(error.response?.data?.error || 'Unable to load lectures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const handleDeleteLecture = async (lectureId) => {
    try {
      await api.delete(`/admin/lecture/${lectureId}`);
      setInfoMessage('Lecture deleted successfully.');
      fetchLectures();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Unable to delete lecture.');
    }
  };

  return (
    <div className="dashboard-page admin-dashboard">
      <Navbar title="AI Admin Control" eyebrow="System Control" logoText="AD" links={adminLinks} />

      <section className="dashboard-section">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">Lecture Management</p>
            <h2>All lectures</h2>
            <p>Monitor every lecture across all teachers.</p>
          </div>
        </div>

        {infoMessage ? <p className="form-success">{infoMessage}</p> : null}
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        {loading ? <div className="loading-spinner" aria-label="Loading" /> : null}

        {!loading ? (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Teacher</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lectures.map((lecture) => (
                  <tr key={lecture.id}>
                    <td>{lecture.title}</td>
                    <td>{lecture.teacherName || 'Unknown teacher'}</td>
                    <td>{formatDateTimeRange(lecture.startTime, lecture.endTime)}</td>
                    <td>
                      <span className={`status-pill status-pill--${getLectureStatus(lecture.startTime, lecture.endTime).toLowerCase()}`}>
                        {getLectureStatus(lecture.startTime, lecture.endTime)}
                      </span>
                    </td>
                    <td className="table-actions">
                      <button type="button" className="success-button" onClick={() => navigate(`/report/${lecture.id}`)}>
                        View Report
                      </button>
                      <button type="button" className="secondary-button" onClick={() => navigate(`/admin/attendance/${lecture.id}`)}>
                        View Attendance
                      </button>
                      <button type="button" className="danger-button" onClick={() => handleDeleteLecture(lecture.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default LectureManagement;
