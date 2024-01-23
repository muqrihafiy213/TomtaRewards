import React, { useState, useEffect } from 'react';
import { auth, db, imgDB } from '../firebaseConfig';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, addDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const SignupForm = () => {
  const userAuth = auth;
  const user = userAuth.currentUser;
  const { uid } = useParams();
  const [formData, setFormData] = useState({
    uid: uid || '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    // Add other profile fields
  });
  const [photo, setPhoto] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch existing user profile data if available
    if (user) {
      const userRef = doc(db, 'Roles', 'Users', uid, 'UserProfile');
      getDoc(userRef)
        .then((doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setFormData(userData);
          }
        })
        .catch((error) => {
          console.error('Error fetching user profile data:', error);
        });
    }
  }, [user, uid]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.gender) {
      alert('Please fill in all required fields.');
      return;
    }
  
    // Phone number validation (assuming a simple format, you might need a more robust validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      alert('Please enter a valid phone number (10 digits).');
      return;
    }
  
    try {
      // Upload the photo to Firebase Storage if a new photo is selected
      let photoURL = formData.photoURL; // Default to existing photo URL

      if (photo) {
        const storageRef = ref(imgDB, `userPhotos/${uid}/${photo.name}`);
        await uploadBytes(storageRef, photo);
        photoURL = await getDownloadURL(storageRef);
      }

      // Save/update profile data to Firestore, including the user's email and photo URL
      await addDoc(collection(db, 'Roles', 'Users','UserProfile'), {
        ...formData,
        email: user.email,
        photoURL,
        // Add other profile fields
      });

      console.log('Profile Form Data saved to Firestore');
      // Redirect the user or perform any other actions
      navigate('/login'); // Replace with your desired route
    } catch (error) {
      console.error('Error saving profile data to Firestore: ', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="firstName" className="block text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="lastName" className="block text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="phoneNumber" className="block text-gray-700">
            Phone Number
          </label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="gender" className="block text-gray-700">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="photo" className="block text-gray-700">
            Photo
          </label>
          <input
            type="file"
            id="photo"
            name="photo"
            onChange={handlePhotoChange}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        {/* ... (other form fields) */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default SignupForm;

