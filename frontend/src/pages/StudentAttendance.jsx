import { useEffect, useState } from 'react';
import StudentNavbar from '../components/StudentNavbar';
import api from '../services/api';

function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function fetchAttendance() {
      try {
        setLoading(true);
        const response = await api.get('/student/attendance');
        if (!ignore) {
          setRecords(Array.isArray(response.data) ? response.data : []);
          setErrorMessage('');
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.response?.data?.error || 'Unable to load attendance.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchAttendance();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="dashboard-page">
      <StudentNavbar />

      <section className="dashboard-section">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">Attendance</p>
            <h2>My Attendance</h2>
            <p>Review lecture-wise attendance captured by the monitoring system.</p>
          </div>
        </div>

        {loading ? <div className="loading-spinner" aria-label="Loading" /> : null}
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        {!loading && !errorMessage && records.length === 0 ? (
          <div className="empty-state">
            <h4>No attendance yet</h4>
            <p>Your attendance records will appear here once you are recognized in class.</p>
          </div>
        ) : null}

        {records.length > 0 ? (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lecture</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.lectureTitle}</td>
                    <td>{record.date}</td>
                    <td>
                      <span className={`status-pill ${record.status === 'PRESENT' ? 'status-pill--success' : 'status-pill--danger'}`}>
                        {record.status}
                      </span>
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

export default StudentAttendance;
