import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { AuthContext } from '../store/AuthProvider';
import './header.css';

export default function Header() {
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleLeave = async () => {
    await signOut(auth);
    navigate('/auth?mode=login');
  };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'site-header__link site-header__link--active'
      : 'site-header__link';

  if (authCtx.isParticipant) {
    return (
      <header className="site-header">
        <div className="site-header__inner">
          <span className="site-header__logo">Stand-Up Duck</span>
          <nav className="site-header__nav">
            <NavLink to="retro" className={navLinkClass}>
              Retro
            </NavLink>
          </nav>
          <div className="site-header__actions">
            <button className="site-header__auth-btn" onClick={handleLeave}>
              Leave
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <span className="site-header__logo">Stand-Up Duck</span>

        {authCtx.user && (
          <nav className="site-header__nav">
            <NavLink to="manage-teams" className={navLinkClass}>
              Manage Teams
            </NavLink>
            <NavLink to="participants" className={navLinkClass}>
              Participants
            </NavLink>
            <NavLink to="/" end className={navLinkClass}>
              Run Stand-Up
            </NavLink>
            <NavLink to="retro" className={navLinkClass}>
              Retro
            </NavLink>
          </nav>
        )}

        <div className="site-header__actions">
          {!authCtx.user && (
            <NavLink to="auth?mode=login" className="site-header__auth-btn">
              Login
            </NavLink>
          )}
          {authCtx.user && (
            <button className="site-header__auth-btn" onClick={handleLogout}>
              Log Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
