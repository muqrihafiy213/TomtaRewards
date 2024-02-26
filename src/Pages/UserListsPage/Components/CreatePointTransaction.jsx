import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

export const earnedPoints = async (userId,userName , rewardId, totalpoints) => {
  try {
    const redemptionInfo = {
      userId,
      userName,
      rewardId,
      quantity: "none",
      totalpoints,
      type : "earned",
      transaction_date: new Date(),
    };

    // Add redemption information to Firestore
    const docRef = await addDoc(collection(db, 'Transactions'), redemptionInfo);
    console.log('Redemption added with ID: ', docRef.id);

    return docRef.id; 
  } catch (error) {
    console.error('Error adding redemption: ', error);
    throw error; // Rethrow the error for handling in the component
  }
};