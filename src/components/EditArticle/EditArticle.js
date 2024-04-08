// src/components/EditArticle.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from 'firebase-config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

function EditArticle() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const { articleId } = useParams(); // Capture the articleId from the URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      const articleRef = doc(db, 'articles', articleId);
      const docSnap = await getDoc(articleRef);
      if (docSnap.exists()) {
        setTitle(docSnap.data().title);
        setBody(docSnap.data().body);
      } else {
        console.log("No such document!");
        navigate('/profile'); // Redirect if the article doesn't exist
      }
    };
    fetchArticle();
  }, [articleId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
      title,
      body,
      updatedAt: serverTimestamp(),
    });
    navigate('/profile'); // Navigate to the profile page after successful update
  };

  return (
    <div>
      <h2>Edit Your Article</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="body">Story:</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows="10"
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit">Update Article</button>
      </form>
    </div>
  );
}

export default EditArticle;
