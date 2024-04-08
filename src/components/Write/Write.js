import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from 'firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

function Write() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure user is logged in
    if (!user) {
      alert('You must be logged in to submit a story.');
      return;
    }

    // Save the submission to Firestore
    try {
      await addDoc(collection(db, "articles"), {
        userId: user.uid,
        title: title,
        body: body,
        createdAt: serverTimestamp(),
      });

      // Navigate to the profile page after successful submission
      navigate('/profile');
    } catch (error) {
      console.error('Error saving the article: ', error);
      alert('An error occurred while saving the article.');
    }
  };

  return (
    <div>
      <h2>What's on your mind?</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Write;
