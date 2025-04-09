// src/components/LandingPage/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // This path is now relative to the file

const LandingPage = () => {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="nav-left">
          <div className="username">@sumanurawat</div>
        </div>
        <div className="nav-right">
          {/* LinkedIn link removed from here since it's now in the header */}
        </div>
      </nav>
      
      <main className="landing-content">
        <section className="hero-section">
          <h1 className="hero-title">I sometimes build stuff</h1>
          <p className="hero-subtitle">
            checkout my work
          </p>
        </section>
        
        <section className="features-grid">
          <div className="feature-card primary">
            <div className="feature-content">
              <h2>Derplexity</h2>
              <p>An AI assistant that can answer questions, write content, and help with various tasks.</p>
              <div className="card-actions">
                <Link to="/derplexity" className="card-button">
                  Try it now
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
            <div className="feature-illustration">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <circle cx="9" cy="10" r="1"></circle>
                <circle cx="14" cy="10" r="1"></circle>
                <path d="M9.5 13.5C9.5 13.5 11 15 12 15C13 15 14.5 13.5 14.5 13.5"></path>
              </svg>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-content">
              <h2>Doogle</h2>
              <p>A simple web search interface powered by Google's search API with a clean, focused result display.</p>
              <div className="card-actions">
                <Link to="/doogle" className="card-button">
                  Search the web
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-content">
              <h2>Robin</h2>
              <p>AI-powered news reporter that gathers and summarizes the latest news on any topic.</p>
              <div className="card-actions">
                <Link to="/robin" className="card-button">
                  Get News
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z"></path>
                <path d="M7 7H17"></path>
                <path d="M7 11H17"></path>
                <path d="M7 15H13"></path>
              </svg>
            </div>
          </div>
        </section>

        <section className="quirky-section">
          <div className="quirky-text">
            <p>When I'm not coding, I'm probably overthinking the physics of fictional universes.</p>
          </div>
        </section>
      </main>
      
      <footer className="landing-footer">
        <p>© 2025 Kondo</p>
      </footer>
    </div>
  );
};

export default LandingPage;
