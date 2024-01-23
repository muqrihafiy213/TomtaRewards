import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

export const redeemReward = async (userId,userName, rewardId, quantity,totalpoints) => {
  try {
    const redemptionInfo = {
      userId,
      userName,
      rewardId,
      quantity,
      totalpoints,
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