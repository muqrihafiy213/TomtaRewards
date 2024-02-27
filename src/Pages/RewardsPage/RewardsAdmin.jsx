import React,{useEffect, useState} from 'react'
import AdminLayout from '../../Layouts/AdminLayout';
import { Button,Card,Typography,Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter} from "@material-tailwind/react";
import { imgDB, db } from '../../firebaseConfig';
import { deleteDoc, updateDoc,doc,getDocs, collection, Timestamp , onSnapshot } from 'firebase/firestore';
import NewListing from './RewardComponents/NewListing';
import { ref, getDownloadURL } from "firebase/storage";
import { Link } from 'react-router-dom';
import EditListing from './RewardComponents/EditListing';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function RewardsAdmin () {
   
       
      const TABLE_HEAD = ["Name", "Points", "Quantity", "Image", "Created Date","Last Changes","Status",""];
      const [rewardsData, setRewardsData] = useState([]);
      const [openPopup, setOpenPopup] = useState(false);
      const [editPopup, setEditPopup] = useState(false);
      const [selectedReward, setSelectedReward] = useState(null);
      const [open, setOpen] = React.useState(false);


      const showToastMessage = (status) => {
        if(status === "editted"){
          toast.success("Edit Success", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
        else if(status === "deleted"){
          toast.success("Delete Success!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        };
      }

      const handleOpen = (reward) => {
            setSelectedReward(reward);
            setOpen(!open);
      };

      const HandleRemovePopUp = () => setOpenPopup(false);
       
      const fetchData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'rewards'));
          return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error('Error fetching rewards:', error);
          return [];
        }
      };

  useEffect(() => {
   

    const fetchImageData = async (rewards) => {
      const updatedRewardsData = await Promise.all(
        rewards.map(async (reward) => {
          const imageRef = ref(imgDB, reward.main_image);
          try {
            const url = await getDownloadURL(imageRef);
            return { ...reward, imageUrl: url };
          } catch (error) {
            console.error('Error fetching image:', error);
            return { ...reward, imageUrl: 'https://placehold.co/400x200/png' };
          }
        })
      );
      setRewardsData(updatedRewardsData);
    };

    const unsubscribe = onSnapshot(collection(db, 'rewards'), (snapshot) => {
      const updatedData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      fetchImageData(updatedData);
    });

    const fetchAllData = async () => {
      const data = await fetchData();
      fetchImageData(data);
    };

    fetchAllData();

    return () => unsubscribe();
  }, []);

  const handleEditPopup = (reward) => {
    setSelectedReward(reward);
    setEditPopup(true);
  };

  const handleEditRemovePopup = () => {
    setSelectedReward(null);
    setEditPopup(false);
  };

  const handleSaveChanges = async (updatedData) => {
    const rewardDocRef = doc(db, 'rewards', selectedReward.id);
    await updateDoc(rewardDocRef, updatedData);

    handleEditRemovePopup();
    showToastMessage("editted");
    const updatedRewardsData = await fetchData();
    setRewardsData(updatedRewardsData);
  };

  const handleDelete = async (reward) => {
    try {
      if (!reward) {
        alert('No reward selected to delete');
        return;
      }
      
      const rewardDocRef = doc(db, 'rewards', reward.id);
      await deleteDoc(rewardDocRef);
      handleOpen(null);
  
      // Set a loading state to indicate that data is being updated
      setRewardsData([]);
      const updatedRewardsData = await fetchData();
      setRewardsData(updatedRewardsData);
      showToastMessage("deleted");
      if (selectedReward && selectedReward.id === reward.id) {
        setSelectedReward(null);
       
      }
    } catch (error) {
      alert('Error deleting document:', error.message);
      // Optionally, handle the error by showing a message to the user or logging it for debugging.
    }
  };

    return (
      <div>
        <AdminLayout>
          <ToastContainer />
         <div className='p-2 2xl:p-4'>
            <div className='m-auto column flex justify-between p-2'>
                <div className=' flex sm:m-auto my-auto  '>
                <p className='font-bold text-secondary 2xl:text-[38px] md:text-[28px] text-[20px] underline underline-offset-8 '>REWARDS LISTING</p>
                <Link to="/transactions">
                <p className='px-3 font-bold text-white 2xl:text-[38px] md:text-[28px] text-[20px]'>TRANSACTIONS</p>
                  </Link> 
                </div>
                    <Button
                            className='bg-buttons text-white  sm:text-[12px] 2xl:text-[16px] '
                            size="md"
                            ripple="light"
                            color='white'
                            onClick= {() => setOpenPopup(true)}
                            >
                            New Reward
                            </Button>    
                    
                    
                </div>
                
            <div className=''>
            <Card className="max-h-[60vh] h-auto w-11/12 mx-auto my-5 overflow-scroll ">
            <table className="w-full min-w-max table-auto text-left">
                <thead>
                <tr>
                    {TABLE_HEAD.map((head) => (
                    <th
                        key={head}
                        className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                    >
                        <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                        >
                        {head}
                        </Typography>
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {rewardsData.map((rewards,index) => {
                    const isLast = index === rewardsData.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                    const datecreated = rewards.added_on instanceof Timestamp
                      ? rewards.added_on.toDate()
                      : null;
                    const dateedited = rewards.last_update instanceof Timestamp
                      ? rewards.last_update.toDate()
                      : null;
                   
                    return (
                    <tr key={rewards.id}>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                            {rewards.name}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                            {rewards.price}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                            {rewards.quantity}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                             <div className='flex rewards-admin-container overflow-hidden'>
                              <img
                                className='p-2 shadow-inner max-h-fit m-auto object-contain'
                                src={rewards.main_image}
                                alt='placeholder'
                              />
                              </div>
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                           {datecreated ? new Date(datecreated).toLocaleDateString() : 'Invalid Date'}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                           {dateedited ? new Date(dateedited).toLocaleDateString() : 'None'} {rewards.edited_by === undefined ? "" : `by ${rewards.edited_by} ` }
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                           {rewards.active && <div className='text-green-500'>Active</div> }
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                          <div className='grid grid-cols-1'>
                          <Button
                            className="bg-buttons my-2 mx-4 text-white"
                            size="sm"
                            ripple={true}
                            onClick={() => handleEditPopup(rewards)}
                          >
                            Edit
                          </Button>
                          <Button
                            className="bg-buttons my-2 mx-4 text-white"
                            size="sm"
                            ripple={true}
                            onClick={() => handleOpen(rewards)}
                          >
                            delete
                          </Button>
                          </div>
                        </Typography>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            </Card>
            </div>
         
         </div>
         <Dialog
        open = {open}
        size = "xs"
        handler={handleOpen}
      >
        <DialogHeader>Are you sure you want to delete?</DialogHeader>
        <DialogBody>
          <div>{selectedReward?.name}</div>
        </DialogBody>
        <DialogFooter>
          <Button
            
            variant="text"
            color="white"
            onClick={() => handleOpen(null)}
            
            className="mr-1 bg-buttons text-primary"
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={() => handleDelete(selectedReward)}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
         <NewListing openPopUp={openPopup} closePopUp={HandleRemovePopUp} />
         {selectedReward && (
          <EditListing
            openPopUp={editPopup}
            closePopUp={handleEditRemovePopup}
            selectedReward={selectedReward}
            onSaveChanges={handleSaveChanges}
          />
        )}
        </AdminLayout>
      </div>
    )
  }
  
  export default RewardsAdmin