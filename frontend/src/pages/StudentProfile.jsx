import React, { useState, useEffect } from 'react';
import StudentNavbar from '../components/StudentNavbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    class: '',
    division: '',
    rollNumber: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditMode, setIsEditMode] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

  const applyProfileResponse = (profileData) => {
    const nextProfile = profileData || {};

    setFormData({
      name: nextProfile.name || user?.name || '',
      class: nextProfile.class || '',
      division: nextProfile.division || '',
      rollNumber: nextProfile.rollNumber || '',
    });

    setPreview(nextProfile.profilePhotoPath || null);

    setProfileExists(
      Boolean(nextProfile.class) ||
      Boolean(nextProfile.division) ||
      Boolean(nextProfile.rollNumber) ||
      Boolean(nextProfile.profilePhotoPath)
    );

    if (nextProfile.name) {
      updateUser({ name: nextProfile.name });
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/student/profile');
        applyProfileResponse(res.data);
        setIsEditMode(!(res.data?.class || res.data?.division || res.data?.rollNumber || res.data?.profilePhotoPath));
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('class', formData.class);
    data.append('division', formData.division);
    data.append('rollNumber', formData.rollNumber);
    if (file) {
      data.append('profilePhoto', file);
    }

    try {
      const response = await api.post('/student/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      applyProfileResponse(response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditMode(false);
        setMessage({ type: '', text: '' });
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-shell">
      <StudentNavbar />
      <main className="student-content auth-shell" style={{ padding: '0', minHeight: 'auto', marginTop: '24px' }}>
        <div className="auth-card" style={{ margin: '0 auto' }}>
          <div className="auth-copy">
            <p className="eyebrow">Settings</p>
            <h1>My Profile</h1>
          </div>
          
          {message.text && (
            <p className={message.type === 'error' ? 'form-error' : 'form-success'}>
              {message.text}
            </p>
          )}

          {isEditMode ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="profile-preview">
                {preview ? (
                  <img src={preview} alt="Profile preview" className="profile-img-preview" />
                ) : (
                  <div className="profile-placeholder">No Image</div>
                )}
              </div>

              <label>
                Profile Photo
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>

              <label>
                Name
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </label>

              <label>
                Email (Read Only)
                <input type="email" value={user?.email || ''} readOnly disabled style={{background: '#e9ecef'}} />
              </label>

              <label>
                Class
                <input type="text" name="class" value={formData.class} onChange={handleChange} required />
              </label>

              <label>
                Division
                <input type="text" name="division" value={formData.division} onChange={handleChange} required />
              </label>

              <label>
                Roll Number
                <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
              </label>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="primary-button" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
                {profileExists && (
                  <button type="button" className="secondary-button" onClick={() => setIsEditMode(false)}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="auth-form" style={{ marginTop: '24px' }}>
              <div className="profile-preview">
                {preview ? (
                  <img src={preview} alt="Profile" className="profile-img-preview" />
                ) : (
                  <div className="profile-placeholder">Avatar</div>
                )}
              </div>
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Class:</strong> {formData.class}</p>
              <p><strong>Division:</strong> {formData.division}</p>
              <p><strong>Roll Number:</strong> {formData.rollNumber}</p>
              <button className="secondary-button" onClick={() => setIsEditMode(true)} style={{ width: '100%', marginTop: '16px' }}>
                Update Profile
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentProfile;
