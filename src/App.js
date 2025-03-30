// src/App.js
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import LandingPage from 'components/LandingPage'; 
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
import './App.css'; // Make sure to create this file if it doesn't exist

function App() {
  const location = useLocation();
  const isDerplexity = location.pathname === '/derplexity';
  
  return (
    <div className={`app-container ${isDerplexity ? 'derplexity-page' : ''}`}>
      {/* Only show header on non-Derplexity pages */}
      {!isDerplexity && <Header />}
      
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
      </Routes>
    </div>
  );
}

export default App;
