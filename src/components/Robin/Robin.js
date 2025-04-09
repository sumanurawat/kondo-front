import React, { useState, useRef, useEffect } from 'react';
import { createNewsService } from '../../services/newsService';
import { createLLMService } from '../../services/llmService';
import './Robin.css';

function Robin() {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  
  const newsService = useRef(createNewsService()).current;
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
      // Get news articles
      const newsResults = await newsService.searchNews(query, 8);
      setArticles(newsResults);
      
      if (newsResults.length === 0) {
        setErrorMessage('No news articles found for your search.');
        return;
      } else {
        // Ensure we can see results by scrolling down slightly
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
      
      // Generate AI summary if we have results
      if (newsResults.length > 0) {
        generateAiSummary(newsResults, query);
      }
      
    } catch (error) {
      console.error("News search error:", error);
      setErrorMessage('An error occurred while searching for news. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const generateAiSummary = async (newsResults, searchQuery) => {
    setIsGeneratingSummary(true);
    
    try {
      console.log(`🤖 [Robin] Creating news context from ${newsResults.length} articles`);
      const context = newsService.createNewsContext(newsResults);
      console.log(`🤖 [Robin] Context created (${context.length} chars)`);
      
      // Format prompt for the AI
      const prompt = `
Query: "${searchQuery}"

${context}

Provide a comprehensive news briefing based on these articles. Cover the main developments, key facts, 
and relevant context. Include multiple perspectives if present in the sources. Aim for about 250-350 words. 
Format your response with clear sections and include a "Sources" section at the end listing all cited sources.
`;
      
      console.log(`🤖 [Robin] Sending request to LLM (${prompt.length} chars)`);
      
      // Send to LLM and get response
      try {
        const response = await llmService.sendToLLM(prompt);
        console.log(`🤖 [Robin] Received LLM response (${response.length} chars)`);
        setAiSummary(response);
      } catch (llmError) {
        console.error("🤖 [Robin] LLM API error:", llmError.message);
        
        // Check if it's a quota error
        if (llmError.message.includes("quota") || llmError.message.includes("429")) {
          // Create a simple summary as fallback
          const fallbackSummary = createFallbackSummary(newsResults);
          console.log(`🤖 [Robin] Using fallback summary due to API limits`);
          setAiSummary(fallbackSummary);
        } else {
          throw llmError; // Re-throw for other types of errors
        }
      }
      
    } catch (error) {
      console.error("🗞️ [Robin] News summary error:", error.message, error.stack);
      setSummaryError(
        "Couldn't generate a complete news briefing. This may be due to API rate limits or connectivity issues. " +
        "You can still view all news articles below."
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const createFallbackSummary = (articles) => {
    const topArticles = articles.slice(0, 5);
    let summary = `# News Briefing\n\n`;
    
    summary += `Here are the top headlines about this topic:\n\n`;
    
    topArticles.forEach((article, index) => {
      summary += `## ${article.title}\n`;
      summary += `*Source: ${article.source}, ${article.publishedAt}*\n\n`;
      summary += `${article.description || 'No description available.'}\n\n`;
    });
    
    summary += `\n\n*Note: This is a simplified news summary as our AI summarization service has reached its quota limit.*\n\n`;
    
    summary += `\n## Sources:\n`;
    articles.forEach((article, index) => {
      summary += `[${index + 1}] ${article.title} - ${article.source} (${article.link})\n`;
    });
    
    return summary;
  };

  return (
    <div className="robin-container">
      <div className="robin-main">
        <div className="robin-header">
          <h1>Robin</h1>
          <div className="robin-description">
            <p>News reporter</p>
          </div>
        </div>
        
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for news..."
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
        
        <div className="news-content">
          <div className="news-results" ref={resultsRef}>
            {isSearching ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Searching for news...</p>
              </div>
            ) : errorMessage ? (
              <div className="error-message">{errorMessage}</div>
            ) : articles.length > 0 ? (
              <>
                <h2 className="results-count">{articles.length} news articles found</h2>
                
                {summaryError && (
                  <div className="info-banner">
                    <p>{summaryError}</p>
                  </div>
                )}
                
                <div className="news-grid">
                  {articles.map((article, index) => (
                    <div className="news-card" key={index}>
                      {article.urlToImage && (
                        <div className="news-image">
                          <img src={article.urlToImage} alt={article.title} />
                        </div>
                      )}
                      <div className="news-card-content">
                        <h3 className="news-title">
                          <a href={article.link} target="_blank" rel="noopener noreferrer">
                            {article.title}
                          </a>
                        </h3>
                        <div className="news-meta">
                          <span className="news-source">{article.source}</span>
                          <span className="news-date">{article.publishedAt}</span>
                        </div>
                        <p className="news-description">{article.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ height: '40px' }}></div>
              </>
            ) : (
              <div className="empty-state">
                <p>Enter a topic above to find the latest news.</p>
              </div>
            )}
          </div>
          
          {(articles.length > 0 && (isGeneratingSummary || aiSummary)) && (
            <div className="ai-summary-panel">
              <div className="ai-summary-header">
                <h2>News Briefing</h2>
                {isGeneratingSummary && (
                  <div className="summary-indicator">
                    <div className="spinner small"></div>
                    <span>Analyzing news articles...</span>
                  </div>
                )}
              </div>
              
              <div className="ai-summary-content">
                {summaryError ? (
                  <div className="summary-error">{summaryError}</div>
                ) : aiSummary ? (
                  <div className="summary-text">
                    <div className="robin-avatar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </div>
                    <div className="robin-summary">
                      {aiSummary}
                    </div>
                  </div>
                ) : isGeneratingSummary ? (
                  <div className="summary-placeholder">
                    <p>Analyzing news sources to create a comprehensive briefing...</p>
                    <p>This may take a moment as we examine different perspectives.</p>
                  </div>
                ) : (
                  <div className="summary-empty">
                    <p>AI news briefing will appear here after search.</p>
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

export default Robin;