import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { saveTeacherLectureId } from '../utils/lectureHelpers';

function CreateLecture() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    class: '',
    division: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await api.post('/lectures', formData);
      saveTeacherLectureId(user?.id, response.data?.id);
      setSuccessMessage('Lecture created successfully.');
      setFormData({
        title: '',
        startTime: '',
        endTime: '',
        class: '',
        division: '',
      });
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      setErrorMessage(
        error.response?.data?.error || 'Unable to create lecture. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <section className="dashboard-section create-layout">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">Lecture Setup</p>
            <h2>Create Lecture</h2>
            <p>Schedule a session with a clear title, start time, and end time.</p>
          </div>
        </div>

        <div className="teacher-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="title">
            Title
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Introduction to Networks"
              required
            />
          </label>

          <label htmlFor="startTime">
            Start Time
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="endTime">
            End Time
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="class">
            Class
            <select
              id="class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
            >
              <option value="">Select a Class</option>
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
            </select>
          </label>

          <label htmlFor="division">
            Division
            <select
              id="division"
              name="division"
              value={formData.division}
              onChange={handleChange}
              required
            >
              <option value="">Select a Division</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </label>

          {successMessage ? <p className="form-success">{successMessage}</p> : null}
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating...' : 'Create Lecture'}
          </button>
        </form>
        </div>
      </section>
    </div>
  );
}

export default CreateLecture;
