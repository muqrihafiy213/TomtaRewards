import React, { useEffect, useState, useMemo } from 'react';
import { CiLocationOn } from 'react-icons/ci';
import { CiCalendarDate } from 'react-icons/ci';
import { MdTimelapse } from 'react-icons/md';
import {  db } from '../../../firebaseConfig';
import { collection, updateDoc, onSnapshot, doc, Timestamp } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../userSlice';
import ImageCategory from '../../ActivityPage/ActivityComponents/ImageCategory';

const UpcomingActivity = () => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector(selectUser);
  const userId = user?.userProfile?.uid;
  const userName = user?.userProfile?.firstName + ' ' + user?.userProfile?.lastName;

  // Use useMemo to memoize the currentDate
  const currentDate = useMemo(() => new Date(), []);

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        const activitiesCollectionRef = collection(db, 'Activity');
        const unsubscribe = onSnapshot(activitiesCollectionRef, (snapshot) => {
          const activities = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          const upcomingActivities = activities.filter((activity) => {
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
         alert("Thanks for Participating") 
      } else {
        console.error('Activity not found for update');
      }
    } catch (error) {
      console.error('Error updating participants:', error);
    }
  };

  const filteredActivities = activityData.filter(
    (activity) => !activity.participants?.some((participant) => participant.uid === userId)
  );

  return (
    <div className='container mx-auto'>
      <h1 className='m-3 font-bold text-primary md:text-[28px] text-[20px]'>UPCOMING ACTIVITY</h1>
      {loading ? (
        <div className='m-auto container flex justify-center'>
          <div className='p-10'>Loading...</div>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className='m-auto container flex justify-center'>
          <div className='p-10'>No Upcoming Activities</div>
        </div>
      ) : (
        <div className='max-w-[1240px] mx-auto grid md:grid-cols-2 gap-6'>
          {filteredActivities.slice(0, 4).map((activity) => {
            const dateofevent =
              activity?.event_date instanceof Timestamp ? activity.event_date.toDate() : null;

            return (
              <div key={activity.id}>
                <div className='animate-pulse bg-white rounded-[20px] shadow m-4'>
                  <div className=''>
                  <ImageCategory value={activity.category}/>
                  </div>
                  <div className='bg-secondary text-center text-black text-[16px] font-light'>{activity.title}</div>
                  <div className='p-3 text-[16px] '>
                    <div className='grid grid-cols-2 p-3 '>
                      <div className=' flex justify-center'>
                        <CiLocationOn className='h-5 w-5 m-1' />
                        <p className=''>{activity.location}</p>
                      </div>
                      <div className=' flex justify-center'>
                        <CiCalendarDate className='h-5 w-5 m-1 ' />
                        {dateofevent ? new Date(dateofevent).toLocaleDateString() : 'Invalid Date'}
                      </div>
                    </div>
                    <div className='grid grid-cols-2 p-3'>
                      <div className=' flex justify-center'>
                        <MdTimelapse className='h-5 w-5 m-1' />
                        {dateofevent ? new Date(dateofevent).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        },) : 'Invalid Date'}
                      </div>
                      <div className='flex justify-center'>
                        <button
                          type='submit'
                          className={`rounded-[20px] w-[200px] shadow ${
                            activity.participantStatus
                              ? 'bg-green-300 opacity-50 cursor-not-allowed'
                              : 'bg-green-300 hover:bg-green-200 border-b-4 border-green-400 hover:border-green-300'
                          }`}
                          onClick={() => participateInActivity(activity.id)}
                          disabled={activity.participantStatus}
                        >
                          {activity.participantStatus ? 'PARTICIPATED' : 'PARTICIPATE'}
                          
                        </button>
                      </div>
                      
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingActivity;
