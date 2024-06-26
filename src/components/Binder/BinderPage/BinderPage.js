// components/Binder/BinderPage/BinderPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db } from 'firebase-config';
import { 
    doc, getDoc, collection, query, 
    where, getDocs, addDoc, serverTimestamp, 
    deleteDoc, updateDoc 
  } from 'firebase/firestore';
import './BinderPage.css'; 
import BinderSource from '../BinderSource/BinderSource';

function BinderPage() {
  const { binderId } = useParams();
  const [binder, setBinder] = useState(null);
  const [sources, setSources] = useState([]);
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceContent, setNewSourceContent] = useState('');
  const [activeSourceId, setActiveSourceId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(''); 

  // State to manage the view toggle
  const [showSources, setShowSources] = useState(false); 

  useEffect(() => {
    const fetchBinder = async () => {
      const binderRef = doc(db, 'binders', binderId);
      const binderSnap = await getDoc(binderRef);

      if (binderSnap.exists()) {
        setBinder(binderSnap.data());
      } else {
        console.log("Binder not found!");
      }
    };

    fetchBinder();
  }, [binderId]); 

  const fetchSources = useCallback(async () => {
    if (binderId) {
      const q = query(collection(db, 'binder_sources'), where('binder_id', '==', binderId));
      const querySnapshot = await getDocs(q);
      const sourceData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSources(sourceData);
    }
  }, [binderId]);

  useEffect(() => {
    fetchSources();
  }, [binderId, fetchSources]);

  const handleAddSourceClick = () => {
    setShowSourceForm(true);
  };

  const handleSourceTitleChange = (e) => {
    setNewSourceTitle(e.target.value);
  };

  const handleSourceContentChange = (e) => {
    setNewSourceContent(e.target.value);
  };

  const handleCreateNewSource = async () => {
    try {
      const sourceData = {
        title: newSourceTitle,
        content: newSourceContent,
        binder_id: binderId,
        creation_date: serverTimestamp(),
      };

      await addDoc(collection(db, 'binder_sources'), sourceData);
      fetchSources(); 
      setShowSourceForm(false);
      setNewSourceTitle('');
      setNewSourceContent('');
    } catch (error) {
      console.error("Error adding source:", error);
    }
  };

  const handleDeleteSource = async (sourceId) => {
    if (window.confirm("Are you sure you want to delete this source?")) {
      try {
        await deleteDoc(doc(db, 'binder_sources', sourceId));
        setSources(sources.filter(source => source.id !== sourceId));
      } catch (error) {
        console.error("Error deleting source:", error);
      }
    }
  };

  const handleEditSource = async (sourceId, updatedTitle, updatedContent) => {
    try {
      await updateDoc(doc(db, 'binder_sources', sourceId), {
        title: updatedTitle,
        content: updatedContent,
      });
      setSources(sources.map(source => 
        source.id === sourceId ? { ...source, title: updatedTitle, content: updatedContent } : source
      ));
    } catch (error) {
      console.error("Error updating source:", error);
    }
  };

  const handleSourceClick = (sourceId) => {
    setActiveSourceId(activeSourceId === sourceId ? null : sourceId);
  };

  const handleNewMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setChatMessages([
        ...chatMessages,
        { text: newMessage, timestamp: Date.now(), sender: 'user' }
      ]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleView = () => {
    setShowSources(!showSources);
  };

  return (
    <div className="binder-page">
      {binder && (
        <>
          <h1 className="binder-title">{binder.title}</h1>
          <p className="creation-date">
            Created: {binder.creation_date.toDate().toLocaleDateString()}
          </p>

          {/* Toggle Switch */}
          <div className="toggle-switch" onClick={toggleView}>
            <span className={`switch-option ${!showSources ? 'active' : ''}`}>Chat</span>
            <span className={`switch-option ${showSources ? 'active' : ''}`}>Sources</span>
          </div>

          <div className="binder-content">
            {/* Source List (Conditionally Rendered) */}
            <div className={`sources-list ${!showSources ? 'hidden' : ''}`}> 
              <button onClick={handleAddSourceClick} className="add-source-button">
                Add Source
              </button>
              {sources.map((source) => (
                <BinderSource
                  key={source.id}
                  source={source}
                  isActive={activeSourceId === source.id}
                  onClick={() => handleSourceClick(source.id)}
                  onDelete={handleDeleteSource}
                  onEdit={handleEditSource}
                />
              ))}
            </div>

            {/* Main Content Area */}
            <div className="main-content">
              {/* Show chat interface in Chat View, source content in Sources View */}
              {!showSources ? ( 
                <>
                  <div className="chat-messages">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`chat-message ${message.sender === 'user' ? 'user-message' : 'binder-message'}`}
                      >
                        <span className="message-text">{message.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chat-input">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={handleNewMessageChange}
                      onKeyPress={handleKeyPress} 
                    />
                    <button onClick={handleSendMessage}>Send</button>
                  </div>
                </>
              ) : ( 
                activeSourceId && sources.find(source => source.id === activeSourceId) ? (
                  <div className="active-source-content">
                    <h3>{sources.find(source => source.id === activeSourceId).title}</h3>
                    <p>{sources.find(source => source.id === activeSourceId).content}</p>
                  </div>
                ) : (
                  <p>Select a source to view its content.</p>
                )
              )}
            </div>
          </div>
        </>
      )}

      {showSourceForm && (
        <div className="source-form-popup">
          <h3>Add New Source</h3>
          <input
            type="text"
            placeholder="Source Title"
            value={newSourceTitle}
            onChange={handleSourceTitleChange}
          />
          <textarea
            placeholder="Source Content"
            value={newSourceContent}
            onChange={handleSourceContentChange}
          />
          <button onClick={handleCreateNewSource}>Submit</button>
          <button onClick={() => setShowSourceForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default BinderPage;
