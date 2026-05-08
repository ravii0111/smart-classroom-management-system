import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar({
  title = 'AI Classroom Monitor',
  eyebrow = 'Smart Monitoring',
  logoText = 'AI',
  links = [
    { to: '/teacher', label: 'Home' },
    { to: '/create-lecture', label: 'Create Lecture' },
    { to: '/lectures', label: 'Lectures' },
  ],
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const resolvedLinks = links.some((link) => link.to === '/profile')
    ? links
    : [...links, { to: '/profile', label: 'Profile' }];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="app-navbar">
      <div className="app-navbar__brand">
        <div className="app-navbar__logo">{logoText}</div>
        <div>
          <p className="app-navbar__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </div>

      <nav className="app-navbar__links">
        {resolvedLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `app-navbar__link${isActive ? ' is-active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="danger-button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}

export default Navbar;
