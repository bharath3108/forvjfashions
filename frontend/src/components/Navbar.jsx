import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navClass = ({ isActive }) =>
  `block px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive ? 'bg-brand-100 text-brand-700' : 'text-gray-700 hover:bg-gray-100'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-brand-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="font-display font-bold text-xl text-brand-600" onClick={closeMenu}>
          VJ Fashions
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          <NavLink to="/" className={navClass} end>
            Home
          </NavLink>
          <NavLink to="/shop" className={navClass}>
            Shop
          </NavLink>
          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          {user ? (
            <>
              <span className="text-gray-600 hidden md:inline">
                Hi, {user.name}
                {!user.isVerified && (
                  <span className="ml-1 text-amber-600">(unverified)</span>
                )}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 rounded-lg hover:bg-gray-50">
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="sm:hidden border-t border-brand-100 px-4 py-2 space-y-1">
          <NavLink to="/" className={navClass} end onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navClass} onClick={closeMenu}>
            Shop
          </NavLink>
          <NavLink to="/contact" className={navClass} onClick={closeMenu}>
            Contact
          </NavLink>
        </nav>
      )}
    </header>
  );
}
