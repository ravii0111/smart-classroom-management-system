import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/lectures', label: 'Lectures' },
  { to: '/admin/exams', label: 'Exams' },
];

function AdminHome() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalUsers: 0,
    totalLectures: 0,
    totalExams: 0,
    todayAttendance: 0,
    activeLectures: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function fetchStats() {
      try {
        setLoading(true);
        const response = await api.get('/admin/stats');

        if (!ignore) {
          setStats({
            totalStudents: response.data?.totalStudents || 0,
            totalTeachers: response.data?.totalTeachers || 0,
            totalUsers: response.data?.totalUsers || 0,
            totalLectures: response.data?.totalLectures || 0,
            totalExams: response.data?.totalExams || 0,
            todayAttendance: response.data?.todayAttendance || 0,
            activeLectures: response.data?.activeLectures || 0,
          });
          setErrorMessage('');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }

        if (!ignore) {
          setErrorMessage(error.response?.data?.error || 'Unable to load admin statistics.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      ignore = true;
    };
  }, [logout, navigate]);

  return (
    <div className="dashboard-page admin-dashboard">
      <Navbar title="AI Admin Control" eyebrow="System Control" logoText="AD" links={adminLinks} />

      <section className="hero-panel hero-panel--admin">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h2>System-wide control at a glance</h2>
          <p className="dashboard-subtext">
            Manage users, lectures, exams, and real-time monitoring from one production-style console.
          </p>
        </div>

        <div className="hero-panel__actions">
          <Link className="primary-button hero-button" to="/admin/users">
            Manage Users
          </Link>
          <Link className="success-button hero-button" to="/admin/exams">
            Monitor Exams
          </Link>
          <Link className="secondary-button hero-button" to="/admin/lectures">
            View Lectures
          </Link>
        </div>
      </section>

      {loading ? <div className="dashboard-section"><div className="loading-spinner" aria-label="Loading" /></div> : null}
      {errorMessage ? <div className="dashboard-section"><p className="form-error">{errorMessage}</p></div> : null}

      {!loading && !errorMessage ? (
        <section className="summary-grid">
          <article className="summary-card">
            <span>Total Users</span>
            <strong>{stats.totalUsers}</strong>
          </article>
          <article className="summary-card">
            <span>Active Lectures</span>
            <strong>{stats.activeLectures}</strong>
          </article>
          <article className="summary-card">
            <span>Today Attendance</span>
            <strong>{stats.todayAttendance}</strong>
          </article>
          <article className="summary-card">
            <span>Exams Count</span>
            <strong>{stats.totalExams}</strong>
          </article>
        </section>
      ) : null}

      {!loading && !errorMessage ? (
        <section className="dashboard-section">
          <div className="teacher-panel">
            <div className="page-header-inline">
              <div>
                <p className="eyebrow">Usage Snapshot</p>
                <h3>System activity bars</h3>
              </div>
            </div>

            <div className="analytics-bars">
              <div className="analytics-bars__row">
                <span>Students</span>
                <div className="behavior-bars__track">
                  <div className="behavior-bars__segment behavior-bars__segment--focused" style={{ width: `${Math.min(100, stats.totalStudents)}%` }} />
                </div>
                <strong>{stats.totalStudents}</strong>
              </div>
              <div className="analytics-bars__row">
                <span>Teachers</span>
                <div className="behavior-bars__track">
                  <div className="behavior-bars__segment behavior-bars__segment--distracted" style={{ width: `${Math.min(100, stats.totalTeachers * 5)}%` }} />
                </div>
                <strong>{stats.totalTeachers}</strong>
              </div>
              <div className="analytics-bars__row">
                <span>Lectures</span>
                <div className="behavior-bars__track">
                  <div className="behavior-bars__segment behavior-bars__segment--sleeping" style={{ width: `${Math.min(100, stats.totalLectures * 4)}%` }} />
                </div>
                <strong>{stats.totalLectures}</strong>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default AdminHome;
