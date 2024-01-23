import React, {useEffect, useState} from 'react'
import MainLayout from '../../Layouts/MainLayout'
import { IoMdExit } from "react-icons/io";
import { signOut } from 'firebase/auth';
import { auth ,db } from '../../firebaseConfig';
import {useNavigate} from "react-router-dom"
import { useDispatch,useSelector } from 'react-redux';
import {  selectUser , clearUser } from '../../userSlice';
import { getDocs, collection, query, where } from 'firebase/firestore';
import Points from '../../MainComponents/Points';
import ImageUploader from './ProfileComponents/ImageUploader';

function Profile() {
    
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const userName = user?.userProfile?.firstName + ' ' + user?.userProfile?.lastName;
    const [userData, setUserData ] = useState([])
    const navigate = useNavigate();
    const userType = user?.userProfile.user_type
    
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
    
    useEffect(() => {
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

    fetchData();
}, [])

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
                            {userName}
                        </h1>
                        <ul className='container p-2 md:text-md text-sm' >
                            <li className='py-3'>Tel No: 019234567</li>
                            <li className='py-3'>Email :{userData.email}</li>
                            <li className='py-3'>Account Type: {userrole} </li>
                        </ul>
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
      </MainLayout>
    </div>
  )
}

export default Profile