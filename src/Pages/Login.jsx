import React, { useState } from 'react'
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch,useSelector } from 'react-redux';
import { setUser, selectUser ,setError } from '../userSlice';
import { doc, getDoc, collection } from 'firebase/firestore';

const Login = () => {
  
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const currentUser = useSelector(selectUser);
  const navigate = useNavigate();
  
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
      
      localStorage.setItem('token', user.accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      await fetchUserProfile(user.uid);
      navigate("/");

    } catch (error) {
        if (error.code === "auth/invalid-credential") {
            alert("the email address or password is incorrect ");
        }
        dispatch(setError(error.message));
      console.error(error);
    }
  }
  console.log('User from Redux in component:', currentUser);
  return (
    
    <div class="area">
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
    <div className='w-full p-[2.3rem] px-4  justify-center items-center inline-flex'>
    <div className='w-[480px] h-[500px] relative'>
        <div className='w-2/3 justify-center items-center bg-white mx-auto mt-20 shadow-xl flex flex-col p-4  rounded-lg hover:scale-105 duration-300'>
        <h1 className=' text-secondary text-[30px] font-medium items-center justify-center'>Tomta Rewards</h1>
            <form onSubmit={handleSubmit} className='flex flex-col'>
                <input className='my-4 rounded-[5px] border border-black'
                type="email"
                placeholder="Your Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
                <input className=' rounded-[5px] border border-black'
                type="password"
                placeholder="Your Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <button  type="submit" className='bg-buttons rounded-md shadow w-[200px] text-white my-3 mx-auto py-3'>Sign In</button>
            </form>
            <p>No Existing Account? <Link to="/signup" className='text-buttons'>Create Account</Link></p>
        </div>
  </div>
 </div>
</div>
  )
}

export default Login