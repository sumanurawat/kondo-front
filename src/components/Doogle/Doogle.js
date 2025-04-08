import React, { useState, useRef, useEffect } from 'react';
import { createSearchService } from '../../services/searchService';
import { createLLMService } from '../../services/llmService';
import './Doogle.css';

function Doogle() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  
  const searchService = useRef(createSearchService()).current;
  const llmService = useRef(createLLMService()).current;
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
    setAiSummary('');
    setSummaryError('');
    
    try {
      // Get search results
      const searchResults = await searchService.searchWeb(query, 10);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        setErrorMessage('No results found for your search.');
        return;
      } else {
        // Ensure we can see results by scrolling down slightly
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
      
      // Generate AI summary if we have results
      if (searchResults.length > 0) {
        generateAiSummary(searchResults, query);
      }
      
    } catch (error) {
      console.error("Search error:", error);
      setErrorMessage('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const generateAiSummary = async (searchResults, searchQuery) => {
    setIsGeneratingSummary(true);
    
    try {
      // Get content for each search result (limit to 3 for performance)
      const resultsWithContent = await searchService.getContentForResults(searchResults, 3);
      
      // Create context for the LLM
      const context = searchService.createSearchContext(resultsWithContent);
      
      // Format prompt for the AI
      const prompt = `
Search query: "${searchQuery}"

${context}

Please summarize the available information about this search query based on the search results provided. 
If the search results don't contain sufficient information, mention this and summarize whatever is available.
Keep your summary concise (around 200-300 words).
`;
      
      // Send to LLM and get response
      const response = await llmService.sendToLLM(prompt);
      
      // Check if the response contains unhelpful messages about lack of info
      if (response.includes("no information provided") || 
          response.includes("cannot answer") || 
          response.includes("cannot summarize")) {
        
        // Regenerate with a simpler prompt using just snippets
        const snippetContext = searchResults
          .map((result, i) => `[${i+1}] ${result.title}\n${result.snippet}`)
          .join('\n\n');
          
        const backupPrompt = `
Search query: "${searchQuery}"
Search result snippets:
${snippetContext}

Please provide a brief summary of what these search results tell us about the query. Focus on the information provided in the snippets.
`;
        
        const backupResponse = await llmService.sendToLLM(backupPrompt);
        setAiSummary(backupResponse);
      } else {
        setAiSummary(response);
      }
    } catch (error) {
      console.error("AI Summary error:", error);
      setSummaryError("Couldn't generate AI summary for these results.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="doogle-container">
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
        
        <div className="search-content">
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
          
          {(results.length > 0 || isGeneratingSummary) && (
            <div className="ai-summary-panel">
              <div className="ai-summary-header">
                <h2>AI Summary</h2>
                {isGeneratingSummary && (
                  <div className="summary-indicator">
                    <div className="spinner small"></div>
                    <span>Analyzing results...</span>
                  </div>
                )}
              </div>
              
              <div className="ai-summary-content">
                {summaryError ? (
                  <div className="summary-error">{summaryError}</div>
                ) : aiSummary ? (
                  <div className="summary-text">{aiSummary}</div>
                ) : isGeneratingSummary ? (
                  <div className="summary-placeholder">
                    <p>Crawling through search results to generate a comprehensive summary...</p>
                    <p>This may take a moment as we analyze multiple sources.</p>
                  </div>
                ) : (
                  <div className="summary-empty">
                    <p>AI summary will appear here after search.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Doogle;