import React from 'react';
import Navbar from './Navbar';

function StudentNavbar() {
  return (
    <Navbar
      title="Student Portal"
      eyebrow="AI Monitor"
      logoText="STUDENT"
      links={[
        { to: '/student', label: 'Dashboard' },
        { to: '/student/lectures', label: 'Lectures' },
        { to: '/student/attendance', label: 'Attendance' },
        { to: '/profile', label: 'Profile' },
      ]}
    />
  );
}

export default StudentNavbar;
