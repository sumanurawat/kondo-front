import React, { useState, useEffect, useRef } from 'react';
import './Derplexity.css';
import { createLLMChatService } from '../../services/llmService';

function Derplexity() {
  // Create a chat service instance
  const chatService = useRef(createLLMChatService()).current;
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    const history = chatService.getChatHistory();
    if (history && history.length > 0) {
      setMessages(history);
    }
  }, [chatService]); // Add chatService as dependencytService]); // Add chatService as dependency

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
    // Save updated messages to localStorage
    chatService.saveChatHistory(messages);
  }, [messages, chatService]); // Add chatService as dependencyhatService]); // Add chatService as dependency

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Clear chat history
  const handleClearChat = () => {
    chatService.clearChatHistory();
    setMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // Add user message to chat
    const userMessage = { text: input, sender: 'user', timestamp: Date.now() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Get response from LLM via the chat service
      const botResponse = await chatService.sendMessage(input, messages);
      
      // Update UI with bot response
      setMessages([...updatedMessages, botResponse]);
    } catch (error) {
      console.error("Error in chat flow:", error);
      
      const errorMessage = { 
        text: "Sorry, I encountered an error processing your request.", 
        sender: 'bot', 
        timestamp: Date.now() 
      };
      
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const cleanMessageText = (text) => {
    return text
      .replace(/^User:\s*/i, '')
      .replace(/^Assistant:\s*/i, '')
      .trim();
  };

  return (
    <div className="derplexity-container">
      <div className="chat-header">
        <h1>Derplexity</h1>
        <div className="actions">
          {messages.length > 0 && (
            <button className="clear-chat-btn" onClick={handleClearChat}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Clear Chat
            </button>
          )}
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h2>Welcome to Derplexity</h2>
            <p>Ask me anything! I'm here to help answer your questions.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                {msg.sender === 'bot' ? (
                  <div dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }} />
                ) : (
                  msg.text
                )}
                <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message bot-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={input.trim() === '' || isLoading}>
            {isLoading ? (
              'Thinking...'
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Add this helper function for formatting messages with links and code
const formatMessageText = (text) => {
  // Convert URLs to links
  const urlPattern = /https?:\/\/[^\s]+/g;
  const textWithLinks = text.replace(urlPattern, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
  
  // Format code blocks
  const codePattern = /`([^`]+)`/g;
  const textWithCode = textWithLinks.replace(codePattern, (_, code) => {
    return `<code>${code}</code>`;
  });
  
  return textWithCode;
};

// Format timestamp
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default Derplexity;

// In the browser console:
localStorage.removeItem('derplexityMessages');