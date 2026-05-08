import { createElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateLecture from './pages/CreateLecture';
import LectureList from './pages/LectureList';
import AdminHome from './pages/AdminHome';
import AdminAttendance from './pages/AdminAttendance';
import ExamManagement from './pages/ExamManagement';
import ExamMonitor from './pages/ExamMonitor';
import LectureManagement from './pages/LectureManagement';
import MonitorPage from './pages/MonitorPage';
import ReportPage from './pages/ReportPage';
import Profile from './pages/Profile';
import TeacherHome from './pages/TeacherHome';
import TeacherAttendance from './pages/TeacherAttendance';
import UserManagement from './pages/UserManagement';
import StudentHome from './pages/StudentHome';
import StudentAttendance from './pages/StudentAttendance';
import StudentLectures from './pages/StudentLectures';
import StudentReport from './pages/StudentReport';
import StudyMaterial from './pages/StudyMaterial';
import UploadNotes from './pages/UploadNotes';
import ChatPage from './pages/ChatPage';
import { getDashboardPathByRole } from './utils/auth';

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return createElement(Navigate, { to: '/login', replace: true });
  }

  return createElement(Navigate, {
    to: getDashboardPathByRole(user.role),
    replace: true,
  });
}

function App() {
  return createElement(
    Routes,
    null,
    createElement(Route, {
      path: '/',
      element: createElement(HomeRedirect),
    }),
    createElement(Route, {
      path: '/login',
      element: createElement(LoginPage),
    }),
    createElement(Route, {
      path: '/register',
      element: createElement(RegisterPage),
    }),
    createElement(Route, {
      path: '/teacher',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['TEACHER'] },
        createElement(TeacherHome)
      ),
    }),
    createElement(Route, {
      path: '/create-lecture',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['TEACHER'] },
        createElement(CreateLecture)
      ),
    }),
    createElement(Route, {
      path: '/lectures',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['TEACHER'] },
        createElement(LectureList)
      ),
    }),
    createElement(Route, {
      path: '/upload-notes/:lectureId',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['TEACHER'] },
        createElement(UploadNotes)
      ),
    }),
    createElement(Route, {
      path: '/monitor/:id',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['TEACHER'] },
        createElement(MonitorPage)
      ),
    }),
    createElement(Route, {
      path: '/teacher/attendance/:lectureId',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['TEACHER'] },
        createElement(TeacherAttendance)
      ),
    }),
    createElement(Route, {
      path: '/report/:id',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['TEACHER', 'ADMIN'] },
        createElement(ReportPage)
      ),
    }),
    createElement(Route, {
      path: '/exam-report/:id',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['ADMIN'] },
        createElement(ReportPage, { reportType: 'exam' })
      ),
    }),
    createElement(Route, {
      path: '/admin',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['ADMIN'] },
        createElement(AdminHome)
      ),
    }),
    createElement(Route, {
      path: '/admin/users',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['ADMIN'] },
        createElement(UserManagement)
      ),
    }),
    createElement(Route, {
      path: '/admin/lectures',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['ADMIN'] },
        createElement(LectureManagement)
      ),
    }),
    createElement(Route, {
      path: '/admin/attendance/:lectureId',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['ADMIN'] },
        createElement(AdminAttendance)
      ),
    }),
    createElement(Route, {
      path: '/admin/exams',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['ADMIN'] },
        createElement(ExamManagement)
      ),
    }),
    createElement(Route, {
      path: '/admin/exam/:id',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['ADMIN'] },
        createElement(ExamMonitor)
      ),
    }),
    createElement(Route, {
      path: '/profile',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'] },
        createElement(Profile)
      ),
    }),
    createElement(Route, {
      path: '/student',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['STUDENT'] },
        createElement(StudentHome)
      ),
    }),
    createElement(Route, {
      path: '/student/profile',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['STUDENT'] },
        createElement(Profile)
      ),
    }),
    createElement(Route, {
      path: '/student/attendance',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['STUDENT'] },
        createElement(StudentAttendance)
      ),
    }),
    createElement(Route, {
      path: '/student/lectures',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['STUDENT'] },
        createElement(StudentLectures)
      ),
    }),
    createElement(Route, {
      path: '/chat/:lectureId',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'] },
        createElement(ChatPage)
      ),
    }),
    createElement(Route, {
      path: '/student/report/:id',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'] },
        createElement(StudentReport)
      ),
    }),
    createElement(Route, {
      path: '/student/material/:lectureId',
      element: createElement(
        ProtectedRoute,
        { allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'] },
        createElement(StudyMaterial)
      ),
    }),
    createElement(Route, {
      path: '*',
      element: createElement(Navigate, { to: '/', replace: true }),
    })
  );
}

export default App;
