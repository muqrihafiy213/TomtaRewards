import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig'; 
import { createUserWithEmailAndPassword , sendEmailVerification } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../userSlice';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validEmailDomains = ["tomtatechnology.com", "gosumconsultinggroup.com"];

    try {
        // Validate email domain
        const isEmailValid = validEmailDomains.some(domain => email.endsWith(`@${domain}`));
        if (!isEmailValid) {
            alert('Please use Organization Email Only');
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send email verification
        await sendEmailVerification(user);

     
        alert('Verification email sent. Please check your inbox and click on the verification link before proceeding.');

        
        while (!user.emailVerified) {
            // Reload the user object to get the latest information
            await user.reload();
            // Wait for a short interval before checking again
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Save user information to UserProfile subcollection
        const userProfileRef = doc(collection(db, 'Roles', 'Users', 'UserProfile'), user.uid);
        await setDoc(userProfileRef, {
            uid: user.uid,
            firstName: firstName,
            lastName: lastName,
            email: user.email,
            points: 0,
            user_type: "0004",
            superior: "none",
        });

        dispatch(setUser({
            uid: user.uid,
            firstName: firstName,
            lastName: lastName,
            email: user.email,
            points: 0,
        }));

        // Save user information to local storage
        localStorage.setItem('token', user.accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        // Navigate to the desired page after successful verification
        navigate(`/login`);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            alert('Email already in use');
        } else if (error.code === 'auth/weak-password') {
            alert('The password is too weak.');
        } else {
            console.error('Error', error);
        }
    }
};

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
          <h1 className='text-secondary text-[30px] font-medium items-center justify-center'>Registration</h1>
          <form onSubmit={handleSubmit} className='flex flex-col'>
          <label htmlFor='firstName' className='mt-2'>
              First Name:
            </label>
            <input
              className='rounded-[5px] border border-black'
              type='text'
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <label htmlFor='LastName' className='mt-2'>
              Last Name:
            </label>
            <input
              className='rounded-[5px] border border-black'
              type='text'
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <label htmlFor='email' className='mt-2'>
              Email:
            </label>
            <input
              className='rounded-[5px] border border-black'
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor='password' className='mt-2'>
              Password:
            </label>
            <input
              className='rounded-[5px] border border-black'
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type='submit' className='bg-buttons rounded-md shadow w-[200px] text-white my-3 mx-auto py-3'>
              SIGNUP
            </button>
          </form>
          <p>
            Need to Login? <Link to='/login' className='text-buttons'>
              Login
            </Link>
          </p>
        </div>
      </div>
     </div>
    </div>
  );
};

export default Signup;
