// src/App.js
import React from 'react';

import { Routes, Route } from 'react-router-dom';
import LandingPage from 'components/LandingPage'; 
import Login from 'components/Login'; 
import Signup from 'components/Signup'; 
import Profile from 'components/Profile'; 
import HomePage from 'components/HomePage';
import Header from 'components/Header'; 
import UpdateProfile from 'components/UpdateProfile/UpdateProfile';
function App() {

  return (
    <div>
      <Header />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/update-profile" element={<UpdateProfile />} />
    </Routes>
    </div>
    
  );
}

export default App;
