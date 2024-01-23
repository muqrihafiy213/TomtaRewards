import React,{useEffect,useState} from 'react'
import { db , imgDB } from '../../firebaseConfig'
import { Checkbox, Button ,Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter, } from "@material-tailwind/react";
import img from "../../Assets/No_avatar.png"
import { ref , getDownloadURL as getImgDownloadURL } from 'firebase/storage';
import { getDocs, collection,  onSnapshot, where,query, setDoc , doc ,updateDoc} from 'firebase/firestore';
import { updateUserPoints } from './Components/GivePoints';
import AdminLayout from '../../Layouts/AdminLayout';

function UserList() {

    const [usersData, setUsersData] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedPoints, setSelectedPoints] = useState(null);
    
    const [open, setOpen] = React.useState(false);
     
    const superiorUserData = usersData.filter((users) => {
      const userType = users.user_type ;
      return userType === '0003';
    });

    const normalUserData = usersData.filter((users) => {
      const userType = users.user_type ;
      return userType === '0004';
    });
    

    const handleOpen = () => {
      if ( selectedUsers.length === 0) {
        alert('Please choose at least one user');
        return;
      }
      setOpen(!open);}

    const handleGrantSuperior = async () =>{
      if ( selectedUsers.length === 0) {
        alert('Please choose at least one user');
        return;
      }
      for (const userId of selectedUsers) {
        try {
          const userRef = collection(db, 'Roles', 'Users', 'UserProfile');
          const q = query(userRef, where('uid', '==', userId));
          const querySnapshot = await getDocs(q);
  
          if (querySnapshot.docs.length > 0) {
            const user = querySnapshot.docs[0];
            const superiorUserRef = collection(db, 'Roles', 'Superior User', 'UserProfile');
            const userProfileRef = doc(collection(db, 'Roles', 'Users', 'UserProfile'), userId);

            await updateDoc(userProfileRef, {
              user_type: "0003",
            });
            await setDoc(doc(superiorUserRef, userId), user.data());
            alert('User Promoted Successfully');  
            
          } else {
            console.error(`User with ID ${userId} not found.`);
          }
        } catch (error) {
          console.error('Error Granting Superior Access', error);
        }
      }
  
      // Clear selected users and points after giving points
      setSelectedUsers([]);
    
    };

    const handleUserClick = (userId) => {
        
        setSelectedUsers((prevSelectedUsers) =>
          prevSelectedUsers.includes(userId)
            ? prevSelectedUsers.filter((id) => id !== userId)
            : [...prevSelectedUsers, userId]
        );
        console.log(selectedUsers.firstName)
      };
    
      const handleGivePoints = async () => {
        if ( selectedPoints === 0) {
          alert('Please choose points');
          return;
        }
    
        // Update points for selected users
        for (const userId of selectedUsers) {
          try {
            const userRef = collection(db, 'Roles', 'Users', 'UserProfile');
            const q = query(userRef, where('uid', '==', userId));
            const querySnapshot = await getDocs(q);
    
            if (querySnapshot.docs.length > 0) {
              const user = querySnapshot.docs[0];
              const currentPoints = user.data().points || 0;
    
              // Update points for the user
              await updateUserPoints(userId, currentPoints + selectedPoints);
            } else {
              console.error(`User with ID ${userId} not found.`);
            }
          } catch (error) {
            console.error('Error updating user points:', error);
          }
        }
    
        // Clear selected users and points after giving points
        setSelectedUsers([]);
        setSelectedPoints(0);
    
        alert('Points given successfully!');
      };

    useEffect(() => {
        
        const fetchData = async () => {
          try {
            const querySnapshot = await getDocs(collection(db, 'Roles', 'Users', 'UserProfile'));
            const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            return data;
          } catch (error) {
            console.error('Error fetching rewards:', error);
            return [];
          }
        };
      
        // Fetch image function
        async function fetchImageData(users) {
            const updatedUsersData = await Promise.all(
              users.map(async (user) => {
                if (!user.profile_image) {
                  return { ...user, imageUrl: null };
                }
          
                const imageRef = ref(imgDB, user.profile_image);
                try {
                  const url = await getImgDownloadURL(imageRef);
                  return { ...user, imageUrl: url };
                } catch (error) {
                  console.error('Error fetching image:', error);
                  return { ...user, imageUrl: null };
                }
              })
            );
            setUsersData(updatedUsersData);
          };
      
        // Real-time updates
        const unsubscribe = onSnapshot(collection(db, 'Roles', 'Users', 'UserProfile'), (snapshot) => {
          const updatedData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          fetchData(updatedData);
        });
      
        // Fetch data and images on component mount
        async function fetchAllData() {
          const data = await fetchData();
          fetchImageData(data);
        };
      
        fetchAllData();
      
        // Clean up the subscription when the component unmounts
        return () => unsubscribe();
      }, []);

  return (
    <div>
      <AdminLayout>
      <div className='m-auto container'>
        <div className='container m-3'>
          <div className='m-auto  flex justify-between p-3'>
            <h1 className='m-3 font-bold text-primary text-[28px]'>Superiors</h1>
            <div className='flex '>
            <Button
                            className='bg-buttons m-2 text-white '
                            size="md"
                            ripple="light"
                            color='white'
                            onClick={handleOpen}
                            >
                            Recognize
             </Button> 
            </div>
            
            
          </div>
          <div className='container mx-auto grid md:grid-cols-2 gap-6'>
          { superiorUserData.length === 0 ? (
                <div className='m-auto container flex justify-center'>
                  <div className='p-10'>No Users Available</div>
                </div>
              ) : (
            superiorUserData.map((user) => (
            <div key={user.id}>
                <div className='flex bg-primary rounded-[99px] shadow-xl p-2'>
                <div className='mx-2'>
                {user.imageUrl ? (
                      <img
                        className=' shadow m-auto  w-16 h-16 rounded-full'
                        src={user.imageUrl}
                        alt={user.firstName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = {img};
                          e.target.alt = 'placeholder';
                        }}
                      />
                    ) : (
                      <img
                        className='shadow m-auto  w-16 h-16 rounded-full'
                        src={img}
                        alt='placeholder'
                      />
                    )}
                </div>
                <p className='m-auto text-white'>{user.firstName}{user.lastName}</p>
              
                </div>
            </div>
            )))
          }
          </div>
        </div>
      <div className='container m-3 '>
          <div className='m-auto  flex justify-between p-3'>
            <h1 className='m-3 font-bold text-primary text-[28px]'>Users</h1>
            <div className='flex '>
            <Button
                            className='bg-buttons m-2 text-white '
                            size="md"
                            ripple="light"
                            color='white'
                            onClick={handleGrantSuperior}
                            >
                            Grant Superior
            </Button> 
            </div>
            
            
          </div>
          <div className='container mx-auto grid md:grid-cols-2 gap-6'>
          { normalUserData.length === 0 ? (
                <div className='m-auto container flex justify-center'>
                  <div className='p-10'>No Users Available</div>
                </div>
              ) : (
            normalUserData.map((user) => (
            <div key={user.id}>
                <div className='flex bg-primary rounded-[99px] shadow-xl p-2'>
                <div className='mx-2'>
                {user.imageUrl ? (
                      <img
                        className=' shadow m-auto  w-16 h-16 rounded-full'
                        src={user.imageUrl}
                        alt={user.firstName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = {img};
                          e.target.alt = 'placeholder';
                        }}
                      />
                    ) : (
                      <img
                        className='shadow m-auto  w-16 h-16 rounded-full'
                        src={img}
                        alt='placeholder'
                      />
                    )}
                </div>
                <p className='m-auto text-white'>{user.firstName}{user.lastName}</p>
                <Checkbox className="h-8 w-8 rounded-full border-gray-900/20 bg-buttons transition-all hover:scale-105 hover:before:opacity-0"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserClick(user.id)}
                />
                </div>
            </div>
            )))
          }
          </div>
        </div>
      </div>
        <Dialog open={open} handler={handleOpen}>
        <DialogHeader>Choose Recognition</DialogHeader>
        <DialogBody>
        
         <div className='row '>
          <div className='flex justify-center'>{selectedPoints}</div>  
          <div className='flex gap-4 p-2'>
            <Button
                color="blue"
                onClick={() => setSelectedPoints(10)}
              >
                Applause (10)
              </Button>
              <Button
                color="red"
                onClick={() => setSelectedPoints(20)}
              >
                Bravo (20)
              </Button>
              <Button
                color="green"
                onClick={() => setSelectedPoints(30)}
              >
                Cheers (30)
              </Button>
              <Button
                color="amber"
                onClick={() => setSelectedPoints(40)}
              >
                Delight (40)
              </Button>
              <Button
                color="indigo"
                onClick={() => setSelectedPoints(50)}
              >
                Extraordinary (50)
              </Button>
          </div>     
         </div>
        
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="green"  onClick={() => {
                handleGivePoints();
                handleOpen();
              }}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
      </AdminLayout>
    </div>
  )
}

export default UserList