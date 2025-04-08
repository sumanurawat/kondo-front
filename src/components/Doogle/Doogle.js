import React, { useState, useRef, useEffect } from 'react';
import { createSearchService } from '../../services/searchService';
import './Doogle.css';

function Doogle() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const searchService = useRef(createSearchService()).current;
  const resultsRef = useRef(null);
  
  // Force enable scrolling
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsSearching(true);
    setErrorMessage('');
    
    try {
      const searchResults = await searchService.searchWeb(query, 10);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        setErrorMessage('No results found for your search.');
      } else {
        // Ensure we can see results by scrolling down slightly
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    } catch (error) {
      console.error("Search error:", error);
      setErrorMessage('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="doogle-main">
      <div className="doogle-header">
        <h1>Doogle</h1>
        <div className="doogle-description">
          <p>Search engine</p>
        </div>
      </div>
      
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web..."
            className="search-input"
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      <div className="search-results" ref={resultsRef}>
        {isSearching ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Searching...</p>
          </div>
        ) : errorMessage ? (
          <div className="error-message">{errorMessage}</div>
        ) : results.length > 0 ? (
          <>
            <h2 className="results-count">{results.length} results found</h2>
            <div className="results-list">
              {results.map((result, index) => (
                <div className="result-item" key={index}>
                  <h2 className="result-title">
                    <a href={result.link} target="_blank" rel="noopener noreferrer">
                      {result.title}
                    </a>
                  </h2>
                  <div className="result-url">{result.displayLink}</div>
                  <p className="result-snippet">{result.snippet}</p>
                </div>
              ))}
              <div style={{ height: '100px' }}></div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Enter a search term above to find information on the web.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Doogle;