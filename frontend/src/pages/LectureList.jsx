import { useEffect, useRef, useState } from 'react';
import LectureCard from '../components/LectureCard';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ensureNotificationPermission,
  getLectureStatus,
  getStoredReminders,
  getTeacherLectureIds,
  removeReminder,
  showLectureReminderNotification,
  upsertReminder,
} from '../utils/lectureHelpers';

function LectureList() {
  const { logout, user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [reports, setReports] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const timersRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timerId) => {
        window.clearTimeout(timerId);
      });
    };
  }, []);

  useEffect(() => {
    ensureNotificationPermission();
  }, []);

  useEffect(() => {
    const reminders = getStoredReminders(user?.id);
    reminders.forEach((reminder) => {
      scheduleReminder(reminder);
    });
  }, [user?.id]);

  useEffect(() => {
    let ignore = false;

    async function fetchLectures() {
      try {
        setLoading(true);
        const response = await api.get('/lectures');
        const teacherLectureIds = getTeacherLectureIds(user?.id);
        const fetchedLectures = Array.isArray(response.data) ? response.data : [];
        const filteredLectures = fetchedLectures.filter((lecture) =>
          teacherLectureIds.includes(lecture.id)
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
          return;
        }

        if (!ignore) {
          setErrorMessage(
            error.response?.data?.error || 'Unable to fetch lectures. Please try again.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchLectures();

    return () => {
      ignore = true;
    };
  }, [logout, user?.id]);

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

  const filteredLectures = lectures.filter((lecture) => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getLectureStatus(lecture.startTime, lecture.endTime);
    const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-page">
      <Navbar />

      <section className="dashboard-section">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">Lecture Cards</p>
            <h2>Lecture List</h2>
            <p>Only lectures created by the logged-in teacher are shown here.</p>
          </div>
          <div className="filters-row">
            <input
              type="text"
              className="search-input"
              placeholder="Search by lecture title"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <select
              className="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {infoMessage ? <p className="form-success">{infoMessage}</p> : null}
        {loading ? <p>Loading lectures...</p> : null}
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        {!loading && !errorMessage && filteredLectures.length === 0 ? (
          <div className="empty-state">
            <h4>No lectures found</h4>
            <p>Try a different search or filter, or create a new lecture.</p>
          </div>
        ) : null}

        {!loading && !errorMessage && filteredLectures.length > 0 ? (
          <div className="lecture-card-grid">
            {filteredLectures.map((lecture) => (
              <LectureCard
                key={lecture.id || `${lecture.title}-${lecture.startTime}`}
                lecture={lecture}
                report={reports[lecture.id]}
                onSetReminder={handleSetReminder}
                showAttendanceLink
                showChatLink
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default LectureList;
