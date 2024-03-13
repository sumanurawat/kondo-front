import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth } from './firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


import Profile from './Profile';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null); // State to keep track of the current user
  const navigate = useNavigate();

    // Effect to monitor the auth state
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          setUser(user); // If logged in, set user state
        } else {
          setUser(null); // If logged out, reset user state
        }
      });
      return unsubscribe; // Cleanup listener on unmount
    }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in on app page');
      navigate('/profile');
    } catch (error) {
      setError('Failed to log in. Incorrect email or password.');
      console.error(error.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created');
      // Redirect to profile page is handled by the auth state change listener
      navigate('/profile');
    } catch (error) {
      setError(error.message);
      console.error(error.message);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      navigate('/'); // Redirect to default page
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
      <Routes>
        <Route path="/" element={
          <div>
            <h1>Login/Signup</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
              <button type="button" onClick={handleLogin}>Login</button>
              <button type="button" onClick={handleSignup}>Signup</button>
            </form>
          </div>
        } />
        <Route path="/profile" element={<Profile />} />
      </Routes>
  );
}

export default App;
