import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from 'firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import './BinderPage.css'; // Import CSS for styling

function BinderPage() {
  const { binderId } = useParams();
  const [binder, setBinder] = useState(null);

  useEffect(() => {
    const fetchBinder = async () => {
      const binderRef = doc(db, 'binders', binderId);
      const binderSnap = await getDoc(binderRef);

      if (binderSnap.exists()) {
        setBinder(binderSnap.data());
      } else {
        console.log("Binder not found!");
        // Handle binder not found (e.g., redirect to an error page)
      }
    };

    fetchBinder();
  }, [binderId]);

  return (
    <div className="binder-page">
      {binder && (
        <>
          <h1 className="binder-title">{binder.title}</h1>
          <p className="creation-date">
            Created: {binder.creation_date.toDate().toLocaleDateString()}
          </p>
          {/* Add more content related to the binder here */}
        </>
      )}
    </div>
  );
}

export default BinderPage;
