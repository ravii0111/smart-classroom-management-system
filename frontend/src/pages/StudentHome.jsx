import React, { useState, useEffect } from 'react';
import StudentNavbar from '../components/StudentNavbar';
import api from '../services/api';

function StudentHome() {
  const [stats, setStats] = useState({
    totalLectures: 0,
    attendedLectures: 0,
    attendancePercentage: 0,
    focusPercentage: 0,
    distractedPercentage: 0,
    sleepingPercentage: 0,
    attendanceHistory: [],
    profileComplete: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const profileResponse = await api.get('/student/profile');
        const hasProfile =
          Boolean(profileResponse.data?.class) && Boolean(profileResponse.data?.division);

        const response = await api.get('/student/dashboard');
        setStats({
          totalLectures: response.data.totalLectures || 0,
          attendedLectures: response.data.attendedLectures || 0,
          attendancePercentage: response.data.attendancePercentage || 0,
          focusPercentage: response.data.focusPercentage || 0,
          distractedPercentage: response.data.distractedPercentage || 0,
          sleepingPercentage: response.data.sleepingPercentage || 0,
          attendanceHistory: response.data.attendanceHistory || [],
          profileComplete: hasProfile,
        });
      } catch (err) {
        setError('Failed to load dashboard data.');
        setStats({
          totalLectures: 0,
          attendedLectures: 0,
          attendancePercentage: 0,
          focusPercentage: 0,
          distractedPercentage: 0,
          sleepingPercentage: 0,
          attendanceHistory: [],
          profileComplete: false,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="student-shell">
      <StudentNavbar />
      <main className="student-content">
        <div className="dashboard-card" style={{ marginBottom: '24px' }}>
          <div>
            <p className="eyebrow">Overview</p>
            <h1>My Dashboard</h1>
          </div>
        </div>

        {loading ? (
          <p>Loading stats...</p>
        ) : !stats.profileComplete ? (
          <div className="dashboard-card" style={{ marginTop: '24px', display: 'block' }}>
            <h2>Complete Your Profile</h2>
            <p>Update your class and division in Profile first. Your lecture list and personal metrics will appear only after that.</p>
          </div>
        ) : (
          <>
            <div className="student-grid dashboard-grid">
              <div className="dashboard-panel">
                <p className="eyebrow">Lectures</p>
                <h2>Total Lectures</h2>
                <div className="report-highlight">{stats.totalLectures}</div>
              </div>
              <div className="dashboard-panel">
                <p className="eyebrow">Attendance</p>
                <h2>Attended</h2>
                <div className="report-highlight">{stats.attendedLectures}</div>
              </div>
              <div className="dashboard-panel">
                <p className="eyebrow">Metrics</p>
                <h2>Attendance %</h2>
                <div className="report-highlight">{stats.attendancePercentage}%</div>
              </div>
              <div className="dashboard-panel">
                <p className="eyebrow">Metrics</p>
                <h2>Avg Focus %</h2>
                <div className="report-highlight">{stats.focusPercentage}%</div>
              </div>
              <div className="dashboard-panel">
                <p className="eyebrow">Metrics</p>
                <h2>Distracted %</h2>
                <div className="report-highlight" style={{ color: '#d96c06' }}>{stats.distractedPercentage}%</div>
              </div>
              <div className="dashboard-panel">
                <p className="eyebrow">Metrics</p>
                <h2>Sleeping %</h2>
                <div className="report-highlight" style={{ color: '#c83333' }}>{stats.sleepingPercentage}%</div>
              </div>
            </div>

            <div className="dashboard-card" style={{ marginTop: '24px', display: 'block' }}>
              <h2>Attendance History</h2>
              <div className="lecture-list">
                {stats.attendanceHistory?.map((record, idx) => (
                  <div key={idx} className="lecture-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{record.title}</strong>
                    <span className={`lecture-badge ${record.status === 'PRESENT' ? 'badge-ongoing' : 'badge-completed'}`}
                          style={record.status === 'PRESENT' ? {backgroundColor: '#e9f9ef', color: '#0f8a3b'} : {backgroundColor: '#ffeaea', color: '#c83333'}}>
                      {record.status}
                    </span>
                  </div>
                ))}
                {(!stats.attendanceHistory || stats.attendanceHistory.length === 0) && (
                  <p>No history available.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default StudentHome;
