import React, { useEffect, useState, useMemo } from 'react';
import { CiLocationOn } from 'react-icons/ci';
import { CiCalendarDate } from 'react-icons/ci';
import { MdTimelapse } from 'react-icons/md';
import { MdTimeline } from 'react-icons/md';
import { Hand } from '@emotion-icons/heroicons-solid';
import { ThumbUp } from '@emotion-icons/heroicons-solid';
import {  db } from '../../../firebaseConfig';
import { collection, updateDoc, onSnapshot, doc, Timestamp } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../userSlice';
import { List, ListItem, Card, Tooltip } from "@material-tailwind/react";
import { Link } from 'react-router-dom';
import IconCategory from '../../ActivityPage/ActivityComponents/IconCategory';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpcomingActivity = () => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector(selectUser);
  const userId = user?.userProfile?.uid;
  const userName = user?.userProfile?.firstName + ' ' + user?.userProfile?.lastName;

  // Use useMemo to memoize the currentDate
  const currentDate = useMemo(() => new Date(), []);
  const showToastMessage = () => {
    toast.success("Thanks For Participating", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };
  
  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        const activitiesCollectionRef = collection(db, 'Activity');
        const unsubscribe = onSnapshot(activitiesCollectionRef, (snapshot) => {
          const activities = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          const sortedActivities = activities.sort((a, b) => {
            const dateA = a.event_date instanceof Timestamp ? a.event_date.toDate() : null;
            const dateB = b.event_date instanceof Timestamp ? b.event_date.toDate() : null;
            return dateA - dateB;
          });

          const upcomingActivities = sortedActivities.filter((activity) => {
            const dateofevent =
              activity?.event_date instanceof Timestamp ? activity.event_date.toDate() : null;
            const eventDate = new Date(dateofevent);
            return eventDate > currentDate;
          });

          const userParticipationStatus = upcomingActivities.map((activity) =>
            activity.participants?.some((participant) => participant.uid === userId)
          );

          setActivityData(
            upcomingActivities.map((activity, index) => ({
              ...activity,
              participantStatus: userParticipationStatus[index],
            }))
          );
          setLoading(false);
        });

        return () => unsubscribe(); // Cleanup the subscription when the component unmounts
      } catch (error) {
        console.error('Error fetching and subscribing to activities:', error);
        setLoading(false);
      }
    };

    fetchAndSubscribe();
  }, [userId, currentDate]);


  const participateInActivity = async (activityId) => {
    if (!userId) {
      return;
    }

    try {
      const activityToUpdate = activityData.find((activity) => activity.id === activityId);
      
      if (activityToUpdate) {
        const updatedParticipants = activityToUpdate.participants
          ? [...activityToUpdate.participants, { uid: userId, name: userName }]
          : [{ uid: userId, name: userName }];
        
        // Perform the update
        await updateDoc(doc(db, 'Activity', activityId), {
          participants: updatedParticipants,
        });

        // Update the activityData state after successful update
        setActivityData((prevActivityData) =>
          prevActivityData.map((activity) =>
            activity.id === activityId
              ? { ...activity, participants: updatedParticipants, participantStatus: true }
              : activity
          )
        );
        showToastMessage();
      } else {
        console.error('Activity not found for update');
      }
    } catch (error) {
      console.error('Error updating participants:', error);
    }
  };

  

  return (
    <div>
      <ToastContainer />
      <h1 className='m-3 font-bold text-secondary 2xl:text-[38px] md:text-[28px] text-[20px]'>Upcoming Activity</h1>
      <Card className='p-1 mx-1 my-4 rounded-xl z-0 overflow-auto '>
        <List className='2xl:h-[41vh] md:h-56 h-28 '>
        
        {loading ? (
        <div className='m-auto container flex justify-center'>
          <div className='p-10'>Loading...</div>
        </div>
      ) : (
        <div className=' mx-auto w-full '>
          {activityData.slice(0, 4).map((activity) => {
              const dateofevent =
                activity?.event_date instanceof Timestamp ? activity.event_date.toDate() : null;
                  return (
                    <div key={activity.id} className='p-1'>
                      <button className="w-full bg-gray-100 rounded-md" >
                      <ListItem  >
                        <div className='flex justify-around w-full bg-opacity-50 2xl:h-'>
                            <div className=' my-auto  '>
                                <IconCategory value={activity.category}/>
                              </div>
                              <Link to='/activity ' >
                              <Tooltip  content="Click to See More" placement="top" >
                            <div className='flex-col text-[10px] 2xl:text-[28px] 2xl:py-6'>
                            <h1 className='flex text-[16px] 2xl:text-[32px] font-bold text-black items-center'>{activity.title.substring(0, 25)}</h1>
                            
                             <div className='flex  '>
                             <div className='flex text-black items-center'><CiCalendarDate className='h-5 w-5 m-1 ' />
                              {dateofevent ? new Date(dateofevent).toLocaleDateString() : 'Invalid Date'}</div> 
                                <div className='flex items-center'>
                                    <MdTimelapse className='h-5 w-5 m-1' />
                                    {dateofevent ? new Date(dateofevent).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    },) : 'Invalid Date'}
                                </div>
                              </div>
                              <div className='flex items-center'>
                                <CiLocationOn className='h-5 w-5 m-1' />
                                <p className=''>{activity.location.substring(0,25)}</p>
                                </div>
                                <div className='flex items-center'>
                                <MdTimeline className='h-5 w-5 m-1' />
                                <p className=''>{activity.duration}</p>
                                </div>
                            </div>
                            </Tooltip>
                            </Link>
                            <div className='flex items-center'>
                              <button
                                type='submit'
                                className={`rounded-xl w-8 h-8 shadow  ${
                                  activity.participantStatus
                                    ? ' opacity-50 cursor-not-allowed'
                                    : ' hover:bg-green-200  '
                                }`}
                                onClick={() => participateInActivity(activity.id)}
                                disabled={activity.participantStatus}  
                              >
                                {activity.participantStatus ? <Tooltip  content="You have Participated"><ThumbUp className='w-8 h-8 2xl:h-16 2xl:w-16 text-green-300' /></Tooltip> : <Tooltip  content="Click to Participate"><Hand className='w-8 h-8 2xl:h-16 2xl:w-16 text-yellow-300 hover:text-white'/></Tooltip>}
                              </button>
                        </div>
                        </div>
                      </ListItem>
                      </button>
                    </div>
                  )})
                }
              </div>)}
            
        </List>
      </Card>

      
    </div>
  );
};

export default UpcomingActivity;
