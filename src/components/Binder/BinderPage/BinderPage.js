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

  // useCallback for fetchSources
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

      // Re-fetch sources to update the UI
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

      // Update the sources state to reflect the changes
      setSources(sources.map(source => 
        source.id === sourceId ? { ...source, title: updatedTitle, content: updatedContent } : source
      ));

    } catch (error) {
      console.error("Error updating source:", error);
    }
  };

  return (
    <div className="binder-page">
      {binder && (
        <>
          <h1 className="binder-title">{binder.title}</h1>
          <p className="creation-date">
            Created: {binder.creation_date.toDate().toLocaleDateString()}
          </p>

          <button onClick={handleAddSourceClick} className="add-source-button">
            Add Source
          </button>

          <div className="sources-container">
            {sources.map((source) => (
              <BinderSource 
                key={source.id} 
                source={source} 
                onDelete={handleDeleteSource} 
                onEdit={handleEditSource} 
              />
            ))}
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
