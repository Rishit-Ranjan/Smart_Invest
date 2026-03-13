import React from 'react';
import { SunIcon, MoonIcon } from './Icons';
import './Navbar.css';

export default function Navbar({ isDark, onToggleTheme, currentPage, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <span className="navbar-brand" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
            Smart Invest
          </span>
        </div>
        <div className="navbar-right">
          <div className="navbar-links">
            <button
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
            >
              Home
            </button>
            <button
              className={`nav-link ${currentPage === 'news' ? 'active' : ''}`}
              onClick={() => onNavigate('news')}
            >
              News
            </button>
            <button
              className={`nav-link ${currentPage === 'watchlist' ? 'active' : ''}`}
              onClick={() => onNavigate('watchlist')}
            >
              Watchlist
            </button>
          </div>
          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
}
