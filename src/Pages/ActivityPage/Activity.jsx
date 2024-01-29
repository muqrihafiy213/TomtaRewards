import React, { useEffect, useState } from 'react'
import MainLayout from '../../Layouts/MainLayout'
import { Swiper, SwiperSlide } from 'swiper/react';
import { CiLocationOn } from 'react-icons/ci';
import { CiCalendarDate } from 'react-icons/ci';
import { MdTimelapse } from 'react-icons/md';
import { db, auth} from "../../firebaseConfig";
import { getDocs, collection , onSnapshot, Timestamp , where, query } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../userSlice';
import ImageCategory from './ActivityComponents/ImageCategory';
import 'swiper/css';
import 'swiper/css/pagination';

import { Pagination } from 'swiper/modules';
import Participants from './ActivityComponents/Participants';


function Activity() {
    const [activityData, setActivityData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const user = useSelector(selectUser);
    const userName = user?.userProfile?.firstName + ' ' + user?.userProfile?.lastName;
    const currentDate = new Date();
    const upcomingActivities = activityData.filter((activity) => {
      const dateofevent = activity?.event_date instanceof Timestamp ? activity.event_date.toDate()
      : null;
      const eventDate = new Date(dateofevent);
      return eventDate > currentDate;
    });
    
    const pastActivities = activityData.filter((activity) => {
      const dateofevent = activity?.event_date instanceof Timestamp ? activity.event_date.toDate()
      : null;
      const eventDate = new Date(dateofevent);
      return eventDate <= currentDate;
    });

    const closeModal = () => {
      setModalOpen(false);
      setSelectedActivity(null);
    };
    
  
    useEffect(() => {
      
      const fetchData = async () => {
        const user = auth.currentUser;
        // console.log(userName);
        if (user) {
          const userId = user.uid;
          
        try {
          const querySnapshot = await getDocs( query(collection(db, 'Activity') , where("participants", 'array-contains', {name:userName ,uid:userId})));
          const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setActivityData(data);
          // console.log(data);
          return data;
          
        } catch (error) {
          console.error('Error fetching activities:', error);
          return [];
        }
       }
      };

    
      // Real-time updates
      const unsubscribe = onSnapshot(collection(db, 'Activity'), (snapshot) => {
        const updatedData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setActivityData(updatedData);
      });
    
      // Fetch data and images on component mount
      async function fetchAllData() {
        const data = await fetchData();
        setActivityData(data);
      };
    
      fetchAllData();
    
      // Clean up the subscription when the component unmounts
      return () => unsubscribe();
    
      // Clean up the subscription when the component unmounts
      
    }, [userName]);


  return (
    <div>
      <MainLayout>
      <div className='container mx-auto'>
      <div className='m-auto  flex justify-between p-3 '>
                <p className='font-bold text-primary md:text-[28px] text-[20px]'>UPCOMING PARTICIPATED ACTIVITIES</p>
                </div>
      {upcomingActivities.length === 0 ? (
        <div key={upcomingActivities.id} className='m-auto container flex justify-center'>
          <div className='p-10'>No Upcoming Activities</div>
        </div>
      ) : (
        <Swiper
          
          slidesPerView={3}
          spaceBetween={30}
          pagination={{
            clickable: true,
          }}
          modules={[Pagination]}
          className="mySwiper"
        >
          {upcomingActivities.length === 0 ? (
                <div className='m-auto container flex justify-center'>
                  <div className='p-10'>No Activity At the Moment</div>
                </div>
              ) : (upcomingActivities.map((activity) => {
           const dateofevent = activity?.event_date instanceof Timestamp
           ? activity.event_date.toDate()
           : null;
          return (
            <SwiperSlide>
              <div key={activity.id}>
                <div className=' bg-white rounded-[20px] shadow m-4'>
                  <div className=''>
                    <ImageCategory value={activity.category}/>
                  </div>
                  <div className='bg-secondary text-center text-primary text-[16px] font-light'>{activity.title}</div>
                  <div className='p-3 text-[16px] '>
                    <div className='grid grid-cols-2 p-3 '>
                      <div className=' flex justify-center'>
                        <CiLocationOn className='h-5 w-5 m-1' />
                        <p className=' '>{activity.location}</p>
                      </div>
                      <div className=' flex justify-center'>
                        <CiCalendarDate className='h-5 w-5 m-1 ' />
                        {dateofevent ? new Date(dateofevent).toLocaleDateString() : 'Invalid Date'}
                      </div>
                    </div>
                    <div className='grid grid-cols-2 p-3'>
                      <div className=' flex justify-center '>
                        <MdTimelapse className='h-5 w-5 my-0.5 mx-2' />
                        <p>{dateofevent ? new Date(dateofevent).toLocaleTimeString() : 'Invalid Date'}</p>
                      </div>
                     
                    </div>
                  </div>
                </div>
              </div>
              </SwiperSlide>
            )
        }
              )
         )}
        </Swiper>
      )}
        <div className='m-auto  flex justify-between p-3 '>
                <p className='font-bold text-primary md:text-[28px] text-[20px]'>PAST PARTICPATED ACTIVITIES</p>
                </div>
      {pastActivities.length === 0 ? (
        <div className='m-auto container flex justify-center'>
          <div className='p-10'>No Past Activities</div>
        </div>
      ) : (
        <Swiper
          slidesPerView={3}
          spaceBetween={30}
          pagination={{
            clickable: true,
          }}
          modules={[Pagination]}
          className="mySwiper"
        >
          {pastActivities.length === 0 ? (
                <div className='m-auto container flex justify-center'>
                  <div className='p-10'>No Activity At the Moment</div>
                </div>
              ) : (pastActivities.map((activity) => {
           const dateofevent = activity?.event_date instanceof Timestamp
           ? activity.event_date.toDate()
           : null;
          return (
            <SwiperSlide>
              <div key={activity.id}>
                <div className=' bg-primary rounded-[20px] shadow m-4'>
                  <div className='flex fixed-container  overflow-hidden'>
                    {activity.imageUrl ? (
                      <img
                        className='p-5 shadow m-auto object-contain image'
                        src={activity.imageUrl}
                        alt={activity.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x200/png';
                          e.target.alt = 'placeholder';
                        }}
                      />
                    ) : (
                      <img
                        className='p-5 shadow  max-h-fit m-auto object-contain image'
                        src='https://placehold.co/400x200/png'
                        alt='placeholder'
                      />
                    )}
                  </div>
                  <div className='bg-secondary text-center text-black text-[16px] font-light'>{activity.title}</div>
                  <div className='p-3 text-[16px] text-white '>
                    <div className='grid grid-cols-2 p-3 '>
                      <div className=' flex justify-center'>
                        <CiLocationOn className='h-5 w-5 m-1' />
                        <p>{activity.location}</p>
                      </div>
                      <div className=' flex justify-center'>
                        <CiCalendarDate className='h-5 w-5 m-1 ' />
                        {dateofevent ? new Date(dateofevent).toLocaleDateString() : 'Invalid Date'}
                      </div>
                    </div>
                    <div className='grid grid-cols-2 p-3'>
                      <div className=' flex justify-center'>
                        <MdTimelapse className='h-5 w-5 m-1' />
                        {dateofevent ? new Date(dateofevent).toLocaleTimeString() : 'Invalid Date'}
                      </div>
                      {/* <div className='flex justify-center'>
                        <button
                          
                          className={`text-buttons`}
                          onClick={() => handleButtonClick(activity)}
                        >
                          PARTICIPANTS
                        </button>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
              </SwiperSlide>
            )
        }
              )
         )}
        </Swiper>
      )}
       
            </div>
            {selectedActivity && (
          <Participants
            openPopUp={modalOpen}
            closePopUp={closeModal}
            selectedActivity={selectedActivity}
           
          />
        )}
      </MainLayout>
    </div>
  )
}

export default Activity