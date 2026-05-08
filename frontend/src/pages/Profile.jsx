import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const teacherLinks = [
  { to: '/teacher', label: 'Home' },
  { to: '/create-lecture', label: 'Create Lecture' },
  { to: '/lectures', label: 'Lectures' },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/lectures', label: 'Lectures' },
  { to: '/admin/exams', label: 'Exams' },
];

const studentLinks = [
  { to: '/student', label: 'Dashboard' },
  { to: '/student/lectures', label: 'Lectures' },
  { to: '/student/attendance', label: 'Attendance' },
];

function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    class: '',
    division: '',
    profileImage: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const navConfig = useMemo(() => {
    if (user?.role === 'ADMIN') {
      return { title: 'Admin Profile', eyebrow: 'System Control', logoText: 'AD', links: adminLinks };
    }
    if (user?.role === 'STUDENT') {
      return { title: 'Student Profile', eyebrow: 'AI Monitor', logoText: 'ST', links: studentLinks };
    }
    return { title: 'Teacher Profile', eyebrow: 'Lecture Control', logoText: 'TC', links: teacherLinks };
  }, [user?.role]);

  useEffect(() => {
    let ignore = false;

    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await api.get('/profile/me');
        if (ignore) {
          return;
        }

        setProfile({
          name: response.data?.name || '',
          email: response.data?.email || '',
          role: response.data?.role || '',
          class: response.data?.class || '',
          division: response.data?.division || '',
          profileImage: response.data?.profileImage || '',
        });
        setPreview(response.data?.profileImage || '');
      } catch (error) {
        if (!ignore) {
          setMessage({ type: 'error', text: error.response?.data?.error || 'Unable to load profile.' });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchProfile();
    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('email', profile.email);
    if (profile.role === 'STUDENT') {
      formData.append('class', profile.class || '');
      formData.append('division', profile.division || '');
    }
    if (file) {
      formData.append('profileImage', file);
    }

    try {
      const response = await api.put('/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile({
        name: response.data?.name || '',
        email: response.data?.email || '',
        role: response.data?.role || '',
        class: response.data?.class || '',
        division: response.data?.division || '',
        profileImage: response.data?.profileImage || '',
      });
      setPreview(response.data?.profileImage || preview);
      updateUser({
        name: response.data?.name || profile.name,
        email: response.data?.email || profile.email,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setEditing(false);
      setFile(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Unable to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar {...navConfig} />

      <section className="dashboard-section">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">Profile</p>
            <h2>Account details</h2>
            <p>Manage your personal details and profile image from one place.</p>
          </div>
          {!editing ? (
            <button type="button" className="primary-button" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          ) : null}
        </div>

        <div className="teacher-panel profile-panel">
          {loading ? <div className="loading-spinner" aria-label="Loading" /> : null}
          {message.text ? <p className={message.type === 'error' ? 'form-error' : 'form-success'}>{message.text}</p> : null}

          {!loading && (
            <div className="profile-layout">
              <div className="profile-preview-card">
                <div className="profile-preview">
                  {preview ? (
                    <img src={preview} alt="Profile" className="profile-img-preview" />
                  ) : (
                    <div className="profile-placeholder">No Image</div>
                  )}
                </div>
                <h3>{profile.name || user?.name}</h3>
                <p>{profile.email || user?.email}</p>
                <span className="lecture-badge badge-upcoming">{profile.role || user?.role}</span>
              </div>

              {editing ? (
                <form className="auth-form profile-form" onSubmit={handleSubmit}>
                  <label>
                    Name
                    <input name="name" value={profile.name} onChange={handleChange} required />
                  </label>
                  <label>
                    Email
                    <input type="email" name="email" value={profile.email} onChange={handleChange} required />
                  </label>
                  {profile.role === 'STUDENT' ? (
                    <>
                      <label>
                        Class
                        <input name="class" value={profile.class} onChange={handleChange} />
                      </label>
                      <label>
                        Division
                        <input name="division" value={profile.division} onChange={handleChange} />
                      </label>
                    </>
                  ) : null}
                  <label>
                    Profile Image
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <div className="table-actions">
                    <button type="submit" className="primary-button" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="secondary-button" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-readonly">
                  <div className="profile-info-row">
                    <span>Name</span>
                    <strong>{profile.name}</strong>
                  </div>
                  <div className="profile-info-row">
                    <span>Email</span>
                    <strong>{profile.email}</strong>
                  </div>
                  <div className="profile-info-row">
                    <span>Role</span>
                    <strong>{profile.role}</strong>
                  </div>
                  {profile.role === 'STUDENT' ? (
                    <>
                      <div className="profile-info-row">
                        <span>Class</span>
                        <strong>{profile.class || '-'}</strong>
                      </div>
                      <div className="profile-info-row">
                        <span>Division</span>
                        <strong>{profile.division || '-'}</strong>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Profile;
