import { useNavigate } from 'react-router-dom';
import {
  formatDateTime,
  formatDateTimeRange,
  getLectureStatus,
  getReportPercentages,
} from '../utils/lectureHelpers';

function LectureCard({
  lecture,
  report,
  onSetReminder,
  showAttendanceLink = false,
  attendanceBasePath = '/teacher/attendance',
  showChatLink = false,
}) {
  const navigate = useNavigate();
  const status = getLectureStatus(lecture.startTime, lecture.endTime);
  const percentages = getReportPercentages(report);

  return (
    <article className="lecture-modern-card">
      <div className="lecture-modern-card__header">
        <div>
          <p className="lecture-modern-card__date">{formatDateTime(lecture.startTime)}</p>
          <h3>{lecture.title}</h3>
          {lecture.class && lecture.division && (
             <p className="eyebrow" style={{ marginTop: '4px' }}>Class: {lecture.class} - Div: {lecture.division}</p>
          )}
        </div>
        <span className={`lecture-badge badge-${status.toLowerCase()}`}>{status}</span>
      </div>

      <p className="lecture-modern-card__range">
        {formatDateTimeRange(lecture.startTime, lecture.endTime)}
      </p>

      <div className="lecture-modern-card__stats">
        <div className="lecture-mini-stat">
          <span>Focus</span>
          <strong>{report ? `${report.focusPercentage}%` : '--'}</strong>
        </div>
        <div className="lecture-mini-stat">
          <span>Distracted</span>
          <strong>{report ? `${percentages.distractedPercentage}%` : '--'}</strong>
        </div>
        <div className="lecture-mini-stat">
          <span>Sleeping</span>
          <strong>{report ? `${percentages.sleepingPercentage}%` : '--'}</strong>
        </div>
      </div>

      {report ? (
        <div className="lecture-analytics-card">
          <div className="lecture-analytics-card__row">
            <span>Focus</span>
            <strong>{report.focusPercentage}%</strong>
          </div>
          <div className="behavior-bars">
            <div className="behavior-bars__track">
              <div
                className="behavior-bars__segment behavior-bars__segment--focused"
                style={{ width: `${report.focusPercentage}%` }}
              />
            </div>
          </div>
          <div className="lecture-analytics-card__row">
            <span>Distracted</span>
            <strong>{percentages.distractedPercentage}%</strong>
          </div>
          <div className="behavior-bars">
            <div className="behavior-bars__track">
              <div
                className="behavior-bars__segment behavior-bars__segment--distracted"
                style={{ width: `${percentages.distractedPercentage}%` }}
              />
            </div>
          </div>
          <div className="lecture-analytics-card__row">
            <span>Sleeping</span>
            <strong>{percentages.sleepingPercentage}%</strong>
          </div>
          <div className="behavior-bars">
            <div className="behavior-bars__track">
              <div
                className="behavior-bars__segment behavior-bars__segment--sleeping"
                style={{ width: `${percentages.sleepingPercentage}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="behavior-bars">
        <div className="behavior-bars__track">
          <div
            className="behavior-bars__segment behavior-bars__segment--focused"
            style={{ width: `${report ? report.focusPercentage : 0}%` }}
          />
          <div
            className="behavior-bars__segment behavior-bars__segment--distracted"
            style={{ width: `${report ? percentages.distractedPercentage : 0}%` }}
          />
          <div
            className="behavior-bars__segment behavior-bars__segment--sleeping"
            style={{ width: `${report ? percentages.sleepingPercentage : 0}%` }}
          />
        </div>
      </div>

      <div className="lecture-modern-card__actions">
        {status === 'ONGOING' ? (
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate(`/monitor/${lecture.id}`)}
          >
            Start Monitoring
          </button>
        ) : null}

        {status === 'COMPLETED' ? (
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate(`/report/${lecture.id}`)}
            >
              View Report
            </button>
            <button
              type="button"
              className="primary-button"
              style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1', color: '#fff' }}
              onClick={() => navigate(`/upload-notes/${lecture.id}`)}
            >
              Upload Notes
            </button>
          </>
        ) : null}

        {status === 'UPCOMING' ? (
          <button type="button" className="secondary-button" onClick={() => onSetReminder(lecture)}>
            Set Reminder
          </button>
        ) : null}

        {showAttendanceLink ? (
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate(`${attendanceBasePath}/${lecture.id}`)}
          >
            View Attendance
          </button>
        ) : null}

        {showChatLink ? (
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate(`/chat/${lecture.id}`)}
          >
            Open Chat
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default LectureCard;
