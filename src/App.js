// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

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
        <Route path="/write" element={<Write />} />
        <Route path="/EditArticle/:articleId" element={<EditArticle />} />
        <Route path="/binder/:binderId" element={<BinderPage />} />
        <Route path="/derplexity" element={<Derplexity />} />
      </Routes>
    </div>
  );
}

export default App;
