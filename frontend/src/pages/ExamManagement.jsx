import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDateTimeRange, getLectureStatus } from '../utils/lectureHelpers';

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/lectures', label: 'Lectures' },
  { to: '/admin/exams', label: 'Exams' },
];

const initialExam = {
  title: '',
  startTime: '',
  endTime: '',
  examType: 'MCQ',
};

function ExamManagement() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [examForm, setExamForm] = useState(initialExam);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/exams');
      setExams(Array.isArray(response.data) ? response.data : []);
      setErrorMessage('');
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setErrorMessage(error.response?.data?.error || 'Unable to load exams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setExamForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateExam = async (event) => {
    event.preventDefault();

    try {
      await api.post('/admin/exam', examForm);
      setInfoMessage('Exam created successfully.');
      setExamForm(initialExam);
      fetchExams();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Unable to create exam.');
    }
  };

  return (
    <div className="dashboard-page admin-dashboard">
      <Navbar title="AI Admin Control" eyebrow="System Control" logoText="AD" links={adminLinks} />

      <section className="dashboard-section">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">Exam Management</p>
            <h2>Create and monitor exams</h2>
            <p>Configure MCQ and THEORY exam sessions from the admin console.</p>
          </div>
        </div>

        {infoMessage ? <p className="form-success">{infoMessage}</p> : null}
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <div className="admin-grid">
          <div className="teacher-panel">
            <form className="auth-form" onSubmit={handleCreateExam}>
              <label>
                Title
                <input name="title" value={examForm.title} onChange={handleChange} required />
              </label>
              <label>
                Start Time
                <input type="datetime-local" name="startTime" value={examForm.startTime} onChange={handleChange} required />
              </label>
              <label>
                End Time
                <input type="datetime-local" name="endTime" value={examForm.endTime} onChange={handleChange} required />
              </label>
              <label>
                Exam Type
                <select name="examType" value={examForm.examType} onChange={handleChange}>
                  <option value="MCQ">MCQ</option>
                  <option value="THEORY">THEORY</option>
                </select>
              </label>
              <button type="submit" className="primary-button">Create Exam</button>
            </form>
          </div>

          <div className="teacher-panel">
            {loading ? <div className="loading-spinner" aria-label="Loading" /> : null}
            {!loading ? (
              <div className="admin-list">
                {exams.map((exam) => (
                  <article className="admin-list-item" key={exam.id}>
                    <div>
                      <h4>{exam.title}</h4>
                      <p>{exam.examType} • {formatDateTimeRange(exam.startTime, exam.endTime)}</p>
                      <span className={`lecture-badge badge-${String(exam.status || getLectureStatus(exam.startTime, exam.endTime)).toLowerCase()}`}>
                        {exam.status || getLectureStatus(exam.startTime, exam.endTime)}
                      </span>
                    </div>
                    <div className="table-actions">
                      <button type="button" className="success-button" onClick={() => navigate(`/admin/exam/${exam.id}`)}>
                        Open Monitor
                      </button>
                      {String(exam.status || '').toUpperCase() === 'COMPLETED' ? (
                        <button type="button" className="secondary-button" onClick={() => navigate(`/exam-report/${exam.id}`)}>
                          View Report
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ExamManagement;
