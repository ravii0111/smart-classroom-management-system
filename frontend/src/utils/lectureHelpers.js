export function getTeacherLectureStorageKey(teacherId) {
  return `teacher_lectures_${teacherId}`;
}

export function getReminderStorageKey(teacherId) {
  return `teacher_lecture_reminders_${teacherId}`;
}

export function getTeacherLectureIds(teacherId) {
  if (!teacherId) {
    return [];
  }

  const storedValue = localStorage.getItem(getTeacherLectureStorageKey(teacherId));

  if (!storedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTeacherLectureId(teacherId, lectureId) {
  if (!teacherId || !lectureId) {
    return;
  }

  const currentIds = getTeacherLectureIds(teacherId);

  if (currentIds.includes(lectureId)) {
    return;
  }

  localStorage.setItem(
    getTeacherLectureStorageKey(teacherId),
    JSON.stringify([...currentIds, lectureId])
  );
}

export function getLectureStatus(startTime, endTime) {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) {
    return 'UPCOMING';
  }

  if (now >= start && now <= end) {
    return 'ONGOING';
  }

  return 'COMPLETED';
}

export function formatLectureDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function formatDateTime(value) {
  return formatLectureDateTime(value);
}

export function formatDateTimeRange(startTime, endTime) {
  return `${formatDateTime(startTime)} - ${formatDateTime(endTime)}`;
}

export function getReportPercentages(report) {
  if (!report) {
    return {
      focusedPercentage: 0,
      distractedPercentage: 0,
      sleepingPercentage: 0,
      cheatingPercentage: 0,
    };
  }

  const totalBehaviors =
    (report.focusedCount || 0) +
    (report.distractedCount || 0) +
    (report.sleepingCount || 0) +
    (report.cheatingCount || 0);

  if (!totalBehaviors) {
    return {
      focusedPercentage: 0,
      distractedPercentage: 0,
      sleepingPercentage: 0,
      cheatingPercentage: 0,
    };
  }

  return {
    focusedPercentage: Number(report.focusPercentage || 0),
    distractedPercentage: Number((((report.distractedCount || 0) * 100) / totalBehaviors).toFixed(2)),
    sleepingPercentage: Number((((report.sleepingCount || 0) * 100) / totalBehaviors).toFixed(2)),
    cheatingPercentage: Number((((report.cheatingCount || 0) * 100) / totalBehaviors).toFixed(2)),
  };
}

export function getTeacherSummaryMetrics(lectures, reports) {
  const totalLectures = lectures.length;
  const ongoingLectures = lectures.filter(
    (lecture) => getLectureStatus(lecture.startTime, lecture.endTime) === 'ONGOING'
  ).length;
  const completedLectures = lectures.filter(
    (lecture) => getLectureStatus(lecture.startTime, lecture.endTime) === 'COMPLETED'
  ).length;

  const completedReports = lectures
    .filter((lecture) => getLectureStatus(lecture.startTime, lecture.endTime) === 'COMPLETED')
    .map((lecture) => reports[lecture.id])
    .filter(Boolean);

  const averageFocus = completedReports.length
    ? Number(
        (
          completedReports.reduce((sum, report) => sum + Number(report.focusPercentage || 0), 0) /
          completedReports.length
        ).toFixed(2)
      )
    : 0;

  return {
    totalLectures,
    ongoingLectures,
    completedLectures,
    averageFocus,
  };
}

export function getStoredReminders(teacherId) {
  if (!teacherId) {
    return [];
  }

  const storedValue = localStorage.getItem(getReminderStorageKey(teacherId));

  if (!storedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredReminders(teacherId, reminders) {
  if (!teacherId) {
    return;
  }

  localStorage.setItem(getReminderStorageKey(teacherId), JSON.stringify(reminders));
}

export function upsertReminder(teacherId, reminder) {
  const reminders = getStoredReminders(teacherId);
  const nextReminders = reminders.filter((item) => item.lectureId !== reminder.lectureId);
  nextReminders.push(reminder);
  saveStoredReminders(teacherId, nextReminders);
}

export function removeReminder(teacherId, lectureId) {
  const reminders = getStoredReminders(teacherId).filter((item) => item.lectureId !== lectureId);
  saveStoredReminders(teacherId, reminders);
}

export async function ensureNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  return Notification.requestPermission();
}

export function showLectureReminderNotification(title) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    window.alert('Lecture starting soon');
    return;
  }

  new Notification('Lecture starting soon', {
    body: title ? `${title} begins in about 5 minutes.` : 'Your lecture begins in about 5 minutes.',
  });
}
