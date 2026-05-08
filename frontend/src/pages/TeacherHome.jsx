import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertsPanel from '../components/AlertsPanel';
import LectureCard from '../components/LectureCard';
import LiveMonitoringPanel from '../components/LiveMonitoringPanel';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ensureNotificationPermission,
  getStoredReminders,
  getLectureStatus,
  getTeacherLectureIds,
  getTeacherSummaryMetrics,
  removeReminder,
  showLectureReminderNotification,
  upsertReminder,
} from '../utils/lectureHelpers';

function TeacherHome() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const timersRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  useEffect(() => {
    const reminders = getStoredReminders(user?.id);
    reminders.forEach((reminder) => scheduleReminder(reminder));
  }, [user?.id]);

  useEffect(() => {
    ensureNotificationPermission();
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        const lectureResponse = await api.get('/lectures');
        const teacherLectureIds = getTeacherLectureIds(user?.id);
        const filteredLectures = (Array.isArray(lectureResponse.data) ? lectureResponse.data : []).filter(
          (lecture) => teacherLectureIds.includes(lecture.id)
        );

        const reportResults = await Promise.all(
          filteredLectures.map(async (lecture) => {
            try {
              const reportResponse = await api.get(`/report/${lecture.id}`);
              return [lecture.id, reportResponse.data];
            } catch {
              return [lecture.id, null];
            }
          })
        );

        if (!ignore) {
          setLectures(filteredLectures);
          setReports(Object.fromEntries(reportResults));
          setErrorMessage('');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }

        if (!ignore) {
          setErrorMessage(
            error.response?.data?.error || 'Unable to load dashboard analytics. Please try again.'
          );
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
  }, [logout, navigate, user?.id]);

  const scheduleReminder = (reminder) => {
    if (!reminder?.lectureId) {
      return;
    }

    const delay = new Date(reminder.triggerAt).getTime() - Date.now();

    if (timersRef.current[reminder.lectureId]) {
      window.clearTimeout(timersRef.current[reminder.lectureId]);
    }

    if (delay <= 0) {
      showLectureReminderNotification(reminder.title);
      removeReminder(user?.id, reminder.lectureId);
      delete timersRef.current[reminder.lectureId];
      return;
    }

    timersRef.current[reminder.lectureId] = window.setTimeout(() => {
      showLectureReminderNotification(reminder.title);
      removeReminder(user?.id, reminder.lectureId);
      delete timersRef.current[reminder.lectureId];
    }, delay);
  };

  const handleSetReminder = (lecture) => {
    const startTime = new Date(lecture.startTime);
    const triggerAt = new Date(startTime.getTime() - 5 * 60 * 1000);

    if (triggerAt.getTime() <= Date.now()) {
      setInfoMessage('Reminder time has already passed for this lecture.');
      return;
    }

    const reminder = {
      lectureId: lecture.id,
      triggerAt: triggerAt.toISOString(),
      title: lecture.title,
    };

    upsertReminder(user?.id, reminder);
    scheduleReminder(reminder);
    setInfoMessage(`Reminder set for "${lecture.title}" 5 minutes before start time.`);
  };

  const sortedLectures = useMemo(
    () => [...lectures].sort((first, second) => new Date(first.startTime) - new Date(second.startTime)),
    [lectures]
  );

  const summary = useMemo(
    () => getTeacherSummaryMetrics(sortedLectures, reports),
    [sortedLectures, reports]
  );

  const activeOngoingLecture = useMemo(
    () =>
      sortedLectures.find(
        (lecture) => getLectureStatus(lecture.startTime, lecture.endTime) === 'ONGOING'
      ) || null,
    [sortedLectures]
  );

  const handleUnauthorized = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <section className="hero-panel">
        <div>
          <p className="eyebrow">Teacher Home</p>
          <h2>Welcome back, {user?.name || user?.email}</h2>
          <p className="dashboard-subtext">
            Track lectures, jump into live monitoring, and review lecture-wise focus analytics from one place.
          </p>
        </div>

        <div className="hero-panel__actions">
          <Link className="primary-button hero-button" to="/create-lecture">
            Create Lecture
          </Link>
          <Link
            className="success-button hero-button"
            to={activeOngoingLecture ? `/monitor/${activeOngoingLecture.id}` : '/lectures'}
          >
            Start Monitoring
          </Link>
          <Link className="secondary-button hero-button" to="/lectures">
            View Reports
          </Link>
        </div>
      </section>

      <section className="summary-grid">
        <article className="summary-card">
          <span>Total Lectures</span>
          <strong>{summary.totalLectures}</strong>
        </article>
        <article className="summary-card">
          <span>Ongoing Lectures</span>
          <strong>{summary.ongoingLectures}</strong>
        </article>
        <article className="summary-card">
          <span>Completed Lectures</span>
          <strong>{summary.completedLectures}</strong>
        </article>
        <article className="summary-card">
          <span>Average Focus %</span>
          <strong>{summary.averageFocus}%</strong>
        </article>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <div>
            <h3>Lecture Analytics</h3>
            <p>Each lecture card shows live status and attention analytics.</p>
          </div>
        </div>

        {infoMessage ? <p className="form-success">{infoMessage}</p> : null}
        {loading ? <p>Loading dashboard...</p> : null}
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        {!loading && !errorMessage && sortedLectures.length === 0 ? (
          <div className="empty-state">
            <h4>No lectures yet</h4>
            <p>Create your first lecture to start monitoring and analytics tracking.</p>
          </div>
        ) : null}

        {!loading && !errorMessage && sortedLectures.length > 0 ? (
          <div className="lecture-card-grid">
            {sortedLectures.map((lecture) => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                report={reports[lecture.id]}
                onSetReminder={handleSetReminder}
                showAttendanceLink
              />
            ))}
          </div>
        ) : null}
      </section>

      <div className="dashboard-two-column">
        <LiveMonitoringPanel
          lectureId={activeOngoingLecture?.id}
          onUnauthorized={handleUnauthorized}
        />
        <AlertsPanel
          lectureId={activeOngoingLecture?.id}
          onUnauthorized={handleUnauthorized}
        />
      </div>
    </div>
  );
}

export default TeacherHome;
