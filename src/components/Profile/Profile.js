// Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from 'firebase-config'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import UserArticlesList from 'components/UserArticlesList/UserArticlesList'; 
import 'components/Profile/Profile.css'; // Import CSS for styling

function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [userArticles, setUserArticles] = useState([]);
  const [showBinderForm, setShowBinderForm] = useState(false);
  const [newBinderTitle, setNewBinderTitle] = useState('');

  useEffect(() => {
    const fetchUserProfile = async (userId) => {
      const userRef = doc(db, "users", userId);
      const userProfile = await getDoc(userRef);
      if (userProfile.exists()) {
        setProfileData(userProfile.data());
      } else {
        navigate('/update-profile');
      }

      const articlesRef = collection(db, "articles");
      const q = query(articlesRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const articles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserArticles(articles);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserProfile(user.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth).catch((error) => {
      console.error('Logout failed', error);
    });
    navigate('/');
  };

  const handleDelete = async (articleId) => {
    const articleRef = doc(db, "articles", articleId);
    await deleteDoc(articleRef);
    setUserArticles(userArticles.filter(article => article.id !== articleId));
  };

  const handleCreateBinderClick = () => {
    setShowBinderForm(true);
  };

  const handleBinderTitleChange = (e) => {
    setNewBinderTitle(e.target.value);
  };

  const handleCreateNewBinder = async () => {
    try {
      const binderData = {
        title: newBinderTitle,
        description: '', // You can add a default description if needed
      };

      // Call a Firestore function to create a new binder document
      const newBinderRef = await addDoc(collection(db, 'binders'), {
        ...binderData,
        userId: auth.currentUser.uid, // Assuming you want to associate the binder with the current user
        createdAt: serverTimestamp(),
        sources: [], 
      });

      console.log("Created binder with ID:", newBinderRef.id);

      // Optionally, navigate to the new binder's view
      // navigate(`/binder/${newBinderRef.id}`);

    } catch (error) {
      console.error("Error creating binder:", error);
    }

    setShowBinderForm(false);
    setNewBinderTitle('');
  };

  return (
    <div>
      <h1>Welcome to your profile</h1>
      {profileData && (
        <>
          <p>Email: {auth.currentUser?.email}</p>
          <p>Name: {profileData.name}</p>
          <p>Date of Birth: {profileData.dateOfBirth}</p>
          <p>Location: {profileData.location}</p>
          <button onClick={() => navigate('/update-profile')}>Edit Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
      <UserArticlesList articles={userArticles} onDelete={handleDelete} />

      <div className="create-binder-container">
        <button 
          className="create-binder-button" 
          onClick={handleCreateBinderClick}
        >
          + Create New Binder
        </button>
      </div>

      {showBinderForm && (
        <div className="binder-form-popup">
          <input 
            type="text" 
            placeholder="Enter binder title"
            value={newBinderTitle}
            onChange={handleBinderTitleChange}
          />
          <button onClick={handleCreateNewBinder}>Create</button>
          <button onClick={() => setShowBinderForm(false)}>Cancel</button>
        </div>
      )}

    </div>
  );
}

export default Profile;
