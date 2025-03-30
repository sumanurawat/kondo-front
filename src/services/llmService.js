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
    let formattedPrompt = "You are Derplexity, a helpful and concise assistant. Please answer the following:\n\n";
    
    // Include conversation history
    const recentMessages = messages.slice(-5); // Include more context for Gemini
    
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
    
    // Check for empty or problematic responses
    if (!response || response.length < 3) {
      return "I'm sorry, but I couldn't generate a response.";
    }
    
    let processedResponse = response.trim();
    
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
    
    // Final cleanup
    processedResponse = processedResponse.replace(/\s+/g, " ").trim();
    
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
      // Use one of the models available in your API key
      const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
      
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
          maxOutputTokens: 1024,
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

  return {
    /**
     * Get the chat history from local storage
     * @returns {Array} Message history
     */
    getChatHistory: () => LocalStorageManager.getChatHistory(),
    
    /**
     * Clear the chat history
     */
    clearChatHistory: () => LocalStorageManager.clearChatHistory(),
    
    /**
     * Save the chat history to local storage
     * @param {Array} messages - Updated message history
     */
    saveChatHistory: (messages) => LocalStorageManager.saveMessageToLocalStorage(messages),
    
    /**
     * Send a message to the LLM and get a response
     * @param {String} userMessage - User's message
     * @param {Array} messageHistory - Complete message history
     * @returns {Promise<Object>} Bot's response object
     */
    sendMessage: async (userMessage, messageHistory = []) => {
      try {
        // Select which messages to include based on token limits
        const includedMessages = selectMessagesForContext(messageHistory, userMessage);
        
        // Format the prompt with selected messages
        const prompt = formatPrompt(includedMessages, userMessage);
        
        // Log helpful information for debugging
        console.log(`Sending message with ${includedMessages.length} context messages`);
        
        // Send to LLM API
        const data = await sendToLLM(prompt);
        
        // Process and clean up the response
        const cleanedResponse = processResponse(data.response);
        
        // Return the formatted bot response
        return {
          text: cleanedResponse,
          sender: 'bot',
          timestamp: new Date().getTime(),
          metadata: {
            model: data.model,
            apiTimestamp: data.timestamp
          }
        };
      } catch (error) {
        console.error("Error in sendMessage:", error);
        throw error;
      }
    }
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