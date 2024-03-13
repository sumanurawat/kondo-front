// src/Profile.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase-config';
import { signOut } from 'firebase/auth';

function Profile() {
  const navigate = useNavigate();
  const userEmail = auth.currentUser?.email; // Optional chaining to handle if the user is not logged in

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Navigate to the root or login page after logout
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div>
      <h1>Welcome</h1>
      {userEmail && <p>{userEmail}</p>}
      <button onClick={handleLogout}>Logout</button> {/* Logout button */}
    </div>
  );
}

export default Profile;
