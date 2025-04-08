import React, { useState, useEffect, useRef } from 'react';
import './Derplexity.css';
import { createLLMChatService, createLLMService } from '../../services/llmService';
import { createSearchService } from '../../services/searchService';
import { marked } from 'marked';
import { createFileProcessingService } from '../../services/fileProcessingService';
import { useNavigate } from 'react-router-dom';

// Configure marked for security
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
});

function Derplexity() {
  const navigate = useNavigate();
  
  // Create service instances
  const chatService = useRef(createLLMChatService()).current;
  const fileService = useRef(createFileProcessingService()).current;
  const searchService = useRef(createSearchService()).current;
  const llmService = useRef(createLLMService()).current; // Now properly imported
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [expandedFiles, setExpandedFiles] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeFilePreview, setActiveFilePreview] = useState(null);

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    const history = chatService.getChatHistory();
    if (history && history.length > 0) {
      setMessages(history);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
    // Save updated messages to localStorage
    chatService.saveChatHistory(messages);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply dark theme based on system preference
    document.documentElement.classList.toggle('dark-theme', prefersDarkMode);
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      document.documentElement.classList.toggle('dark-theme', e.matches);
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle input changes
  // Remove this function if not used
  // const handleInputChange = (e) => {
  //   setInput(e.target.value);
  // };
  
  // OR use it directly in your input onChange handler:
  // onChange={(e) => setInput(e.target.value)}

  // Send message when Enter key is pressed
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Use a unique ID generator for files
  const generateFileId = () => `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsProcessingFile(true);
    setUploadStatus(`Processing ${files.length > 1 ? `${files.length} files` : files[0].name}...`);
    
    try {
      // Process each file sequentially
      for (const file of files) {
        // Animated loading text for reading phase
        setUploadStatus(`Reading ${file.name}...`);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Animated analyzing phase with ellipsis animation
        let dots = 0;
        const analyzingInterval = setInterval(() => {
          dots = (dots + 1) % 4;
          const ellipsis = '.'.repeat(dots);
          setUploadStatus(`Analyzing text${ellipsis.padEnd(3, ' ')}`);
        }, 300);
        
        try {
          // Extract text using the file service
          const extractedText = await fileService.extractTextFromFile(file);
          
          // Clear the animation interval
          clearInterval(analyzingInterval);
          
          // Create a new file object
          const fileId = generateFileId();
          const fileObject = {
            id: fileId,
            name: file.name,
            type: file.type,
            text: extractedText,
            timestamp: Date.now()
          };
          
          // Add to uploaded files
          setUploadedFiles(prev => [...prev, fileObject]);
        } catch (error) {
          clearInterval(analyzingInterval);
          throw error;
        }
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Set status for user to add context
      const fileCount = files.length;
      setUploadStatus(`${fileCount} ${fileCount > 1 ? 'files' : 'file'} ready. Add context...`);
      
      // Highlight the text input to prompt user action
      setTimeout(() => {
        const inputEl = document.querySelector('.chat-input-container input');
        inputEl.focus();
      }, 300);
      
    } catch (error) {
      console.error("Error processing file:", error);
      setMessages(prev => [...prev, {
        text: `Error processing file: ${error.message}`,
        sender: 'bot',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Show file preview
  const showFilePreview = (fileId) => {
    setActiveFilePreview(fileId);
  };

  // Toggle file expansion in chat
  const toggleFileExpansion = (fileId) => {
    setExpandedFiles(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  // Remove a file before sending
  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    if (uploadedFiles.length <= 1) {
      setUploadStatus('');
    }
  };

  // Clear all uploaded files
  const clearUploadedFiles = () => {
    setUploadedFiles([]);
    setUploadStatus('');
    setActiveFilePreview(null);
  };

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Require text input
    if (input.trim() === '') {
      // Animate input to indicate text is required
      const inputEl = document.querySelector('.chat-input-container input');
      inputEl.classList.add('shake-animation');
      setTimeout(() => inputEl.classList.remove('shake-animation'), 500);
      return;
    }

    let updatedMessages = [...messages];
    
    // First add any pending uploaded files to messages
    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        const fileMessage = {
          id: file.id,
          text: file.text,
          sender: 'user',
          isFileContent: true,
          fileName: file.name,
          fileType: file.type,
          timestamp: file.timestamp
        };
        updatedMessages.push(fileMessage);
      }
    }
    
    // Add the user text message
    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: Date.now(),
      relatedFiles: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.id) : []
    };
    
    updatedMessages.push(userMessage);
    
    // Update UI
    setMessages(updatedMessages);
    setInput('');
    setUploadStatus('');
    setUploadedFiles([]);
    setActiveFilePreview(null);
    setIsLoading(true);

    try {
      // Always try to enhance with web search when appropriate - no visual indication to user
      let searchContext = '';
      try {
        // Generate a better search query based on conversation context
        const searchQuery = await generateSearchQuery(input, messages);
        
        // Search using the optimized query
        const searchResults = await searchService.searchWeb(searchQuery, 5);
        if (searchResults && searchResults.length > 0) {
          const resultsWithContent = await searchService.getContentForResults(searchResults, 3);
          searchContext = searchService.createSearchContext(resultsWithContent);
        }
      } catch (searchError) {
        console.error("Silent search error:", searchError);
        // Continue without search results
      }
      
      // Always use sendMessageWithContext even if searchContext is empty
      // This ensures consistent response formatting
      const botResponse = await chatService.sendMessageWithContext(input, updatedMessages.slice(0, -1), searchContext);
      
      setMessages([...updatedMessages, botResponse]);
    } catch (error) {
      console.error("Error in chat flow:", error);
      setMessages([...updatedMessages, { 
        text: "Sorry, I couldn't process your request. Please try again later.", 
        sender: 'bot', 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clearing the chat
  const handleClearChat = () => {
    setMessages([]);
    chatService.clearChatHistory();
  };
  
  // Format message text with links and code blocks
  const formatMessageText = (text) => {
    // Sanitize the text to prevent XSS attacks
    const sanitizedText = text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Parse markdown
    let htmlText = marked.parse(sanitizedText);
    
    // Add target="_blank" to all links for security
    htmlText = htmlText.replace(
      /<a href="([^"]+)">/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">'
    );
    
    return htmlText;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Add file attachment button click handler
  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  // Add this function to handle going back
  const handleBack = () => {
    navigate(-1);
  };

  // Add this function to generate better search queries from conversation context

  const generateSearchQuery = async (userInput, conversationHistory) => {
    // If the input is already search-friendly, use it directly
    if (shouldUseWebSearch(userInput)) {
      return userInput;
    }
    
    // Otherwise, generate a search query from the conversation
    try {
      const context = conversationHistory.slice(-3).map(msg => {
        return `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
      }).join('\n\n');
      
      const searchQueryPrompt = `
Based on this conversation, generate a specific, concise search query (maximum 10 words) that would find the most relevant information to help answer the latest user message:

${context}

User: ${userInput}

Search query to use:`;

      const searchQuery = await llmService.sendToLLM(searchQueryPrompt);
      return searchQuery.replace(/^"(.+)"$/, '$1'); // Remove quotes if present
    } catch (error) {
      console.error("Error generating search query:", error);
      // Fall back to original input
      return userInput;
    }
  };

  const shouldUseWebSearch = (query) => {
    // Skip web search for very short queries
    if (query.trim().length < 8) return false;
    
    // Skip web search for personal questions or conversation starters
    const personalPrefixes = [
      'how are you',
      'what do you think',
      'do you like',
      'can you help',
      'please help',
      'could you',
      'would you',
      'hello',
      'hi ',
      'hey',
      'thanks',
      'thank you'
    ];
    
    const lowercaseQuery = query.toLowerCase();
    if (personalPrefixes.some(prefix => lowercaseQuery.startsWith(prefix))) {
      return false;
    }
    
    // Use web search for information-seeking queries
    const informationPrefixes = [
      'what is',
      'who is',
      'where is',
      'when was',
      'why is',
      'how does',
      'how do',
      'how to',
      'define',
      'explain',
      'tell me about',
      'information on',
      'history of'
    ];
    
    if (informationPrefixes.some(prefix => lowercaseQuery.startsWith(prefix))) {
      return true;
    }
    
    // Check for question words anywhere (might be information-seeking)
    const questionWords = ['what', 'who', 'where', 'when', 'why', 'how'];
    if (questionWords.some(word => lowercaseQuery.includes(` ${word} `))) {
      return true;
    }
    
    // Default to using web search for longer queries
    return query.trim().length > 15;
  };

  return (
    <div className="derplexity-container">
      <div className="chat-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBack} title="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1>Derplexity</h1>
        </div>
        
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
          messages.map((msg, index) => {
            // Generate a stable ID if one doesn't exist
            const msgId = msg.id || `msg-${index}`;
            
            return (
              <div
                key={msgId}
                className={`message ${
                  msg.sender === 'user' 
                    ? 'user-message' 
                    : 'bot-message'
                } ${msg.isFileContent ? 'file-message' : ''}`}
              >
                <div className={`message-content ${msg.isFileContent ? 'file-content-message' : ''}`}>
                  {msg.isFileContent ? (
                    <div className="file-content">
                      <div 
                        className={`file-header ${expandedFiles[msgId] ? 'expanded' : ''}`}
                        onClick={() => toggleFileExpansion(msgId)}
                      >
                        <div className="file-header-main">
                          <div className="file-icon">
                            {msg.fileType?.includes('pdf') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                              </svg>
                            ) : msg.fileType?.includes('image') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                              </svg>
                            )}
                          </div>
                          <div className="file-details">
                            <span className="file-name">{msg.fileName}</span>
                            <span className="file-meta">Document</span>
                          </div>
                        </div>
                        <div className="expand-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </div>
                      
                      <div className={`file-text ${expandedFiles[msgId] ? 'show' : ''}`}>
                        <div dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }} />
                      </div>
                    </div>
                  ) : msg.sender === 'bot' ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }} />
                  ) : (
                    <div>{msg.text}</div>
                  )}
                  <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                </div>
              </div>
            );
          })
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
        {uploadedFiles.length > 0 && (
          <div className="file-previews-container">
            <div className="file-previews">
              {uploadedFiles.map(file => (
                <div 
                  key={file.id} 
                  className={`file-preview ${activeFilePreview === file.id ? 'active' : ''}`}
                  onClick={() => showFilePreview(file.id)}
                >
                  <div className="file-preview-icon">
                    {file.type.includes('pdf') ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    ) : file.type.includes('image') ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    )}
                  </div>
                  <span className="file-preview-name">{file.name}</span>
                  <button 
                    className="remove-file-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUploadedFile(file.id);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {activeFilePreview && (
              <div className="file-content-preview">
                <div className="file-content-preview-header">
                  <h3>{uploadedFiles.find(f => f.id === activeFilePreview)?.name}</h3>
                  <button className="close-preview-btn" onClick={() => setActiveFilePreview(null)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="file-content-preview-body">
                  {uploadedFiles.find(f => f.id === activeFilePreview)?.text.substring(0, 500)}
                  {uploadedFiles.find(f => f.id === activeFilePreview)?.text.length > 500 ? '...' : ''}
                </div>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="file-actions">
                <button className="clear-files-btn" onClick={clearUploadedFiles}>
                  Clear all files
                </button>
              </div>
            )}
          </div>
        )}

        {/* Input wrapper */}
        <div className="input-wrapper" data-status={isProcessingFile ? uploadStatus : ''}>
          <button 
            className={`attachment-btn ${uploadedFiles.length > 0 ? 'files-attached' : ''}`}
            onClick={handleAttachmentClick}
            disabled={isLoading || isProcessingFile}
            title="Upload document or image"
          >
            {uploadedFiles.length > 0 ? (
              <div className="file-count-badge">{uploadedFiles.length}</div>
            ) : null}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>
          
          <input
            type="text"
            placeholder={
              isProcessingFile 
                ? uploadStatus 
                : uploadedFiles.length > 0 
                  ? `Add context about ${uploadedFiles.length > 1 ? 'these files' : uploadedFiles[0].name}...` 
                  : "Ask me anything..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || isProcessingFile}
            className={uploadStatus || uploadedFiles.length > 0 ? 'with-status' : ''}
          />
          
          <button 
            onClick={handleSendMessage} 
            disabled={input.trim() === '' || isLoading || isProcessingFile}
          >
            {isLoading || isProcessingFile ? (
              'Processing...'
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
          
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            accept=".pdf,.png,.jpg,.jpeg"
            multiple
          />
        </div>
      </div>
    </div>
  );
}

export default Derplexity;