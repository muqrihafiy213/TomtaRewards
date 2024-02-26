import React, { useEffect, useState } from 'react'
import MainLayout from '../../Layouts/MainLayout'
import { Swiper, SwiperSlide } from 'swiper/react';
import { CiLocationOn } from 'react-icons/ci';
import { CiCalendarDate } from 'react-icons/ci';
import { MdTimelapse } from 'react-icons/md';
import { MdTimeline } from 'react-icons/md';
import { UsersIcon } from '@heroicons/react/24/solid';
import { db, auth} from "../../firebaseConfig";
import { getDocs, collection , onSnapshot, Timestamp , where, query } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../userSlice';
import ImageCategory from './ActivityComponents/ImageCategory';
import 'swiper/css';
import 'swiper/css/pagination';
import { CalendarIcon } from 'react-calendar-icon';
import { Pagination } from 'swiper/modules';
import Participants from './ActivityComponents/Participants';



function Activity() {
    const [activityData, setActivityData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const user = useSelector(selectUser);
    const userName = user?.userProfile?.firstName + ' ' + user?.userProfile?.lastName;
    const currentDate = new Date();
    const upcomingActivities =activityData ? activityData.filter((activity) => {
      const dateofevent = activity?.event_date instanceof Timestamp ? activity.event_date.toDate()
      : null;
      const eventDate = new Date(dateofevent);
      return eventDate > currentDate;
    }) : [];
    
    const pastActivities =activityData ? activityData.filter((activity) => {
      const dateofevent = activity?.event_date instanceof Timestamp ? activity.event_date.toDate()
      : null;
      const eventDate = new Date(dateofevent);
      return eventDate <= currentDate;
    }) : [];

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
      <div className=''>
      
                <h1 className='m-3 2xl:m-7 font-bold text-secondary 2xl:text-[38px] md:text-[28px] text-[20px]'>UPCOMING PARTICIPATED ACTIVITIES</h1>
                
      {upcomingActivities.length === 0 ? (
        <div key={upcomingActivities.id} className='m-auto container flex justify-center'>
          <div className='p-10'>No Upcoming Activities</div>
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
          {upcomingActivities.length === 0 ? (
                <div className='m-auto container flex justify-center'>
                  <div className='p-10'>No Activity Participated At the Moment</div>
                </div>
              ) : (upcomingActivities.map((activity) => {
           const dateofevent = activity?.event_date instanceof Timestamp
           ? activity.event_date.toDate()
           : null;
          return (
            <SwiperSlide >
              <div key={activity.id} >
                <div className='bg-white  rounded-[20px] shadow m-4'>
                  <div className=''>
                    <ImageCategory value={activity.category}/>
                  </div>
                 <div className='flex'>
                    <div className='p-2 my-auto'>
                      <CalendarIcon  date={dateofevent}/>
                      </div>
                      <div className='my-2 text-[10px] 2xl:text-[20px]  flex-col '>
                        <h1 className=' text-secondary text-[16px] 2xl:text-[24px] sm:text-[12px]  font-bold flex'>{activity.title.substring(0,25)}</h1>
                        <div className='flex items-center'>
                        <CiLocationOn className='h-5 w-5  mx-1' />
                        <p>{activity.location}</p>
                        </div>
                        <div className='flex items-center'>
                                    <MdTimelapse className='h-5 w-5  mx-1' />
                                    {dateofevent ? new Date(dateofevent).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    },) : 'Invalid Date'}
                                </div>
                        <div className='flex items-center'>
                                  <MdTimeline className='h-5 w-5  mx-1' />
                                  <p className=''>{activity.duration}</p>
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
                <p className='font-bold text-secondary 2xl:text-[38px] md:text-[28px] text-[20px]'>PAST PARTICPATED ACTIVITIES {`(${pastActivities.length} Total)`}</p>
                </div>
      {pastActivities.length === 0 ? (
        <div className='m-auto container flex justify-center'>
          <div className='p-10'>No Past Activities</div>
        </div>
      ) : (
        <Swiper
       
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
          {pastActivities.length === 0 ? (
                <div className='m-auto container flex justify-center'>
                  <div className='p-10'>No Activity At the Moment</div>
                </div>
              ) : (pastActivities.map((activity) => {
           const dateofevent = activity?.event_date instanceof Timestamp
           ? activity.event_date.toDate()
           : null;
           const participants = activity.participants || [];
          return (
            <SwiperSlide>
              <div key={activity.id}>
                <div className=' bg-gray-500 rounded-[20px] shadow m-4'>
                  <div className=''>
                  <ImageCategory value={activity.category}/>
                  </div>
                  <div className='bg-secondary text-center text-white text-[16px] 2xl:text-[28px] font-light'>{activity.title}</div>
                  <div className='p-3 text-[12px]  2xl:text-[24px]'>
                    
                      <div className=' flex justify-center items-center'>
                        <CiLocationOn className='h-5 w-5 ' />
                        <p>{activity.location}</p>
                      </div>
                      {/* <div className=' flex justify-center'>
                        <CiCalendarDate className='h-5 w-5 m-1 ' />
                        {dateofevent ? new Date(dateofevent).toLocaleDateString() : 'Invalid Date'}
                      </div> */}
                    
                    <div className='grid grid-cols-2 p-3 '>
                    <div className='flex text-black justify-center items-center'><CiCalendarDate className='h-5 w-5  ' />
                      {dateofevent ? new Date(dateofevent).toLocaleDateString() : 'Invalid Date'}
                      </div>
                      <div className='flex text-primary justify-center items-center'><UsersIcon className='h-5 w-5 pr-1 ' />
                      {participants.length} { participants.length === 1 ? "Participant" : "Participants"}
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