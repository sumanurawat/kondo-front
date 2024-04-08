import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from 'firebase-config'; // Adjust the import path as necessary
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import UserArticlesList from 'components/UserArticlesList/UserArticlesList'; // Import the new component


function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [userArticles, setUserArticles] = useState([]);

  useEffect(() => {

     const fetchUserProfile = async (userId) => {
       // Fetch user profile
       const userRef = doc(db, "users", userId);
       const userProfile = await getDoc(userRef);
       if (userProfile.exists()) {
         setProfileData(userProfile.data());
       } else {
         navigate('/update-profile');
       }

       // Fetch user's articles
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
        // If no user is logged in, navigate to login or another appropriate page
        navigate('/login');
      }
    });

    // Clean up the subscription
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
    // Update the UI by removing the deleted article
    setUserArticles(userArticles.filter(article => article.id !== articleId));
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
    </div>
  );
}

export default Profile;
