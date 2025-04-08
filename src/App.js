// src/App.js
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import LandingPage from 'components/LandingPage/LandingPage'; // Updated path
import Login from 'components/Login'; 
import Signup from 'components/Signup'; 
import Profile from 'components/Profile/Profile'; 
import HomePage from 'components/HomePage';
import Header from 'components/Header/Header';
import UpdateProfile from 'components/UpdateProfile/UpdateProfile';
import Write from 'components/Write/Write';
import EditArticle from 'components/EditArticle/EditArticle';
import BinderPage from 'components/Binder/BinderPage/BinderPage';
import Derplexity from 'components/Derplexity/Derplexity'; 
import Doogle from 'components/Doogle/Doogle';
import './App.css'; 

function App() {
  const location = useLocation();
  const isDerplexity = location.pathname === '/derplexity';
  const isLandingPage = location.pathname === '/';
  const isDoogle = location.pathname === '/doogle';
  
  // Add a meta viewport tag to ensure proper mobile scaling
  React.useEffect(() => {
    // Fix for mobile viewports
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    document.getElementsByTagName('head')[0].appendChild(meta);
    
    return () => {
      document.getElementsByTagName('head')[0].removeChild(meta);
    };
  }, []);
  
  return (
    <div className={`app-container ${isDerplexity ? 'derplexity-page' : ''} ${isLandingPage ? 'landing-page' : ''} ${isDoogle ? 'doogle-page' : ''}`}>
      {/* Show header on all pages */}
      <Header />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/write" element={<Write />} />
        <Route path="/EditArticle/:articleId" element={<EditArticle />} />
        <Route path="/binder/:binderId" element={<BinderPage />} />
        <Route path="/derplexity" element={<Derplexity />} />
        <Route path="/doogle" element={<DoogleWrapper />} />
      </Routes>
    </div>
  );
}

function DoogleWrapper() {
  useEffect(() => {
    // Add class to body
    document.body.classList.add('doogle-active');
    
    // Cleanup
    return () => {
      document.body.classList.remove('doogle-active');
    };
  }, []);
  
  return (
    <div className="doogle-container">
      <Doogle />
    </div>
  );
}

export default App;
