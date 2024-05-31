import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth';
import 'components/Header/Header.css'; // Import the CSS file

function Header() {
  const { currentUser } = useAuth(); // This hook checks if a user is logged in

  return (
    <header className="header">
      <nav>
        {currentUser && (
          <ul className="nav-links">
            <li><Link to="/home" className="nav-link">Home</Link></li>
            <li><Link to="/profile" className="nav-link">Profile</Link></li>
          </ul>
        )}
      </nav>
    </header>
  );
}

export default Header;
