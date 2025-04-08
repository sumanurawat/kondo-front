import axios from 'axios';

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
      
      // Use the server proxy instead of direct calls
      const response = await axios.post('http://localhost:5000/api/crawl', { url });
      
      if (response.data && response.data.content) {
        return response.data.content;
      }
      
      return null;
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
        // Check if the URL is likely to have CORS issues (most sites do)
        const content = await extractContentFromUrl(result.link);
        
        if (content) {
          enhancedResults.push({
            ...result,
            fullContent: content
          });
        } else {
          // If content extraction failed, still include the result with just the snippet
          enhancedResults.push({
            ...result,
            fullContent: `${result.snippet} (Full content unavailable due to website restrictions)`
          });
        }
      } catch (error) {
        console.error(`Error processing ${result.link}:`, error.message);
        // Still add the result using just the snippet
        enhancedResults.push({
          ...result,
          fullContent: `${result.snippet} (Full content unavailable: ${error.message})`
        });
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
    formatCitations,
    createSearchContext // Add this to return object
  };
};

/**
 * Helper to create a context string from search results for an LLM prompt
 * @param {Array} enhancedResults - Search results with full content
 * @returns {String} Formatted context string
 */
export const createSearchContext = (enhancedResults) => {
  // If no results with content, handle gracefully
  if (!enhancedResults || enhancedResults.length === 0) {
    return "No search results were found for this query.";
  }
  
  let context = "Information from web search:\n\n";
  
  enhancedResults.forEach((result, index) => {
    context += `[Source ${index + 1}: ${result.source} (${result.link})]\n`;
    context += `Title: ${result.title}\n`;
    
    // Use whatever content we have - either full content or just the snippet
    const contentToUse = result.fullContent || result.snippet || "No content available";
    context += `Content: ${contentToUse.substring(0, 1500)}\n\n`;
  });
  
  context += "\nAnswer the user's question based on the information above. ";
  context += "If the information provided is insufficient to answer the question fully, acknowledge this limitation. ";
  context += "Include citations like [1], [2], etc. when referencing information from specific sources. ";
  context += "Include a 'Sources:' section at the end with numbered references and their URLs. ";
  context += "Make sure to format the sources list similar to this example:\n\n";
  context += "Sources:\n";
  
  enhancedResults.forEach((result, index) => {
    context += `[${index + 1}] ${result.title} - ${result.link}\n`;
  });
  
  return context;
};