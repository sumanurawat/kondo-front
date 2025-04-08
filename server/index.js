const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

// Web crawling endpoint
app.post('/api/crawl', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }
  
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    $('script, style, nav, footer, header, aside, iframe, noscript').remove();
    
    // Try to find the main content container
    let content = '';
    const selectors = ['main', 'article', '.article', '.post', '.content', '#content', '[role="main"]'];
    
    for (const selector of selectors) {
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
    content = content.replace(/\s+/g, ' ').trim().substring(0, 8000);
    res.json({ content });
    
  } catch (error) {
    console.error('Error crawling:', error.message);
    res.status(500).json({ error: 'Failed to crawl URL', message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});