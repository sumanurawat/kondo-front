// src/components/Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from 'firebase-config';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
function Profile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userProfile = await getDoc(userRef);
        if (userProfile.exists()) {
          setProfileData(userProfile.data());
        } else {
          // User does not have a profile yet, could navigate to create profile
          navigate('/update-profile');
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Navigate to the root or login page after logout
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleEditProfile = () => {
    // Navigate to the update profile page
    navigate('/update-profile');
  };

  return (
    <div>
      <h1>Welcome to your profile</h1>
      {user && <p>Email: {user.email}</p>}
      {profileData && (
        <>
          <p>Name: {profileData.name}</p>
          <p>Date of Birth: {profileData.dateOfBirth}</p>
          <p>Location: {profileData.location}</p>
        </>
      )}
      <button onClick={handleEditProfile}>Edit Profile</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Profile;
