import React, { useEffect, useState } from 'react';
import img from '../Assets/No_avatar.png';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig'; // Assuming you have 'storage' from Firebase

const Avatar = () => {
  const [imageUrl, setImageUrl] = useState(null);
  

  useEffect(() => {
    const user = auth.currentUser;
  
    // Check if the user is authenticated
    if (user) {
      const userId = user.uid;
      const userProfileRef = doc(collection(db, 'Roles', 'Users', 'UserProfile'), userId);
  
      const unsubscribe = onSnapshot(userProfileRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          if (userData.profile_image) {
            setImageUrl(userData.profile_image);
          } else {
            // Handle the case when profile_image is not present or null
            setImageUrl(null);
          }
        }
      });
  
      // Clean up the subscription when the component unmounts
      return () => unsubscribe();
    }
  
    // If user is not authenticated, handle it here (e.g., set imageUrl to default value)
    setImageUrl(null);
  }, []);

  

  return (
    <div>
      <img
        alt="name"
        src={imageUrl ? imageUrl : img}
        className="shadow m-auto md:w-16 md:h-16 w-14 h-14 rounded-full"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = img;
          e.target.alt = 'placeholder';
        }}
      />
    </div>
  );
};

export default Avatar;
