// Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from 'firebase-config'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import UserArticlesList from 'components/UserArticlesList/UserArticlesList'; 
import BinderTile from 'components/Binder/BinderTile/BinderTile'; // Import BinderTile component
import 'components/Profile/Profile.css'; // Import CSS for styling

function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [userArticles, setUserArticles] = useState([]);
  const [showBinderForm, setShowBinderForm] = useState(false);
  const [newBinderTitle, setNewBinderTitle] = useState('');
  const [binders, setBinders] = useState([]); // State to store binders

  // Function to fetch binders from Firestore
  const fetchBinders = async () => {
    if (auth.currentUser) {
      const q = query(collection(db, 'binders'), where('user_id', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const binderData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBinders(binderData);
    }
  };

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

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserProfile(user.uid);
        fetchBinders(); // Fetch binders when user is logged in
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
        creation_date: serverTimestamp(),
        user_id: auth.currentUser.uid, 
      };

      // Add the new binder to Firestore (Firestore will auto-generate the ID)
      const newBinderRef = await addDoc(collection(db, 'binders'), binderData);

      console.log("Created binder with ID:", newBinderRef.id);

      // Re-fetch binders to update the UI
      await fetchBinders();

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

      <h2>Your Binders</h2>
      <div className="binder-tiles-container">
        {binders.map((binder) => (
          <BinderTile key={binder.id} binder={binder} />
        ))}
      </div>

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
