import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function TeacherAttendance() {
  const { lectureId } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function fetchAttendance() {
      try {
        setLoading(true);
        const response = await api.get(`/teacher/attendance/${lectureId}`);
        if (!ignore) {
          setRecords(Array.isArray(response.data) ? response.data : []);
          setErrorMessage('');
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.response?.data?.error || 'Unable to load lecture attendance.');
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
  }, [lectureId]);

  return (
    <div className="dashboard-page">
      <Navbar />
      <section className="dashboard-section">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">Attendance</p>
            <h2>Lecture Attendance #{lectureId}</h2>
            <p>Attendance marked automatically from recognized student faces.</p>
          </div>
        </div>

        {loading ? <div className="loading-spinner" aria-label="Loading" /> : null}
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        {records.length > 0 ? (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.studentName}</td>
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

export default TeacherAttendance;
