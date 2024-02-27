import React,{useEffect, useState} from 'react'
import { Button,Card,Typography , Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter} from "@material-tailwind/react";
import { db } from '../../firebaseConfig';
import { deleteDoc, doc,getDocs, collection, Timestamp , onSnapshot, query, orderBy,  } from 'firebase/firestore';
import NewActivity from './ActivityComponents/NewActivity';
import Participants from './ActivityComponents/Participants';
import AdminLayout from '../../Layouts/AdminLayout';
import ImageCategory from './ActivityComponents/ImageCategory';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ActivityAdmin () {
   
  const showToastMessage = (status) => {
    if(status === "notfound"){
      toast.warning(" No Activity Selected", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    else if(status === "deleted"){
      toast.success("Delete Success!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    else if(status === "error"){
      toast.error("Delete Unsuccessfull", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

      const TABLE_HEAD = ["Title", "Image", "Location", "Time", "Date of Event","Participants",""];
      const [activityData, setActivityData] = useState([]);
      const [modalOpen, setModalOpen] = useState(false);
      const [openPopup, setOpenPopup] = useState(false);
      const [selectedActivity, setSelectedActivity] = useState(null);
      const [open, setOpen] = React.useState(false);

      const handleOpen = (activity) => {
            setSelectedActivity(activity);
            setOpen(!open);
      };

      const HandleRemovePopUp = () => setOpenPopup(false);

      const handleButtonClick = (activity) => {
        setSelectedActivity(activity);
        setModalOpen(true);
      };
    
      const closeModal = () => {
        setModalOpen(false);
        setSelectedActivity(null);
      };
       
      const fetchData = async () => {
        try {
          const q = query(collection(db, 'Activity'), orderBy("event_date", "desc"))
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error('Error fetching rewards:', error);
          return [];
        }
      };

      useEffect(() => {
     
      
        async function fetchAllData() {
          const data = await fetchData();
          setActivityData(data);
        };
      
        const unsubscribe = onSnapshot(collection(db, 'Activity'), (snapshot) => {
          const updatedData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setActivityData(updatedData);
        });
      
        // Fetch data on mount
        fetchAllData();
      
        return () => unsubscribe();
      }, []);

  const handleDelete = async (activity) => {
    try {
      if (!activity) {
        alert('No reward selected to delete');
        return;
      }
  
      const activityDocRef = doc(db, 'Activity', activity.id);
      await deleteDoc(activityDocRef);
      showToastMessage("deleted")
  
      handleOpen(null);
      setActivityData([]);
      const updatedActivityData = await fetchData();
      setActivityData(updatedActivityData);
  
      if (selectedActivity && selectedActivity.id === activity.id) {
        setSelectedActivity(null);
      }
    } catch (error) {
      showToastMessage("error")
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
                <p className='font-bold text-secondary 2xl:text-[38px] md:text-[28px] text-[20px]'>ACTIVITY LISTING</p>
                
                </div>
                    <Button
                            className='bg-buttons text-white sm:text-[12px] 2xl:text-[16px] '
                            size="md"
                            ripple="light"
                            color='white'
                            onClick= {() => setOpenPopup(true)}
                            >
                            New Activity
                            </Button>    
                    
                    
                </div>
                
            <div className=''>
            <Card className="h-[70vh]  w-11/12 mx-auto my-5 overflow-scroll ">
            <table className=" w-full min-w-max table-auto text-left">
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
                {activityData.map((activity,index) => {
                    const isLast = index === activityData.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                    const dateofevent = activity?.event_date instanceof Timestamp
                      ? activity.event_date.toDate()
                      : null;

                     
                    return (
                    <tr key={activity.id}>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                            {activity.title}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                            <div className=' '>
                            <ImageCategory value={activity.category}/>
                              </div>
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                            {activity.location}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                              {dateofevent ? new Date(dateofevent).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    },) : 'Invalid Date'}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                           {dateofevent ? new Date(dateofevent).toLocaleDateString() : 'Invalid Date'}
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                            <button
                          
                          className={`text-buttons`}
                          onClick={() => handleButtonClick(activity)}
                        >
                         See Participants
                        </button>
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                        
                          <Button
                            className="bg-buttons m-2 text-white"
                            size="sm"
                            ripple="light"
                            onClick={() => handleOpen(activity)}
                          >
                            delete
                          </Button>
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
          <div>{selectedActivity?.title}</div> 
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
            onClick={() => handleDelete(selectedActivity)}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
         <NewActivity openPopUp={openPopup} closePopUp={HandleRemovePopUp} />
         
         {selectedActivity && (
          <Participants
            openPopUp={modalOpen}
            closePopUp={closeModal}
            selectedActivity={selectedActivity}
           
          />
        )}
        </AdminLayout>
        
      </div>
    )
  }
  
  export default ActivityAdmin