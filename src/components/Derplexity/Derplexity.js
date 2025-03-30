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
        <p>Ask me anything...</p>
        <button onClick={handleClearChat} className="clear-chat-btn">Clear Chat</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index}
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                <p>{cleanMessageText(message.text)}</p>
                <span className="timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Derplexity;

// In the browser console:
localStorage.removeItem('derplexityMessages');