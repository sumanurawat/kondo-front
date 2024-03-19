import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from 'firebase-config';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // userCredential.user will have all the info about the newly created user
      const user = userCredential.user;
  
      // Create a document in Firestore in the 'users' collection with the UID as the document ID
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
        // Any other initial fields you want to set for a new user
      });
  
      navigate('/profile');
    } catch (error) {
      setError(error.message);
      console.error(error.message);
    }
  };

  return (
    <div>
      <h1>Signup</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignup}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;
