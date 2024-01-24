import React, { useEffect, useState } from 'react';
import { Carousel, Button } from "@material-tailwind/react";
import { imgDB, db } from '../../../firebaseConfig';
import { getDocs, collection } from 'firebase/firestore';
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
      <Carousel className='container mx-auto my-5 rounded-xl z-0'>
        {announceData.length === 0 ? (
                <div className='m-auto container flex justify-center'>
                  <div className='p-10'>No Announcements</div>
                </div>
              ) : (announceData.map((announce) => (
          <div key={announce.id}>
            <div className={`w-full h-96 bg-cover bg-center ${announce.is_important ? 'border-4 border-yellow-400' : ''}`} style={{ backgroundImage: `url(${announce.imageUrl})` }}>
              <div className='flex flex-col items-center justify-center h-full bg-black bg-opacity-50'>
              <h1 className='text-[40px] font-bold text-white'>{announce.title}</h1>
              {announce.is_important && <StarIcon className='text-yellow-400 w-8 h-8 mb-2' />}
                <h1 className='text-[40px] font-bold text-white'>{announce.name}</h1>
                <p className='text-[16px] text-white'>{announce.quote}</p>
                <Button
                  color="light-blue"
                  size="lg"
                  onClick={() => handleButtonClick(announce)}
                  ripple="light"
                >
                  Read More
                </Button>
              </div>
            </div>
          </div>
        )))}
      </Carousel>

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
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary sm:mx-0 sm:h-10 sm:w-10">
                  
                  <img src={logo} alt='logo'>
                    
                  </img>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedAnnouncement?.name}</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{selectedAnnouncement?.text}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
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
