
import { db } from '../../../firebaseConfig';
import { getDocs, collection, query, where, updateDoc} from 'firebase/firestore';

export const updateUserPoints = async (userId, newPoints) => {
    try {
      const userRef = collection(db, 'Roles', 'Users', 'UserProfile');
      const q = query(userRef, where('uid', '==', userId));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.docs.length > 0) {
        const userDocRef = querySnapshot.docs[0].ref;
        await updateDoc(userDocRef, { points: newPoints });
        console.log('User points updated successfully');
      } else {
        console.error('User not found');
      }
    } catch (error) {
      console.error('Error updating user points:', error);
    }
}