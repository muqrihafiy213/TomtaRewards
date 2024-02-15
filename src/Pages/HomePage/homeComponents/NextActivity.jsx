import React, { useEffect, useState, useMemo } from 'react';
import { CiLocationOn } from 'react-icons/ci';
import { MdTimelapse } from 'react-icons/md';
import {  db } from '../../../firebaseConfig';
import { collection,  onSnapshot, Timestamp } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../userSlice';
import { List, ListItem, Card  } from "@material-tailwind/react";
import { CalendarIcon } from 'react-calendar-icon';

const NextActivity = () => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const user = useSelector(selectUser);
  const userId = user?.userProfile?.uid;


  // Use useMemo to memoize the currentDate
  const currentDate = useMemo(() => new Date(), []);

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




  

  return (
    <div>
      <h1 className='m-2.5 font-bold text-secondary md:text-[28px] text-[20px]'>Next Activity</h1>
      <Card className='px-1 mx-1 my-1 rounded-xl z-0 overflow-auto border-primary border-4'>
        <List className='md:h-32 h-32 '>
        {loading ? (
        <div className='m-auto container flex justify-center'>
          <div className='p-10'>Loading...</div>
        </div>
      ) : (
        <div className=' mx-auto w-full '>
          {activityData.slice(0, 1).map((activity) => {
              const dateofevent =
                activity?.event_date instanceof Timestamp ? activity.event_date.toDate() : null;
                  return (
                    <div key={activity.id}>
                      <button className="w-full" >
                      <ListItem>
                        <div className='flex justify-around w-full bg-opacity-50 items-center'>
                            <div >
                            <CalendarIcon  date={dateofevent}/>
                              </div>
                            <div className='flex-col '>
                              <h1 onClick={toggleExpanded} style={{ cursor: 'pointer' }} className='flex text-[18px] font-bold text-black items-center overflow-hidden text-ellipsis'>{expanded ? activity.title : activity.title.substring(0, 15) }</h1>
                                <div className='flex text-[12px] items-center'>
                                <CiLocationOn className='h-5 w-5 m-1' />
                                <p className=''>{activity.location}</p>
                                </div>
                                <div className='flex text-[12px] items-center'>
                                    <MdTimelapse className='h-5 w-5 m-1' />
                                    {dateofevent ? new Date(dateofevent).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    },) : 'Invalid Date'}
                                </div>
                              
                            </div>
                            <div className='flex items-center'>
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

export default NextActivity;