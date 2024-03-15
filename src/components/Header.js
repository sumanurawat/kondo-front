import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth';

function Header() {
  const { currentUser } = useAuth(); // This hook is to check if a user is logged in

  return (
    <header>
      <nav>
        {/* Only show these links if there is a currentUser */}
        {currentUser && (
          <>
            <Link to="/home">Home</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
