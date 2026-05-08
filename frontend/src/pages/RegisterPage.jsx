import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getDashboardPathByRole, roles } from '../utils/auth';

function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [message, setMessage] = useState('');
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
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      setMessage(response.data.message || 'Registration successful.');
      setTimeout(() => navigate('/login', { replace: true }), 900);
    } catch (requestError) {
      const apiError = requestError.response?.data;
      setError(apiError?.error || apiError?.email || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell auth-shell--split">
      <div className="auth-showcase auth-showcase--warm">
        <div className="auth-showcase__badge">Platform Access</div>
        <h1>Create a polished workspace for teachers and students.</h1>
        <p>
          Register the right role, complete the profile, and step into lecture management,
          attendance, and AI classroom workflows.
        </p>
        <div className="auth-showcase__stack">
          <div className="auth-stat">
            <strong>Teacher</strong>
            <span>Create lectures, monitor classes, and review analytics</span>
          </div>
          <div className="auth-stat">
            <strong>Student</strong>
            <span>Access class-based lectures, attendance, and materials</span>
          </div>
        </div>
      </div>

      <div className="auth-card auth-card--elevated">
        <div className="auth-copy">
          <p className="eyebrow">Create Account</p>
          <h1>Register a new user</h1>
          <p>Create a student or teacher account, then sign in with the generated credentials.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Alex Johnson"
              required
            />
          </label>

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
              placeholder="Minimum 6 characters"
              required
            />
          </label>

          <label>
            Role
            <select name="role" value={formData.role} onChange={handleChange}>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          {message ? <p className="form-success">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="primary-button primary-button--wide" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
