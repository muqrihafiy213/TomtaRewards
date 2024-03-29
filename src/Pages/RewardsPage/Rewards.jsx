import React, { useEffect, useState } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import { Transition } from '@headlessui/react';
import { Button } from '@material-tailwind/react';
import { imgDB, db, auth } from '../../firebaseConfig';
import { getDocs, collection, doc, updateDoc,getDoc , onSnapshot, where ,query} from 'firebase/firestore';
import Points from '../../MainComponents/Points';
import { ref , getDownloadURL as getImgDownloadURL } from 'firebase/storage';
import { redeemReward } from './RewardComponents/RedeemReward';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

function Rewards() {
  const [rewardsData, setRewardsData] = useState([]);
  const [selectedRewards, setSelectedRewards] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1); // Initialize quantity to 1

  const showToastMessage = (status) => {
    if(status === "success"){
      toast.success("Redeem Success", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    else if(status === "lowpoints"){
      toast.warning("Not Enough Points!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    else if(status === "error"){
      toast.error("Redeem Failed", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  
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
        showToastMessage("success")
      } else {
        // Display an error message to the user
        showToastMessage("lowpoints")
      }
    } catch (error) {
      showToastMessage("error")
      console.log('Error redeeming reward:', error);
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
        <ToastContainer />
        <div className=''>
          <div className='m-auto column flex justify-between p-2 2xl:p-4'>
          <div className=' flex sm:m-auto my-auto'>
                <p className='font-bold text-secondary 2xl:text-[38px] md:text-[28px] text-[20px] underline underline-offset-8'>REWARDS</p>
                <Link to="/usertransactions">
                <p className='md:px-3 px-1 font-bold text-white 2xl:text-[38px] md:text-[28px] text-[20px]'>MY TRANSACTIONS</p>
                  </Link> 
                </div>
            <div key="key" className='w-4/12 container p-4'>
              <div className='m-auto flex justify-center bg-secondary rounded-[99px] shadow-xl p-2'>
                <span className='text-primary font-bold sm:text-[12px] 2xl:text-[24px] '>
                  <Points />
                </span>
              </div>
            </div>
          </div>
          <div className=' mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-3 px-2' >
            { rewardsData.length === 0 ? (
                <div className='m-auto container flex justify-center'>
                  <div className='p-10'>No Rewards Available</div>
                </div>
              ) : (
            rewardsData.map((rewards) => (
              <div className='container mx-auto bg-white sm:h-2/3 rounded-[8px] shadow m-4' key={rewards.id}>
                <div className='flex rewards-container sm:h-2/3 sm:w-2/3 py-2 m-auto overflow-hidden object-center'>
                  <img
                    className='px-2 shadow-inner max-h-fit m-auto object-contain '
                    src={rewards.imageUrl }
                    alt='placeholder'
                  />
                  </div>
                
                <div className='grid grid-cols-1 md:py-4 '>
                <div className=''><p className=' text-secondary text-[16px] 2xl:text-[24px] sm:text-[12px] font-bold text-center '>{rewards.name.substring(0, 20)}</p></div>
                  <div className=' '>
                  <div className='flex flex-col justify-center '>
                    <span className=' text-secondary text-[10px] 2xl:text-[20px] text-center'> Quantity: {rewards.quantity} </span>
                  </div>
                  </div>
                </div>
                <div className='container flex'>
                  <Button
                    className='bg-buttons flex justify-center w-full h-full text-white text-[16px] 2xl:text-[24px] sm:text-[12px] '
                    
                    ripple='light'
                    color='white'
                    onClick={() => handleButtonClick(rewards)}
                  >
                    {rewards.price} Points
                  </Button>
                </div>
              
              </div>
            )))
          }
          </div>
          
        </div>
        <Transition show={modalOpen} as="div" className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center  ">
          <Transition.Child
            as="div"
            className="fixed inset-0 transition-opacity"
            onClick={closeModal}
          >
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </Transition.Child>

          
          <span className="hidden "></span>
          &#8203;
          <Transition.Child
              as="div"
              className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all "
            >
              <div className="bg-white px-4 pt-5 pb-4 ">
                <div className="">
                  
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedRewards?.name}</h3>
                    <div className="mt-2">

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
                      <p className="text-md text-black">Total Points: {selectedRewards?.price * quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 ">
               
                <Button
                  color="blue"
                  onClick={closeModal}
                  ripple={true}
                >
                  Close
                </Button>
                <Button
                  color="blue"
                  onClick={() => handleRedeemReward(selectedRewards.price, quantity)}
                  ripple={true}
                >
                  Redeem
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
