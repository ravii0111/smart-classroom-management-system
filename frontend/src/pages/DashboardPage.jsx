import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

function DashboardPage({ role }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/${role.toLowerCase()}/dashboard`);
        if (!ignore) {
          setDashboardData(response.data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.response?.data?.error || 'Unable to load dashboard data.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [role]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-shell">
      <header className="dashboard-card">
        <div>
          <p className="eyebrow">Role Based Access</p>
          <h1>{dashboardData?.title || `${role} Dashboard`}</h1>
          <p className="dashboard-subtext">
            Signed in as <strong>{user?.name}</strong> ({user?.email})
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <h2>Session</h2>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </article>

        <article className="dashboard-panel">
          <h2>Protected API Result</h2>
          {loading ? <p>Loading dashboard data...</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          {!loading && !error ? <p>{dashboardData?.message}</p> : null}
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
