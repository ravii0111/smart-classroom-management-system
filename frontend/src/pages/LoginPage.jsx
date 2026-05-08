import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getDashboardPathByRole } from '../utils/auth';

function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={getDashboardPathByRole(user.role)} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      login(response.data);
      navigate(getDashboardPathByRole(response.data.role), { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell auth-shell--split">
      <div className="auth-showcase">
        <div className="auth-showcase__badge">AI Classroom Monitor</div>
        <h1>Smart classroom access with one secure sign in.</h1>
        <p>
          Step into a cleaner dashboard experience for lectures, attendance, monitoring,
          reports, and role-based control.
        </p>
        <div className="auth-showcase__grid">
          <div className="auth-showcase__item">
            <strong>Live Monitoring</strong>
            <span>Camera and AI-assisted classroom tracking</span>
          </div>
          <div className="auth-showcase__item">
            <strong>Attendance</strong>
            <span>Face-based attendance and lecture records</span>
          </div>
          <div className="auth-showcase__item">
            <strong>Reports</strong>
            <span>Focus trends, snapshots, and behavior summaries</span>
          </div>
        </div>
      </div>

      <div className="auth-card auth-card--elevated">
        <div className="auth-copy">
          <p className="eyebrow">Welcome Back</p>
          <h1>Sign in to your account</h1>
          <p>Use your email and password to open the correct workspace.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alex@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="primary-button primary-button--wide" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
