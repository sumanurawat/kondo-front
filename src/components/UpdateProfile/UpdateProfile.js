// src/components/UpdateProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from 'firebase-config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import 'components/UpdateProfile/UpdateProfile.css';

function UpdateProfile() {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user profile data and set it to state
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setName(userData.name || "");
          setDateOfBirth(userData.dateOfBirth || "");
          setLocation(userData.location || "");
          setBio(userData.bio || "");
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        name,
        dateOfBirth,
        location,
        bio,
      });
      navigate('/profile');
    }
  };

  return (
    <div className="update-profile-container">
      <h1>Update Profile</h1>
      <form onSubmit={handleSubmit} className="update-form">
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />

        <label htmlFor="dob">Date of Birth:</label>
        <input
          id="dob"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />

        <label htmlFor="location">Location:</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
        />

        <label htmlFor="bio">Bio:</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
        />

        <button type="submit" className="update-btn">Update Profile</button>
      </form>
    </div>
  );
}

export default UpdateProfile;