import axios from 'axios';

/**
 * News service for fetching and processing news articles
 */
export const createNewsService = () => {
  // Free news APIs - choose one to implement
  // Using NewsAPI.org - requires free signup at newsapi.org
  const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;
  
  /**
   * Search for news articles
   * @param {String} query - Search query
   * @param {Number} count - Number of articles to fetch
   * @returns {Promise<Array>} News articles
   */
  const searchNews = async (query, count = 10) => {
    try {
      console.log(`🗞️ [NewsAPI] Fetching news for: "${query}" (requesting ${count} articles)`);
      
      const response = await axios.get(
        `https://newsapi.org/v2/everything`,
        {
          params: {
            q: query,
            apiKey: NEWS_API_KEY,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: count
          }
        }
      );
      
      if (!response.data.articles || response.data.articles.length === 0) {
        console.log("🗞️ [NewsAPI] No articles found for query");
        return [];
      }
      
      console.log(`🗞️ [NewsAPI] Found ${response.data.articles.length} news articles`);
      console.log(`🗞️ [NewsAPI] Sample sources: ${response.data.articles.slice(0, 3).map(a => a.source.name).join(', ')}...`);
      
      const articles = response.data.articles.map(article => ({
        title: article.title,
        link: article.url,
        source: article.source.name,
        author: article.author,
        description: article.description,
        content: article.content,
        publishedAt: new Date(article.publishedAt).toLocaleDateString(),
        urlToImage: article.urlToImage
      }));
      
      console.log(`🗞️ [NewsAPI] Successfully processed ${articles.length} articles`);
      return articles;
    } catch (error) {
      console.error("🗞️ [NewsAPI] Error:", error.response?.status || error.message);
      if (error.response?.data) {
        console.error("🗞️ [NewsAPI] Error details:", error.response.data);
      }
      return [];
    }
  };
  
  /**
   * Create context from news articles for LLM prompt
   * @param {Array} newsArticles - News articles
   * @returns {String} Context string for LLM
   */
  const createNewsContext = (newsArticles) => {
    if (!newsArticles || newsArticles.length === 0) {
      return "No news articles were found for this query.";
    }
    
    let context = "Information from recent news articles:\n\n";
    
    newsArticles.forEach((article, index) => {
      context += `[Source ${index + 1}: ${article.source} - ${article.publishedAt}]\n`;
      context += `Title: ${article.title}\n`;
      context += `Description: ${article.description || "No description available"}\n`;
      context += `Content: ${article.content || article.description || "No content available"}\n\n`;
    });
    
    context += "\nSummarize these news articles, highlighting key information, major developments, and relevant context. ";
    context += "If articles contain conflicting information or perspectives, note this. ";
    context += "Include citations like [1], [2], etc. when referencing specific articles. ";
    context += "Include a 'Sources:' section at the end listing all cited news sources.\n\n";
    context += "Sources:\n";
    
    newsArticles.forEach((article, index) => {
      context += `[${index + 1}] ${article.title} - ${article.source} (${article.link})\n`;
    });
    
    return context;
  };

  return {
    searchNews,
    createNewsContext
  };
};