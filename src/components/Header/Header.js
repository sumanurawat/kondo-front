import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth';
import 'components/Header/Header.css';

function Header() {
  const { currentUser } = useAuth();

  return (
    <header className="header">
      <nav className="header-nav">
        <ul className="nav-links">
          {/* Always show Home and tool links */}
          <li><Link to="/" className="nav-link home-link">Home</Link></li>
          <li><Link to="/derplexity" className="nav-link">Derplexity</Link></li>
          <li><Link to="/doogle" className="nav-link">Doogle</Link></li>
          
          {currentUser && (
            <>
              <li><Link to="/home" className="nav-link">Dashboard</Link></li>
              <li><Link to="/profile" className="nav-link">Profile</Link></li>
            </>
          )}
          
          {!currentUser && (
            <>
              <li><Link to="/login" className="nav-link">Login</Link></li>
              <li><Link to="/signup" className="nav-link">Signup</Link></li>
            </>
          )}
        </ul>
        
        {/* Social Media Icons */}
        <div className="social-icons">
          <a 
            href="https://github.com/sumanurawat" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-icon"
            title="GitHub Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>
          
          <a 
            href="https://www.linkedin.com/in/sumanurawat/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-icon"
            title="LinkedIn Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
          
          <a 
            href="https://scholar.google.com/citations?user=0gw8EuQAAAAJ&hl=en" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-icon"
            title="Google Scholar Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269z" fill="none" stroke="currentColor"/>
              <path d="M10 10h4v8h-4z" fill="none" stroke="currentColor"/>
              <path d="M18 19a6 6 0 01-12 0" fill="none" stroke="currentColor"/>
              <path d="M12 7a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" stroke="none"/>
              <path d="M12 22a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" stroke="none"/>
              <path d="M7 16.5h10" stroke="currentColor"/>
            </svg>
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Header;
