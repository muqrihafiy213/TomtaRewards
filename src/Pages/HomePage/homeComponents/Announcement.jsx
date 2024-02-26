import React, { useEffect, useState } from 'react';
import { Button, 
  Dialog, DialogHeader, DialogBody, DialogFooter,} from "@material-tailwind/react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { imgDB, db } from '../../../firebaseConfig';
import { getDocs, collection, Timestamp  } from 'firebase/firestore';
import { ref, getDownloadURL } from "firebase/storage";
import { StarIcon } from '@heroicons/react/24/solid';
import logo from '../../../Assets/logo-ori-transparent.png'
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

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
    <div >
      <h1 className='m-3 2xl:m-7 font-bold text-secondary 2xl:text-[38px] md:text-[28px] text-[20px]'>Announcements</h1>
      {announceData.length === 0 ? (
    <div key={announceData.id} className='m-auto container flex justify-center'>
      <div className='p-10'>No Upcoming Announcements</div>
    </div>
  ) : (
    <Swiper
    slidesPerView={1}
    spaceBetween={10}
    breakpoints={{
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
      1440: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
      1580: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
      

    }}
      pagination={{
        clickable: true,
      }}
      modules={[Pagination]}
      className="mySwiper bg-primary"
    >
      {announceData.length === 0 ? (
            <div className='m-auto container flex justify-center'>
              <div className='p-10'>No Announcement At the Moment</div>
            </div>
          ) : (announceData.map((announce) => {
       const dateofevent = announce?.publish_date instanceof Timestamp
       ? announce.publish_date.toDate()
       : null;
      return (
        <SwiperSlide >
         <div key={announce.id} >
                      <button className="w-full" onClick={() => handleButtonClick(announce)}>
                      <div className={`rounded-[20px] sm:h-32 shadow m-2 ${announce.is_important ? 'bg-yellow-800' : 'bg-secondary'} `} >
                        <div className='  p-2 bg-opacity-50 grid grid-cols '>
                        <p className='flex 2xl:text-[28px] md:text-[16px] text-[12px] text-white items-center mx-2'>{dateofevent ? new Date(dateofevent).toLocaleDateString() : 'Invalid Date'}{announce.is_important && <StarIcon className='text-yellow-400 w-4 h-4 ml-1 pb-1' />}</p>
                            <div className='container flex justify-between'>
                             <div className='w-3/4'>
                                  <h1 className='flex 2xl:p-4 p-2 text-left 2xl:text-[36px] md:text-[20px] text-[16px] font-bold text-white'>{announce.title.substring(0, 27)}</h1>
                                    <p className='text-sm text-buttons text-left ml-2 2xl:ml-4 -mt-2 2xl:-mt-4 2xl:text-lg'>Click to Open </p>
                             </div>
                              <div className='flex xl:w-[10vw] xl:h-[10vw] w-[15vw] h-[15vw] sm:w-[20vw] sm:h-[20vw]  overflow-hidden  '>
                              <img
                                className='p-2 shadow-inner   object-fit'
                                src={announce.header_image}
                                alt='placeholder'
                              />
                              </div>
                            </div>
                          
                        </div>
                      </div>
                      </button>
                    </div>
          </SwiperSlide>
        )
    }
          )
     )}
    </Swiper>
  )}
      <Dialog open={modalOpen} className='pb-1 overflow-y-auto'>
  <DialogHeader>
    {/* Header content */}
    <div className='flex pt-5'>
      <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-secondary sm:mx-0 sm:h-10 sm:w-10">
        <img src={logo} alt='logo'></img>
      </div>
      <div className='my-auto px-2 text-[12px] 2xl:text-[24px] text-gray-500'>
        {/* Display publish date */}
        {selectedAnnouncement?.publish_date ? 
          new Date(selectedAnnouncement?.publish_date instanceof Timestamp ? 
          selectedAnnouncement.publish_date.toDate() : null).toLocaleDateString() 
          : 'Invalid Date'}
      </div>
    </div>
  </DialogHeader>
 
  
    <DialogBody className="flex justify-center  ">
      <div className=' overflow-y-auto max-h-[60vh] 2xl:max-h-[60vh]'>
        {/* Announcement content */}
        <div className="overflow-hidden text-center text-sm 2xl:text-[24px] sm:mt-0 sm:ml-4 p-1 sm:min-w-[40vh] md:min-w-[100vh] 2xl:min-w-full bg-gray-300 rounded-md">
          <h3 className="leading-6 text-md font-medium text-gray-900">{selectedAnnouncement?.title}</h3>
          <div className="mt-2 ">
            <p className="md:text-sm  2xl:text-2xl  text-gray-700 whitespace-pre-line">{selectedAnnouncement?.text}</p>
          </div>
        </div>
      </div>
    </DialogBody>
  
  <DialogFooter className='flex justify-center'>
    {/* Close button */}
    <Button
      size='lg'
      color="white"
      onClick={closeModal}
      ripple={true}
      className='2xl:text-[28px] bg-buttons'
    >
      Close
    </Button>
  </DialogFooter>
</Dialog>

      
    </div>
  );
};

export default Announcement;
