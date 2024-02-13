import React, { useEffect, useState } from 'react';
import { List, ListItem, Card , Button } from "@material-tailwind/react";
import { imgDB, db } from '../../../firebaseConfig';
import { getDocs, collection, Timestamp  } from 'firebase/firestore';
import { ref, getDownloadURL } from "firebase/storage";
import { Transition } from '@headlessui/react';
import { StarIcon } from '@heroicons/react/24/solid';
import logo from '../../../Assets/logo-ori-transparent.png'

const Announcement = () => {

  async function fetchDataFromFireStore() {
    const querySnapshot = await getDocs(collection(db, "announcements"))

    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  }

  const [announceData, setAnnounceData] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function fetchImageData(data) {
    const updatedAnnounceData = await Promise.all(
      data.map(async (announce) => {
        const imageRef = ref(imgDB, announce.header_image);
  
        try {
          const url = await getDownloadURL(imageRef);
          return { ...announce, imageUrl: url };
        } catch (error) {
          console.error('Error fetching image:', error);
  
          // Use a default image as a fallback
          return { ...announce, imageUrl: 'https://placehold.co/400x200/png' };
        }
      })
    );
    return updatedAnnounceData;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchDataFromFireStore();
        const sortedData = data.sort((a, b) => (b.is_important ? 1 : -1));
        const imageData = await fetchImageData(sortedData);
        setAnnounceData(imageData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  
    fetchData();
  }, []);


  const handleButtonClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAnnouncement(null);
  };

  return (
    <div>
      <h1 className='m-3 font-bold text-secondary md:text-[28px] text-[20px]'>Announcements</h1>
      <Card className=' sm:p-1 mx-2 my-4 rounded-xl z-0'>
        <List className='md:h-96 h-64'>
        {announceData.length === 0 ? (
                <div className='m-auto container flex justify-center'>
                  <div className='p-10'>No Announcements</div>
                </div>
              ) : (<div>
                { announceData.map((announce) => {
                  const dateofevent = announce?.publish_date instanceof Timestamp
                    ? announce.publish_date.toDate()
                    : null;
                  return (
                    <div key={announce.id}>
                      <button className="w-full" onClick={() => handleButtonClick(announce)}>
                      <ListItem className={` ${announce.is_important ? 'bg-yellow-800' : ''}`} >
                        <div className='flex justify-between h-full w-full bg-opacity-50'>
                            <div className='flex-col'>
                            <p className='md:text-[16px] text-[12px] text-white'>{dateofevent ? new Date(dateofevent).toLocaleDateString() : 'Invalid Date'}</p>
                              <h1 className='flex md:text-[38px] text-[20px] font-bold text-white'>{announce.is_important && <StarIcon className='text-yellow-400 w-4 h-4 md:w-8 md:h-8 m-2 ' />}{announce.title}</h1>
                            </div>
                            <div className='flex rewards-admin-container overflow-hidden'>
                              <img
                                className='p-2 shadow-inner max-h-fit m-auto object-contain'
                                src={announce.header_image}
                                alt='placeholder'
                              />
                              </div>
                          {/* <Button
                            className='bg-buttons'
                            color="white"
                            
                            onClick={() => handleButtonClick(announce)}
                            ripple="light"
                          >
                            Read More
                          </Button> */}
                        </div>
                      </ListItem>
                      </button>
                    </div>
                  )})
                }
              </div>)}
        </List>
      </Card>

      <Transition show={modalOpen} as="div" className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-10 px-4  sm:block sm:p-0">
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
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 h-auto">
              <div className=" sm:items-start">
                <div className='flex'>
                  <div className=" flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-secondary sm:mx-0 sm:h-10 sm:w-10">
                    <img src={logo} alt='logo'></img>
                  </div>
                  <div className='my-auto px-2 text-[12px]  text-gray-500'>{selectedAnnouncement?.publish_date ? new Date(selectedAnnouncement?.publish_date instanceof Timestamp ? selectedAnnouncement.publish_date.toDate() : null).toLocaleDateString() : 'Invalid Date'}</div>
                </div>
                <div className='flex container  '>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 p-1   bg-gray-300 container rounded-md">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedAnnouncement?.title}</h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-700 ">{selectedAnnouncement?.text}</p>
                            </div>
                          </div>
                          {/* <div className='flex rewards-admin-container items-center overflow-hidden'>
                                        <img
                                          className='p-1 shadow-inner max-h-fit mx-2  object-contain'
                                          src={selectedAnnouncement.header_image}
                                          alt='placeholder'
                                        />
                      </div> */}
                </div>
              </div>
              
            </div>
            <div className="bg-gray-50 flex justify-center py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button
                color="white"
                onClick={closeModal}
                ripple= {true}
              >
                Close
              </Button>
            </div>
          </Transition.Child>
        </div>
      </Transition>
    </div>
  );
};

export default Announcement;
