import React from 'react';
import { auth } from 'firebase-config';

function HomePage() {

  return (
    <div>
      <h1>Welcome to the home page</h1>
      {auth.currentUser && <p>Welcome to Kondo, {auth.currentUser.email}</p>}
    </div>
  );
}

export default HomePage;
