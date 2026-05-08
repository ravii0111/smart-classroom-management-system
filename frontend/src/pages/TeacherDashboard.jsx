import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="teacher-shell">
      <div className="teacher-header">
        <div>
          <p className="eyebrow">Teacher Portal</p>
          <h1>Teacher Dashboard</h1>
          <p className="dashboard-subtext">
            Welcome {user?.name || user?.email}. Manage lectures from here.
          </p>
        </div>

        <button type="button" className="secondary-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="teacher-grid">
        <Link className="teacher-card" to="/create-lecture">
          <h2>Create Lecture</h2>
          <p>Create a new lecture with title, start time, and end time.</p>
        </Link>

        <Link className="teacher-card" to="/lectures">
          <h2>View Lectures</h2>
          <p>See all saved lectures in a simple list view.</p>
        </Link>
      </div>
    </div>
  );
}

export default TeacherDashboard;
