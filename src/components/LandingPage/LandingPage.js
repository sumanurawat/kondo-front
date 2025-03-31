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
          <a 
            href="https://www.linkedin.com/in/sumanurawat/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="social-link linkedin"
            title="View LinkedIn Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            <span>LinkedIn</span>
          </a>
          {/* Login and signup buttons removed */}
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
              <p>An LLM application experiment inspired by Perplexity, built on self-hosted open-source models.</p>
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
          
          <a href="https://github.com/sumanurawat" target="_blank" rel="noopener noreferrer" className="feature-card">
            <div className="feature-content">
              <h2>GitHub</h2>
              <p>Explore my open-source projects and contributions on GitHub.</p>
              <div className="card-actions">
                <span className="card-link">
                  github.com/sumanurawat
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </span>
              </div>
            </div>
            <div className="feature-illustration">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </div>
          </a>
          
          <a href="https://scholar.google.com/citations?user=0gw8EuQAAAAJ&hl=en" target="_blank" rel="noopener noreferrer" className="feature-card">
            <div className="feature-content">
              <h2>Google Scholar</h2>
              <p>View my academic publications and research contributions.</p>
              <div className="card-actions">
                <span className="card-link">
                  scholar.google.com
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </span>
              </div>
            </div>
            <div className="feature-illustration">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20.94c1.5 0 2.75-.5 3.5-1.34l-1.5-1.16c-.5.46-1.17.75-2 .75-1.62 0-3.03-1.06-3.5-2.53h8.04c.1-.45.16-.9.16-1.35 0-3.32-2.67-6-5.97-6.03-3.31.03-6.03 2.7-6.03 6.03s2.72 6 6.03 6.03m0-10.53c1.6 0 3 .8 3.5 2H8.5c.5-1.2 1.9-2 3.5-2z"></path>
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"></path>
              </svg>
            </div>
          </a>
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
