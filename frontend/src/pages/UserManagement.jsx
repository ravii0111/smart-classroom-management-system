import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/lectures', label: 'Lectures' },
  { to: '/admin/exams', label: 'Exams' },
];

const initialForm = { name: '', email: '', password: '', role: 'STUDENT' };

function UserManagement() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [modalMode, setModalMode] = useState('user');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
      setErrorMessage('');
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setErrorMessage(error.response?.data?.error || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (config, successText) => {
    try {
      await api({
        method: config.method,
        url: config.url,
      });
      setInfoMessage(successText);
      fetchUsers();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Action failed.');
    }
  };

  const handleModalChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const openModal = (mode) => {
    setModalMode(mode);
    setFormData({
      ...initialForm,
      role: mode === 'admin' ? 'ADMIN' : 'STUDENT',
    });
    setShowModal(true);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    try {
      const endpoint = modalMode === 'admin' ? '/admin/admin-user' : '/admin/user';
      await api.post(endpoint, formData);
      setInfoMessage(modalMode === 'admin' ? 'Admin created successfully.' : 'User created successfully.');
      setShowModal(false);
      setFormData(initialForm);
      fetchUsers();
    } catch (error) {
      const apiError = error.response?.data?.error;
      if (modalMode === 'admin') {
        setErrorMessage(
          apiError || 'Unable to create admin. Make sure you are logged in with the configured superadmin email.'
        );
      } else {
        setErrorMessage(apiError || 'Unable to create user.');
      }
      setShowModal(false);
    }
  };

  return (
    <div className="dashboard-page admin-dashboard">
      <Navbar title="AI Admin Control" eyebrow="System Control" logoText="AD" links={adminLinks} />

      <section className="dashboard-section">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">User Management</p>
            <h2>Manage users</h2>
            <p>Block, unblock, delete, or create platform users.</p>
          </div>
          <div className="table-actions">
            <button type="button" className="primary-button" onClick={() => openModal('user')}>
              Add User
            </button>
            <button type="button" className="secondary-button" onClick={() => openModal('admin')}>
              Add Admin
            </button>
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`status-pill ${String(user.status || 'ACTIVE').toLowerCase() === 'blocked' ? 'status-pill--danger' : 'status-pill--success'}`}>
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="table-actions">
                      {String(user.status || 'ACTIVE').toUpperCase() === 'BLOCKED' ? (
                        <button
                          type="button"
                          className="success-button"
                          onClick={() =>
                            handleAction(
                              { method: 'put', url: `/admin/unblock/${user.id}` },
                              'User unblocked successfully.'
                            )
                          }
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            handleAction(
                              { method: 'put', url: `/admin/block/${user.id}` },
                              'User blocked successfully.'
                            )
                          }
                        >
                          Block
                        </button>
                      )}
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          handleAction(
                            { method: 'delete', url: `/admin/user/${user.id}` },
                            'User deleted successfully.'
                          )
                        }
                      >
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

      {showModal ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="page-header-inline">
              <div>
                <h3>{modalMode === 'admin' ? 'Add Admin' : 'Add User'}</h3>
                <p>
                  {modalMode === 'admin'
                    ? 'Only the configured superadmin account can create new admin users.'
                    : 'Create a new student or teacher account.'}
                </p>
              </div>
              <button type="button" className="danger-button" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
            <form className="auth-form" onSubmit={handleCreateUser}>
              <label>
                Name
                <input name="name" value={formData.name} onChange={handleModalChange} required />
              </label>
              <label>
                Email
                <input type="email" name="email" value={formData.email} onChange={handleModalChange} required />
              </label>
              <label>
                Password
                <input type="password" name="password" value={formData.password} onChange={handleModalChange} required />
              </label>
              {modalMode === 'admin' ? (
                <label>
                  Role
                  <input value="ADMIN" readOnly disabled />
                </label>
              ) : (
                <label>
                  Role
                  <select name="role" value={formData.role} onChange={handleModalChange}>
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                </label>
              )}
              <button type="submit" className="primary-button">
                {modalMode === 'admin' ? 'Create Admin' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default UserManagement;
