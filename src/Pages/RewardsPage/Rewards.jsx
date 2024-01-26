import React, { useEffect, useState } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import { Transition } from '@headlessui/react';
import { Button } from '@material-tailwind/react';
import { imgDB, db, auth } from '../../firebaseConfig';
import { getDocs, collection, doc, updateDoc,getDoc , onSnapshot, where ,query} from 'firebase/firestore';
import Points from '../../MainComponents/Points';
import { ref , getDownloadURL as getImgDownloadURL } from 'firebase/storage';
import { redeemReward } from './RewardComponents/RedeemReward';
import { Link } from 'react-router-dom';

function Rewards() {
  const [rewardsData, setRewardsData] = useState([]);
  const [selectedRewards, setSelectedRewards] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1); // Initialize quantity to 1

  
  useEffect(() => {
    // Fetch data function
    const fetchData = async () => {
      try {
        const rewardsRef = collection(db, 'rewards');
        const q = query(rewardsRef, where('active', '==', true));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        return data;
        
      } catch (error) {
        console.error('Error fetching rewards:', error);
        return [];
      }
    };
  
    // Fetch image function
   async function fetchImageData(rewards) {
      const updatedRewardsData = await Promise.all(
        rewards.map(async (reward) => {
          const imageRef = ref(imgDB, reward.main_image);
          try {
            const url = await getImgDownloadURL(imageRef);
            return { ...reward, imageUrl: url };
          } catch (error) {
            console.error('Error fetching image:', error);
            return { ...reward, imageUrl: 'https://placehold.co/400x200/png' };
          }
        })
      );
      setRewardsData(updatedRewardsData);
    };
  
    const rewardsRef = collection(db, 'rewards');
    const q = query(rewardsRef, where('active', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      fetchImageData(updatedData);
    });
  
    // Fetch data and images on component mount
    async function fetchAllData() {
      const data = await fetchData();
      fetchImageData(data);
    };
  
    fetchAllData();
  
    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);
 

  const handleRedeemReward = async (price, selectedQuantity) => {
    const user = auth.currentUser;
    const userId = user.uid;
    const userDocRef = doc(collection(db, 'Roles', 'Users', 'UserProfile'), userId);
  
    try {
      // Get the current user points and quantity from the database
      const userDoc = await getDoc(userDocRef);
      const currentPoints = userDoc.data().points;
      const userName = userDoc.data().firstName + userDoc.data().lastName  
      const userId = userDoc.data().uid
  
      const pointsToDeduct = price * selectedQuantity;
      if (currentPoints >= pointsToDeduct) {
        const newPoints = currentPoints - pointsToDeduct;
        await updateDoc(userDocRef, { points: newPoints });
  
        const rewardDocRef = doc(collection(db, 'rewards'), selectedRewards.id);
        const newDeductQuantity = selectedRewards?.quantity - selectedQuantity

        
        
        await updateDoc(rewardDocRef, { quantity: newDeductQuantity });
        await redeemReward(userId,userName,selectedRewards.name,selectedQuantity,pointsToDeduct);
        setModalOpen(false);
        alert('Purchase Success')
      } else {
        // Display an error message to the user
        alert('Not enough points to redeem the reward');
      }
    } catch (error) {
      alert('Error redeeming reward:', error);
    }
  };
  

  const handleButtonClick = (rewardsModal) => {
    setSelectedRewards(rewardsModal);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRewards(null);
    setQuantity(1); // Reset quantity when closing the modal
  };

  const checkQuantity = async (newQuantity) => {
    const maxQuantity = selectedRewards?.quantity || 1;
  
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      // Update the local state
      setQuantity(newQuantity);
    } else {
      // Display an error message to the user
      console.error(`Quantity must be between 1 and ${maxQuantity}`);
    }
  };
  


  return (
    <div>
      <MainLayout>
        <div className='container mx-auto'>
          <div className='m-auto column flex justify-between'>
          <div className=' flex my-auto'>
                <p className='font-bold text-primary md:text-[28px] text-[20px]'>REWARDS</p>
                <Link to="/usertransactions">
                <p className='px-3 font-bold text-white md:text-[28px] text-[20px]'>TRANSACTIONS</p>
                  </Link> 
                </div>
            <div key="key" className='w-4/12 container p-4'>
              <div className='m-auto flex justify-center bg-primary rounded-[99px] shadow-xl p-2'>
                <span className='text-secondary font-bold '>
                  <Points />
                </span>
              </div>
            </div>
          </div>
          <div className='max-w-[1240px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6' >
            { rewardsData.length === 0 ? (
                <div className='m-auto container flex justify-center'>
                  <div className='p-10'>No Rewards Available</div>
                </div>
              ) : (
            rewardsData.map((rewards) => (
              <div className='container mx-auto'>
                <div className=' bg-white rounded-[10px] shadow m-4 ' key={rewards.id}>
                <div className='columns-2'>
                  <div className='flex rewards-container overflow-hidden'>
                  <img
                    className='p-2 shadow-inner max-h-fit m-auto object-contain'
                    src={rewards.imageUrl }
                    alt='placeholder'
                  />
                  </div>
                  <div className='container py-5'>
                  <div className='flex flex-col justify-center   '>
                    <div className='container '><p className=' text-secondary md:text-[20px] text-[15px] font-bold py-2 pr-5  text-center'>{rewards.name}</p></div>
                    <span className=' text-secondary text-[12px]  py-2 pr-5 text-center'> Quantity: {rewards.quantity} </span>
                  </div>
                  </div>
                </div>
                <div className='container flex'>
                  <Button
                    className='bg-buttons flex justify-center w-full h-full text-white '
                    size='lg'
                    ripple='light'
                    color='white'
                    onClick={() => handleButtonClick(rewards)}
                  >
                    {rewards.price} Points
                  </Button>
                </div>
              </div>
              </div>
            )))
          }
          </div>
          
        </div>
        <Transition show={modalOpen} as="div" className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as="div"
            className="fixed inset-0 transition-opacity"
            onClick={closeModal}
          >
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </Transition.Child>

          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
          &#8203;
          <Transition.Child
              as="div"
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full sm:max-w-lg"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  {/* ... (existing code) */}
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedRewards?.name}</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Price: {selectedRewards?.price}</p>

                      {/* Quantity Counter */}
                      <div className="mt-2 flex items-center">
                        <label className="mr-2">Quantity:</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => checkQuantity(parseInt(e.target.value))}
                            className="border border-gray-300 p-1 w-16 text-center"
                          />
                      </div>

                      {/* Total Points */}
                      <p className="text-sm text-gray-500">Total Points: {selectedRewards?.price * quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  color="blue"
                  onClick={() => handleRedeemReward(selectedRewards.price, quantity)}
                  ripple={true}
                >
                  Confirm
                </Button>
                <Button
                  color="blue"
                  onClick={closeModal}
                  ripple={true}
                >
                  Close
                </Button>
              </div>
            </Transition.Child>
        </div>
      </Transition>
      </MainLayout>
    </div>
  );
}

export default Rewards;
