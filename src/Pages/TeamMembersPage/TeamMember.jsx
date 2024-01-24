import React,{useEffect,useState} from 'react'
import img from '../../Assets/stockprofile.jpg'
import { getDocs, collection, query, where , onSnapshot, updateDoc , doc} from 'firebase/firestore';
import { db,auth } from '../../firebaseConfig';
import { useSelector} from 'react-redux';
import { selectUser } from '../../userSlice';
import { Checkbox, Button  } from "@material-tailwind/react";
import AddMember from './Components/AddMembers';
import Avatar from '../../MainComponents/Avatar';
import SuperiorLayout from '../../Layouts/SuperiorLayout';

function TeamMembers() {

    const userNow = useSelector(selectUser);
    const userId = userNow?.userProfile?.uid;
    const userName = userNow?.userProfile?.firstName + ' ' + userNow?.userProfile?.lastName;
   
    const [teamData, setTeamData ] = useState([])
    const [selectedUser, setSelectedUser] = useState([]);
    const [addPopup, setAddPopup] = useState(false);
    

    const handlePopup = () => {
      
        setAddPopup(true);
      };
     

      const handleClosePopup = () => {
        setAddPopup(false);
        
      };
      const handleUserSelection = (userId) => {
        setSelectedUser(userId);
      };

      const handleRemove = async () => {
        if ( selectedUser.length === 0) {
          alert('Please choose a user');
          return;
        }
        if (selectedUser) {
          try {
            const userDocRef = doc(db, 'Roles', 'Users', 'UserProfile', selectedUser);
            await updateDoc(userDocRef, { superior: "none" });
            
            setSelectedUser([]);
            alert("User Remove Succesfully")
            
          } catch (error) {
            console.error('Error Removing User', error);
            
          }
           
        
          
        }
      };
    
    useEffect(() => {
        const fetchData = async () => {
          const user = auth.currentUser;
    
          if (user) {
            const userId = user.uid;
    
            try {
                const userRef = collection(db, 'Roles', 'Users', 'UserProfile');
                const team = query(userRef, where('superior', '==', userId));
                const queryTeam = await getDocs(team);
                const tData = queryTeam.docs.map(doc => ({ id: doc.id, ...doc.data() }));
               
                
                setTeamData(tData);
                return tData;

            } catch (error) {
              console.error('Error fetching user profile document:', error);
            
            }
          } 
        };
        const unsubscribe = onSnapshot(collection(db, 'Roles', 'Users', 'UserProfile'), (snapshot) => {
        const updatedData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          fetchData(updatedData)
        });
        
        fetchData();
        return () => unsubscribe();

      }, []);

      

  return (
    <div>
      <SuperiorLayout>
       <div className='container m-auto '>
       <div className='m-auto  flex justify-between p-3 '>
                <p className='font-bold text-primary md:text-[28px] text-[20px]'>My Team</p>
                </div>
            <div className='flex column'>
            <div className='w-1/4 container items-center' >
                <div className='bg-primary rounded-md m-3 flex flex-col items-center text-white text-[10px] md:text-[18px]'>
                        <h1 className='font-bold'>Team Leader</h1>
                        <div><Avatar /></div>
                        <p className='m-3'>{userName}</p>
                </div>
                <div className='flex justify-center '>
                    <Button
                                    className='bg-buttons m-2 text-white w-full'
                                    size="md"
                                    ripple="light"
                                    color='white'
                                
                                    >
                                    Recognize
                    </Button> 
                </div>
                <div className='md:flex justify-center '>
                    <Button
                                    className='bg-buttons my-2 md:mx-2 text-white w-full '
                                    size="md"
                                    ripple="light"
                                    color='white'
                                    onClick={handlePopup}
                                    >
                                    Add Members 
                    </Button> 
                    <Button
                                    className=' my-2 md:mx-2 text-white md:w-full'
                                    size="md"
                                    ripple="light"
                                    color='red'
                                    onClick={handleRemove}
                                    >
                                    Remove Member
                    </Button> 
                </div>
            </div>
            <div className='container m-3 '>
                  <div className=''>
                    <div >
                        <div className="pt-3  flex justify-center items-center">
                            <span className="h-1 w-14 rounded-3xl bg-gray-700" />
                            <h2 className=" text-sm font-semibold uppercase">TEAM MEMBERS</h2>
                            <span className="h-1 w-14 rounded-3xl bg-gray-700" />
                        </div>
                        <div className='container grid grid-cols-4'>
             { teamData.length === 0 ? (
                <div className='m-auto container flex justify-center'>
                  <div className='p-10'>No Teamates Available</div>
                </div>
              ) : (
            teamData.map((teammate) => (
                        
                            <div key={teammate.id} className='bg-white rounded-md m-2 flex flex-col items-center p-2 text-primary'>
                            <img
                            className='shadow m-auto   w-16 h-16 rounded-full'
                            src={img}
                            alt='placeholder'
                                 />
                            <p className='mx-1 text-md'>{teammate.firstName}{teammate.lastName}</p>
                            <p className='mx-1 text-sm'>{teammate.email}</p>
                            <Checkbox className="h-8 w-8 rounded-full border-gray-900/20 bg-buttons transition-all hover:scale-105 hover:before:opacity-0"
                                checked={selectedUser.includes(teammate.id)}
                                 onChange={() => handleUserSelection(teammate.id)}
                                />
                            </div>
                       
                        )))}
                        </div>
                    </div>
                  </div>
                </div>  
            </div>
       </div>
       {addPopup && 
          <AddMember isOpen={addPopup} closePopup={handleClosePopup} currentUser={userId}
          />
         
        }
       
      </SuperiorLayout>
    </div>
  )
}

export default TeamMembers