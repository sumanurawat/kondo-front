import { db } from 'firebase-config'; // Ensure you have this export in your firebase-config
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

const usersCollectionRef = collection(db, "users");

export const createUserProfileDocument = async (userAuth, additionalData) => {
  if (!userAuth) return;

  const userRef = doc(db, "users", userAuth.uid);
  const snapshot = await getDocs(userRef);

  if (!snapshot.exists()) {
    const { email } = userAuth;
    const { name, dateOfBirth, location } = additionalData;
    try {
      await setDoc(userRef, {
        name,
        email,
        dateOfBirth,
        location,
      });
    } catch (error) {
      console.log("Error creating user", error.message);
    }
  }

  return userRef;
};
