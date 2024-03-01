import React, {useEffect, useState} from 'react'
import MainLayout from '../../Layouts/MainLayout'
import { IoMdExit } from "react-icons/io";
import { signOut } from 'firebase/auth';
import { auth ,db } from '../../firebaseConfig';
import {useNavigate} from "react-router-dom"
import { useDispatch,useSelector } from 'react-redux';
import {  selectUser , clearUser } from '../../userSlice';
import { getDocs, collection, query, where , updateDoc , doc} from 'firebase/firestore';
import Points from '../../MainComponents/Points';
import ImageUploader from './ProfileComponents/ImageUploader';
import EditProfile from './ProfileComponents/EditProfile';
import { Button} from "@material-tailwind/react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Profile() {
    
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const [userData, setUserData ] = useState([])
    const [editPopup, setEditPopup] = useState(false);
    const navigate = useNavigate();
    const userType = user?.userProfile.user_type
    const userID = user?.userProfile?.uid
    
    let userrole

    if (userType === "0004"){
       userrole = "normal"
    }
    else if ( userType === "0003"){
      userrole = "superior"
    }
    else if (userType === "0002"){
      userrole = "admin"
    }

    const showToastMessage = (status) => {
        if(status === "editted"){
          toast.success("Edit Success", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      }

      const fetchData = async () => {
        const user = auth.currentUser;

        if (user) {
            const userId = user.uid;

            try {
                const userRef = collection(db, 'Roles', 'Users', 'UserProfile');
                const q = query(userRef, where('uid', '==', userId));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.docs.length > 0) {
                    const data = querySnapshot.docs[0].data();
                    setUserData(data);
                    return data;
                } else {
                    console.error('User profile document not found.');
                }
            } catch (error) {
                console.error('Error fetching user profile document:', error);
            }
        } else {
            console.error('No authenticated user found.');
        }
    };

    
    useEffect(() => {
    fetchData();
}, [])

const handleEditPopup = () => {;
    setEditPopup(true);
  };

  const handleEditRemovePopup = () => {
    setEditPopup(false);
  };

  const handleSaveChanges = async (updatedData) => {
    const userRef = doc(db, 'Roles', 'Users', 'UserProfile' ,userID);
    await updateDoc(userRef, updatedData);

    handleEditRemovePopup();
    showToastMessage("editted");
    const updatedUserData = await fetchData();
    setUserData(updatedUserData);
  };

    const handleLogout = async () => {
        try {
        dispatch(clearUser());
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        await signOut(auth);
        navigate("/login");
        } catch (error) {
        console.error(error);
        }
    }

  return (
    <div>
      <MainLayout>
        <ToastContainer />
      <div className='m-auto container'>
        <div className='container m-3'>
          <div className='m-auto  flex justify-between p-3'>
            <h1 className='m-3 font-bold text-primary md:text-[28px] text-[20px]'>Profile Page</h1>
            </div>
           <div className='container m-auto '>
            <div className=" bg-red-100 rounded-[13px] shadow md:flex">
                    <div className='flex justify-center'>
                    <ImageUploader />
                    </div>
                    <div className=' sm:flex sm:justify-center'>
                        <div className='text-md container sm:p-2 text-center'>
                        <h1 className='pt-10 pb-5 text-black md:text-4xl text-2xl  font-bold' >
                            {userData.firstName} {userData.lastName}
                        </h1>
                        <ul className='container flexp-2 md:text-md text-sm' >
                            <li className='flex py-3 font-bold'>Tel No: <p className='font-normal'>&nbsp;{userData.phone}</p></li>
                            <li className='flex py-3 font-bold'>Email: <p className='font-normal'>&nbsp;{userData.email}</p></li>
                            <li className='flex py-3 font-bold'>Account Type: <p className='font-normal'>&nbsp;{userrole}</p></li>
                        </ul>
                        <Button
                            className="text-buttons my-2 mx-4"
                            variant="text"
                            onClick={() => handleEditPopup(userData)}
                          >
                            Edit
                          </Button>
                        </div>
                    </div>
                <div className="m-auto text-md flex justify-center">
                    <div className="m-4 p-5 md:flex justify-center bg-indigo-500 shadow">
                        <div className=' md:text-3xl text-white font-bold '><Points /></div>
                    </div>
                    <button onClick={handleLogout}>
                        <div  className="m-4  flex justify-between p-5  bg-[#97F6B1] shadow">
                            <p className='md:text-3xl  text-black font-bold pr-5'>Sign Out</p>
                            <IoMdExit className='h-10 w-10 ' />
                        </div>
                        </button>
                    
                </div>
                
                </div>
            </div>
            
            </div>
      </div>
      {userData && (
          <EditProfile
            openPopUp={editPopup}
            closePopUp={handleEditRemovePopup}
            selectedUser={userData}
            onSaveChanges={handleSaveChanges}
          />
        )}
      </MainLayout>
    </div>
  )
}

export default Profile