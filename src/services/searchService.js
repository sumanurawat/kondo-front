import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Search service for fetching and processing web search results
 */
export const createSearchService = () => {
  const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const GOOGLE_CSE_ID = process.env.REACT_APP_GOOGLE_CSE_ID;
  
  /**
   * Search the web using Google Custom Search API
   * @param {String} query - User's search query
   * @param {Number} numResults - Number of results to return (max 10)
   * @returns {Promise<Array>} Array of search results
   */
  const searchWeb = async (query, numResults = 5) => {
    try {
      console.log(`Searching for: "${query}"`);
      
      const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1`,
        {
          params: {
            key: GOOGLE_API_KEY,
            cx: GOOGLE_CSE_ID,
            q: query,
            num: Math.min(numResults, 10) // Google CSE allows max 10 results per query
          }
        }
      );
      
      if (!response.data.items || response.data.items.length === 0) {
        console.log("No search results found");
        return [];
      }
      
      console.log(`Found ${response.data.items.length} search results`);
      
      return response.data.items.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        source: new URL(item.link).hostname,
        displayLink: item.displayLink
      }));
    } catch (error) {
      console.error("Error searching the web:", error.message);
      return [];
    }
  };
  
  /**
   * Fetch and extract content from a URL
   * @param {String} url - URL to extract content from
   * @returns {Promise<String|null>} Extracted content or null on error
   */
  const extractContentFromUrl = async (url) => {
    try {
      console.log(`Extracting content from: ${url}`);
      
      // Add a timeout to prevent hanging on slow responses
      const response = await axios.get(url, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Remove scripts, styles, etc.
      $('script, style, nav, footer, header, aside, iframe, noscript').remove();
      
      // Get main content - try to find actual content containers first
      let content = '';
      
      // Try to find the main content container
      const possibleContentSelectors = [
        'main', 'article', '.article', '.post', '.content', 
        '#content', '.post-content', '.entry-content', 
        '[role="main"]', '.main-content'
      ];
      
      for (const selector of possibleContentSelectors) {
        if ($(selector).length > 0) {
          content = $(selector).text();
          break;
        }
      }
      
      // If no content found, fall back to body
      if (!content.trim()) {
        content = $('body').text();
      }
      
      // Clean and return content
      return content
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000); // Limit content length
    } catch (error) {
      console.error(`Error extracting content from ${url}:`, error.message);
      return null;
    }
  };
  
  /**
   * Get full content for multiple search results
   * @param {Array} searchResults - Array of search results
   * @param {Number} maxResults - Maximum number of results to get content for
   * @returns {Promise<Array>} Enhanced search results with full content
   */
  const getContentForResults = async (searchResults, maxResults = 3) => {
    const resultsToProcess = searchResults.slice(0, maxResults);
    const enhancedResults = [];
    
    for (const result of resultsToProcess) {
      try {
        const content = await extractContentFromUrl(result.link);
        if (content) {
          enhancedResults.push({
            ...result,
            fullContent: content
          });
        }
      } catch (error) {
        console.error(`Error processing ${result.link}:`, error.message);
      }
    }
    
    return enhancedResults;
  };
  
  /**
   * Search and extract content in a single operation
   * @param {String} query - User's search query
   * @param {Number} numResults - Number of results to process
   * @returns {Promise<Object>} Search results and enhanced content
   */
  const searchAndExtract = async (query, numResults = 3) => {
    const searchResults = await searchWeb(query);
    const resultsWithContent = await getContentForResults(searchResults, numResults);
    
    return {
      originalResults: searchResults,
      enhancedResults: resultsWithContent
    };
  };
  
  /**
   * Format results for citation in the UI
   * @param {Array} enhancedResults - Search results with full content
   * @returns {Array} Formatted citations
   */
  const formatCitations = (enhancedResults) => {
    return enhancedResults.map((result, index) => ({
      id: index + 1,
      title: result.title,
      url: result.link,
      source: result.source,
      snippet: result.snippet
    }));
  };

  return {
    searchWeb,
    extractContentFromUrl,
    getContentForResults,
    searchAndExtract,
    formatCitations
  };
};

/**
 * Helper to create a context string from search results for an LLM prompt
 * @param {Array} enhancedResults - Search results with full content
 * @returns {String} Formatted context string
 */
export const createSearchContext = (enhancedResults) => {
  let context = "Information from web search:\n\n";
  
  enhancedResults.forEach((result, index) => {
    context += `[Source ${index + 1}: ${result.source} (${result.link})]\n`;
    context += `Title: ${result.title}\n`;
    context += `Content: ${result.fullContent ? result.fullContent.substring(0, 2000) : result.snippet}\n\n`;
  });
  
  context += "\nAnswer the user's question based on the information above. ";
  context += "Include citations like [1], [2], etc. when referencing information from specific sources. ";
  context += "Include a 'Sources:' section at the end with numbered references and their URLs.";
  
  return context;
};