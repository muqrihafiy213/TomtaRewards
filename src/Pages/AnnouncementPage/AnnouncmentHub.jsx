import React,{useEffect, useState} from 'react'
import { Button,Card,Typography , Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter} from "@material-tailwind/react";
import { imgDB, db } from '../../firebaseConfig';
import { deleteDoc, doc,getDocs, collection, Timestamp , onSnapshot,  } from 'firebase/firestore';
import { ref, getDownloadURL } from "firebase/storage";
import { StarIcon } from '@heroicons/react/24/solid';
import NewAnnouncement from './NewAnnouncement';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminLayout from '../../Layouts/AdminLayout';


function AnnnouncementHub() {
   
    
  const TABLE_HEAD = ["Title", "Text", "Importance", "Image", "Date Publish", ""];
  const [announcementData, setAnnouncementData] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = useState(false);

  const showToastMessage = (status) => {
    if(status === "notfound"){
      toast.warning(" No Reward Selected", {
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

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };


  const handleOpen = (announce) => {
    setSelectedAnnouncement(announce);
    setOpen(!open);
  };

  const HandleRemovePopUp = () => setOpenPopup(false);


  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'announcements'));
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return [];
    }
  };

  const fetchImageData = async (announcements) => {
    const updatedAnnouncementData = await Promise.all(
      announcements.map(async (announce) => {
        const imageRef = ref(imgDB, announce.header_image);
        try {
          const url = await getDownloadURL(imageRef);
          return { ...announce, imageUrl: url };
        } catch (error) {
          console.error('Error fetching image:', error);
          return { ...announce, imageUrl: 'https://placehold.co/400x200/png' };
        }
      })
    );
    setAnnouncementData(updatedAnnouncementData);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const updatedData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      fetchImageData(updatedData);
    });

    // Fetch data on mount
    fetchData();

    return () => unsubscribe();
  }, []);

  const handleDelete = async (announce) => {
    try {
      if (!announce) {
        showToastMessage("notfound");
        return;
      }

      const announceDocRef = doc(db, 'announcements', announce.id);
      await deleteDoc(announceDocRef);
      showToastMessage("deleted");

      handleOpen(null);
      const updatedAnnounceData = await fetchData();
      setAnnouncementData(updatedAnnounceData);

      if (selectedAnnouncement && selectedAnnouncement.id === announce.id) {
        setSelectedAnnouncement(null);
      }
    } catch (error) {
      showToastMessage("error");
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
                <h1 className='font-bold text-secondary 2xl:text-[38px] md:text-[28px] text-[20px]'>ANNOUNCEMENTS HUB</h1>
                
                </div>
                    <Button
                            className='bg-buttons text-white  sm:text-[12px] 2xl:text-[16px] '
                            size="md"
                            ripple={true}
                            color='white'
                            onClick= {() => setOpenPopup(true)}
                            >
                            New Announcement
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
                        className="font-normal leading-none opacity-70 "
                        >
                        <div className='flex justify-center'>
                        {head}
                        </div>
                        </Typography>
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {announcementData.map((announce,index) => {
                    const isLast = index === announcementData.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                    const dateofevent = announce?.publish_date instanceof Timestamp
                      ? announce.publish_date.toDate()
                      : null;

                      
                    return (
                    <tr key={announce.id}>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                           <div className='flex justify-center'>
                           {announce.title}
                           </div>
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal break-words"
                        >
                          <div className='line-clamp-container align-middle '>  
                          
                          <p onClick={toggleExpanded} style={{ cursor: 'pointer' }} className=''>
                            {expanded ? announce.text : announce.text.substring(0, 100) + '...'}
                          </p>
                            </div>
                        </Typography>
                        </td>
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                        {announce.is_important && <StarIcon className='text-yellow-400 w-8 h-8 m-auto' />}
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
                                src={announce.header_image}
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
                            <div className='flex justify-center'>
                            {dateofevent ? new Date(dateofevent).toLocaleDateString() : 'Invalid Date'}
                            </div>
                        </Typography>
                        </td>
                      
                        <td className={classes}>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                        
                          <Button
                            className="bg-secondary m-2 text-white"
                            size="sm"
                            ripple={true}
                            onClick={() => handleOpen(announce)}
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
          <div>{selectedAnnouncement?.title}</div>
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
            onClick={() => handleDelete(selectedAnnouncement)}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
         <NewAnnouncement openPopUp={openPopup} closePopUp={HandleRemovePopUp} />
         
        </AdminLayout>
        
      </div>
    )
  }
  
  export default AnnnouncementHub