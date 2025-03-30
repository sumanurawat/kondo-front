import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth';
import 'components/Header/Header.css';

function Header() {
  const { currentUser } = useAuth();

  return (
    <header className="header">
      <nav>
        <ul className="nav-links">
          {/* Derplexity is available to all users */}
          <li><Link to="/derplexity" className="nav-link">Derplexity</Link></li>
          
          {currentUser && (
            <>
              <li><Link to="/home" className="nav-link">Home</Link></li>
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
      </nav>
    </header>
  );
}

export default Header;
