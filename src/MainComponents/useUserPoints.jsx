import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { setUserPoints, resetUserPoints } from '../pointsSlice';

const useUserPoints = () => {
  const dispatch = useDispatch();
  const userPointsData = useSelector((state) => state.points.userPoints);
  const loading = useSelector((state) => state.points.loading);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;

        try {
          const userRef = collection(db, 'Roles', 'Users', 'UserProfile');
          const q = query(userRef, where('uid', '==', userId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Assuming there is only one document for the user
            const userData = querySnapshot.docs[0].data();
            dispatch(setUserPoints(userData.points));

            // Set up a Firestore listener for real-time updates
            const docRef = querySnapshot.docs[0].ref;
            const unsubscribe = onSnapshot(docRef, (doc) => {
              const updatedUserData = doc.data();
              dispatch(setUserPoints(updatedUserData.points));
            });

            // Clean up the listener when the component unmounts
            return () => unsubscribe();
          } else {
            console.log('User profile document not found.');
            dispatch(resetUserPoints());
          }
        } catch (error) {
          console.error('Error fetching user profile document:', error);
          dispatch(resetUserPoints());
        }
      } else {
        dispatch(resetUserPoints());
        console.log('User not authenticated');
      }
    };

    fetchData();
  }, [dispatch]);

  return { userPoints: userPointsData, loading };
};

export default useUserPoints;
