import React from 'react';
import Navbar from '../MainComponents/Navbar';
import { useSelector } from 'react-redux';
import { selectUser } from '../userSlice';


const AdminLayout = ({ children }) => {
  const user = useSelector(selectUser);
  const userType = user?.userProfile.user_type;
  let userrole;

  if (userType === '0004') {
    userrole = 'normal';
  } else if (userType === '0003') {
    userrole = 'superior';
  } else if (userType === '0002') {
    userrole = 'admin';
  }

  if (userrole === 'admin') {
    return (
      <div>
        <Navbar userRole={userrole} children={children}/>
        
      </div>
    );
  } else {
    return (
      <div className=' h-screen flex items-center justify-center  '>
          <div class=" text-center">
            <div className=''>
            <h1 class=" text-6xl font-semibold text-red-500">404</h1>
            <p class="mb-4 text-lg text-gray-600">Oops! Looks like you're lost.</p>
            </div>
            <div class="animate-bounce">
            <svg class="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            </div>
            <div class="mt-4 text-gray-600">Let's get you back <a href="/" class="text-blue-500">home</a>.</div>
        </div>

      </div>
    );
  }
};

export default AdminLayout;