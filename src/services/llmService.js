/**
 * LLM Service
 * Handles chat conversations with Cloud Run LLM API
 */

// Simple token counting (rough approximation)
function estimateTokens(text) {
  // ~1 token per ~4 characters for English text
  return Math.ceil(text.length / 4);
}

// Local Storage Management Functions
const LocalStorageManager = {
  getChatHistory: () => {
    try {
      const history = localStorage.getItem('derplexityMessages');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error("Error retrieving chat history from localStorage:", error);
      return [];
    }
  },

  saveMessageToLocalStorage: (messages) => {
    try {
      localStorage.setItem('derplexityMessages', JSON.stringify(messages));
      return true;
    } catch (error) {
      console.error("Error saving messages to localStorage:", error);
      return false;
    }
  },

  clearChatHistory: () => {
    localStorage.removeItem('derplexityMessages');
  }
};

/**
 * Create an LLM Chat Service instance
 * @returns {Object} Chat service with methods for interacting with LLM
 */
export const createLLMChatService = () => {
  // Configuration
  const MAX_TOKENS = 3000;
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1000;

  /**
   * Format messages for the LLM API
   * @param {Array} messages - List of message objects
   * @param {String} currentUserMessage - Current user input
   * @returns {String} Formatted prompt for LLM
   */
  const formatPrompt = (messages, currentUserMessage) => {
    let formattedPrompt = `You are Derplexity, an AI assistant focused on delivering comprehensive, detailed, and accurate information.

Follow these guidelines for your responses:
1. Provide thorough explanations with complete context and relevant details
2. Structure your answers with clear sections and formatting when appropriate
3. Present multiple perspectives on complex or debated topics
4. Cite your reasoning process and explain how you arrived at conclusions
5. When uncertain, acknowledge limitations in your knowledge
6. Match your tone to the complexity and formality of the question
7. Use lists, comparisons, and examples to illustrate concepts
8. For technical questions, provide step-by-step explanations

Your goal is to help users gain deeper understanding, not just quick answers.

Conversation history:\n\n`;
    
    // Include conversation history
    const recentMessages = messages.slice(-5); // Include recent context
    
    recentMessages.forEach(msg => {
      const role = msg.sender === 'user' ? 'User' : 'Assistant';
      formattedPrompt += `${role}: ${msg.text}\n\n`;
    });
    
    // Add the current user message
    formattedPrompt += `User: ${currentUserMessage}\n\nAssistant:`;
    
    return formattedPrompt;
  };

  /**
   * Format prompt for the LLM with web search context
   * @param {Array} messages - List of message objects
   * @param {String} currentUserMessage - Current user input
   * @param {String} webSearchContext - Context from web search
   * @returns {String} Formatted prompt for LLM
   */
  const formatPromptWithContext = (messages, currentUserMessage, webSearchContext) => {
    let formattedPrompt = `You are Derplexity, an AI assistant focused on delivering comprehensive, detailed, and accurate information.

Follow these guidelines for your responses:
1. Provide thorough explanations with complete context and relevant details
2. Structure your answers with clear sections and formatting when appropriate
3. Present multiple perspectives on complex or debated topics
4. Cite your reasoning process and explain how you arrived at conclusions
5. Be confident - don't use phrases like "without additional information" or "I can only offer general observations"
6. Match your tone to the complexity and formality of the question
7. Use lists, comparisons, and examples to illustrate concepts
8. For technical questions, provide step-by-step explanations

Your goal is to help users gain deeper understanding without drawing attention to any limitations in your available information.
`;

    // Add web search context if available
    if (webSearchContext && webSearchContext.trim()) {
      formattedPrompt += `\n\nThe following information from web searches may be relevant to the question:\n${webSearchContext}\n`;
      formattedPrompt += `\nIncorporate this information naturally in your answers to provide the most accurate and helpful response. Never explicitly mention that you used search results. Always maintain a conversational tone.\n\n`;
    } else {
      formattedPrompt += `\n\nIf you're uncertain about any facts, respond based on your best understanding without hedging or mentioning that you lack information. Present your knowledge confidently.\n\n`;
    }

    formattedPrompt += `Conversation history:\n\n`;
    
    // Include conversation history
    const recentMessages = messages.slice(-5); // Include recent context
    
    recentMessages.forEach(msg => {
      const role = msg.sender === 'user' ? 'User' : 'Assistant';
      formattedPrompt += `${role}: ${msg.text}\n\n`;
    });
    
    // Add the current user message
    formattedPrompt += `User: ${currentUserMessage}\n\nAssistant:`;
    
    return formattedPrompt;
  };

  /**
   * Select which messages to include based on token limits
   * @param {Array} messageHistory - Complete message history
   * @param {String} userInput - Current user input
   * @returns {Array} Selected messages to include in context
   */
  const selectMessagesForContext = (messageHistory, userInput) => {
    // Start with system message token estimation
    let estimatedTokens = estimateTokens(
      "You are a helpful AI assistant named Derplexity. Answer the user's questions directly and concisely."
    );
    
    // Always include the current query
    estimatedTokens += estimateTokens(userInput) + 10; // +10 for the formatting
    
    // Process messages from newest to oldest until token limit
    const reversedHistory = [...messageHistory].reverse();
    let includedMessages = [];
    
    // Include history until we reach token limit
    for (const msg of reversedHistory) {
      const msgTokens = estimateTokens(msg.text) + 10; // +10 for role labels
      if (estimatedTokens + msgTokens <= MAX_TOKENS) {
        includedMessages.unshift(msg);
        estimatedTokens += msgTokens;
      } else {
        break;
      }
    }
    
    return includedMessages;
  };

  /**
   * Process the LLM response to clean up formatting
   * @param {String} response - Raw LLM response
   * @returns {String} Cleaned response
   */
  const processResponse = (response) => {
    console.log("==== DEBUG: BEFORE PROCESSING ====");
    console.log("Raw response:", response);
    
    // Extract text from object if needed
    if (typeof response === 'object' && response !== null) {
      if (response.text) {
        response = response.text;
      } else if (response.response) {
        response = response.response;
      } else if (response.candidates && response.candidates[0] && 
                response.candidates[0].content && 
                response.candidates[0].content.parts && 
                response.candidates[0].content.parts[0] && 
                response.candidates[0].content.parts[0].text) {
        response = response.candidates[0].content.parts[0].text;
      } else {
        return "I'm sorry, but I couldn't generate a response.";
      }
    }
    
    // Check for empty or problematic responses
    if (!response || typeof response !== 'string' || response.length < 3) {
      return "I'm sorry, but I couldn't generate a response.";
    }
    
    let processedResponse = response.trim();
    
    // Remove any meta-instructions like "let's delve into..." or "this is just an instruction..."
    processedResponse = processedResponse.replace(/^(Okay|OK|Let's|Let me|I'll|I will|This shouldn't|This should not).*?\./i, "");
    
    // Remove any [INST] or [/INST] tags
    processedResponse = processedResponse.replace(/\[INST\]|\[\/INST\]/g, "");
    
    // Handle case where API returns another user message
    if (processedResponse.includes("User:") || processedResponse.includes("user:")) {
      processedResponse = processedResponse.split(/User:|user:/)[0].trim();
    }
    
    // Remove any "Assistant:" prefixes
    processedResponse = processedResponse.replace(/^Assistant:\s*/i, "");
    
    // Remove any additional system-generated text
    if (processedResponse.includes("system")) {
      processedResponse = processedResponse.split("system")[0].trim();
    }
    
    // Check for truncation indicators
    const truncationPhrases = ["This covers", "In summary", "To summarize", "In conclusion"];
    
    for (const phrase of truncationPhrases) {
      if (processedResponse.endsWith(phrase) || 
          processedResponse.endsWith(phrase + ".") || 
          processedResponse.endsWith(phrase + ":")) {
        processedResponse = processedResponse.substring(0, processedResponse.lastIndexOf(phrase));
        break;
      }
    }
    
    // If there's any unfinished sentence at the end
    const lastChar = processedResponse.trim().slice(-1);
    if (!['.', '!', '?', ':', ';'].includes(lastChar)) {
      // Try to find the last complete sentence
      const sentenceMatch = processedResponse.match(/.*?[.!?](?=\s|$)/g);
      if (sentenceMatch && sentenceMatch.length > 0) {
        processedResponse = sentenceMatch.join(' ');
      }
    }
    
    // Final cleanup
    processedResponse = processedResponse.trim();
    
    // Provide a fallback if we end up with an empty string
    if (!processedResponse) {
      processedResponse = "I apologize, but I'm having trouble responding right now.";
    }
    
    console.log("==== DEBUG: AFTER PROCESSING ====");
    console.log("Processed response:", processedResponse);
    
    return processedResponse;
  };

  /**
   * Send a message to the Gemini API with retry logic
   * @param {String} prompt - Formatted prompt to send
   * @param {Number} retryCount - Current retry attempt (internal)
   * @returns {Promise<Object>} Response from the API
   */
  const sendToLLM = async (prompt, retryCount = 0) => {
    try {
      // Use Gemini 2.5 Pro
      const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent";
      
      const payload = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3200,  // Doubled from 1600 to 3200
          topP: 0.95,
          topK: 40
        }
      };
      
      // DEBUG: Log the API URL and request details
      console.log("Making API call to Gemini:", apiUrl);
      console.log("Payload preview:", JSON.stringify(payload).slice(0, 200) + "...");
      
      const response = await fetch(`${apiUrl}?key=${process.env.REACT_APP_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      // Log the raw response status
      console.log("==== API RESPONSE STATUS ====");
      console.log("Status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
      }
      
      const responseData = await response.json();
      
      // DEBUG: Log the raw response from the API
      console.log("==== DEBUG: RAW RESPONSE ====");
      console.log(JSON.stringify(responseData, null, 2));
      
      // Extract the response text from Gemini's format - updated path
      if (responseData.candidates && 
          responseData.candidates[0] && 
          responseData.candidates[0].content && 
          responseData.candidates[0].content.parts && 
          responseData.candidates[0].content.parts[0]) {
        const responseText = responseData.candidates[0].content.parts[0].text;
        
        return {
          response: responseText,
          model: "gemini-pro",
          timestamp: new Date().toISOString()
        };
      } else {
        console.error("Unexpected response format:", responseData);
        throw new Error("Unexpected response format from Gemini API");
      }
    } catch (error) {
      // Implement retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`Retry attempt ${retryCount + 1} after error:`, error.message);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return sendToLLM(prompt, retryCount + 1);
      }
      
      console.error("Error sending message to Gemini:", error);
      throw error;
    }
  };

  /**
   * Send a message to the LLM and get a response
   * @param {String} message - User's message
   * @param {Array} messageHistory - Conversation history
   * @returns {Object} Message object with AI's response
   */
  const sendMessage = async (message, messageHistory = []) => {
    try {
      // Select which messages to include in the context
      const messagesForContext = selectMessagesForContext(messageHistory, message);
      
      // Format prompt without web search context
      const prompt = formatPrompt(messagesForContext, message);
      
      // Call LLM
      const response = await sendToLLM(prompt);
      
      // Process and return response - response is a string from sendToLLM, not an object with response property
      return {
        text: processResponse(response),
        sender: 'bot',
        timestamp: Date.now(),
        metadata: {
          model: "gemini-pro",
          apiTimestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Error in LLM service:", error);
      throw error;
    }
  };

  /**
   * Send a message to the LLM with additional web search context
   * @param {String} message - User's message
   * @param {Array} messageHistory - Conversation history
   * @param {String} webSearchContext - Context from web search results
   * @returns {Object} Message object with AI's response
   */
  const sendMessageWithContext = async (message, messageHistory, webSearchContext = '') => {
    try {
      // Select which messages to include in the context
      const messagesForContext = selectMessagesForContext(messageHistory, message);
      
      // Format prompt with search context
      const prompt = formatPromptWithContext(messagesForContext, message, webSearchContext);
      
      // Call LLM
      const response = await sendToLLM(prompt);
      
      // Process and return response - response is a string, not an object with response property
      return {
        text: processResponse(response),
        sender: 'bot',
        timestamp: Date.now(),
        metadata: {
          model: "gemini-pro",
          apiTimestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Error in LLM service:", error);
      throw error;
    }
  };

  return {
    sendMessage,
    sendMessageWithContext,
    getChatHistory: () => LocalStorageManager.getChatHistory(),
    saveChatHistory: (messages) => LocalStorageManager.saveMessageToLocalStorage(messages),
    clearChatHistory: () => LocalStorageManager.clearChatHistory()
  };
};

/**
 * Create a simplified LLM service for direct use
 */
export const createLLMService = () => {
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1000;
  
  /**
   * Send a prompt directly to the LLM and get a response
   * @param {String} prompt - The prompt to send
   * @returns {Promise<String>} The LLM response
   */
  const sendToLLM = async (prompt, retryCount = 0) => {
    try {
      // Use Gemini API
      const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent";
      
      const payload = {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 3200,  // Doubled from 1600 to 3200
        }
      };
      
      const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying LLM request (${retryCount + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return sendToLLM(prompt, retryCount + 1);
        }
        
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated');
      }
      
      let generatedText = '';
      
      // Extract text from the response
      data.candidates[0].content.parts.forEach(part => {
        if (part.text) {
          generatedText += part.text;
        }
      });
      
      return generatedText.trim();
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying after error (${retryCount + 1}/${MAX_RETRIES}): ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return sendToLLM(prompt, retryCount + 1);
      }
      
      console.error("Error sending message to Gemini:", error);
      throw error;
    }
  };
  
  return {
    sendToLLM
  };
};

// Export the storage functions for backward compatibility
export const getChatHistory = LocalStorageManager.getChatHistory;
export const saveMessageToLocalStorage = LocalStorageManager.saveMessageToLocalStorage;
export const clearChatHistory = LocalStorageManager.clearChatHistory;

// Legacy function for backward compatibility
export const getLLMResponse = async (userInput, messageHistory = []) => {
  const chatService = createLLMChatService();
  return chatService.sendMessage(userInput, messageHistory);
};