import React, { useState } from 'react'
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch,useSelector } from 'react-redux';
import { setUser, selectUser } from '../userSlice';
import { doc, getDoc, collection } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Login = () => {
  
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const currentUser = useSelector(selectUser);
  const navigate = useNavigate();
  
  const showToastMessage = (status) => {
    if(status === "success"){
      toast.success("Thanks For Participating", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    else if(status === "incorrect"){
      toast.error("The email address or password is incorrect!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    else if(status === "unverified"){
      toast.warning("Please Verify Email!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  
  const fetchUserProfile = async (userId) => {
    const userProfileRef = doc(collection(db, 'Roles', 'Users', 'UserProfile'), userId);
    const userProfileSnapshot = await getDoc(userProfileRef);

    if (userProfileSnapshot.exists()) {
      const userProfile = userProfileSnapshot.data();
      dispatch(setUser({ ...currentUser, userProfile }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (user.emailVerified) {
            localStorage.setItem('token', user.accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            await fetchUserProfile(user.uid);
            showToastMessage("success");
            navigate("/");
        } else {
            showToastMessage("unverified");
        }
    } catch (e) {
        if (e.code === "auth/invalid-credential") {
            showToastMessage("incorrect");
        } else {
            showToastMessage("error: " + e.code); // Handle other Firebase errors
        }
        console.log("error", e.message);
    }
}
  
  return (
    
    <div class="area w-full  justify-center  flex items-center">
      <ToastContainer />
			<ul class="circles">
				<li></li>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
			</ul>
    <div className=' md:w-1/3 mx-1'>
    <div className='relative '>
        <div className='  bg-white mx-auto shadow-xl   p-4  rounded-lg hover:scale-105 duration-300'>
        <p className=' text-secondary lg:text-[28px] xs:text-[18px] font-bold text-center'>Tomta Rewards</p>
            <form onSubmit={handleSubmit} className='flex flex-col'>
                <label htmlFor='email' className='mt-2 font-bold'>
                 Email
               </label>
                <input className=' rounded-[5px] w-full border border-black p-2 text-[12px] md:text-[14px]'
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                
                />
                <label htmlFor='password' className='mt-2 font-bold'>
                 Password
               </label>
                <input className='w-full rounded-[5px] border border-black p-2'
                type="password"
                placeholder="Your Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
               
                <button  type="submit" className='bg-buttons rounded-md shadow  text-white my-3 mx-auto p-3'>Sign In</button>
            </form>
            <p className='text-center'>New User? <Link to="/signup" className='text-buttons '>Join Now</Link></p>
        </div>
  </div>
 </div>
</div>
  )
}

export default Login