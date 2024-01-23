import React, { useState, useEffect } from 'react';
import { updateDoc, collection, doc, getDoc } from 'firebase/firestore';
import { imgDB, db, auth } from '../../../firebaseConfig';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import img from '../../../Assets/No_avatar.png';
import { Button ,Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter, } from "@material-tailwind/react";

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch the image URL when the component mounts
    fetchImageUrl();
  }, []);

  const fetchImageUrl = async () => {
    try {
      const user = auth.currentUser;
      const userId = user.uid;
      const userProfileRef = doc(collection(db, 'Roles', 'Users', 'UserProfile'), userId);
      const userProfileDoc = await getDoc(userProfileRef);

      if (userProfileDoc.exists()) {
        const userData = userProfileDoc.data();
        if (userData.profile_image) {
          setImageUrl(userData.profile_image);
        }
      }
    } catch (error) {
      console.error('Error fetching image URL', error);
    }
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
    setIsModalOpen(true);
  };

  const handleImageUpload = async () => {
    try {
      if (selectedImage) {
        const fileName = `userProfile.${selectedImage.name.split('.').pop()}`;
        const fileRef = storageRef(imgDB, `userProfile/${fileName}`);
        const uploadTask = uploadBytesResumable(fileRef, selectedImage);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Handle progress if needed
          },
          (error) => {
            console.error('Error uploading file:', error);
            alert('Error uploading file. Please try again.');
          },
          async () => {
            // File uploaded successfully
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            setImageUrl(url); // Update the imageUrl state

            const user = auth.currentUser;
            const userId = user.uid;
            const userProfileRef = doc(collection(db, 'Roles', 'Users', 'UserProfile'), userId);

            await updateDoc(userProfileRef, {
              profile_image: url,
            });

            // Optional: You can also refetch the image URL after updating the document
            fetchImageUrl();
          }
        );
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Upload Error', error);
    }
  };

  return (
    <div className="text-center">
      <img
        alt="avatar"
        src={imageUrl || img}
        className="w-52 h-52 mx-6 my-10 rounded-full shadow"
      />

      <input
        type="file"
        id="uploadInput"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />
      <label
        htmlFor="uploadInput"
        className="cursor-pointer text-buttons"
       
      >
        Change Avatar
      </label>

      
      {/* {isModalOpen && (
        <div className="modal">
          <img src={URL.createObjectURL(selectedImage)} alt="Selected" />
          <button onClick={handleImageUpload}>Confirm</button>
          <button onClick={() => setIsModalOpen(false)}>Cancel</button>
        </div>
      )} */}
      <Dialog open={isModalOpen} >
        <DialogHeader>Confirm Profile</DialogHeader>
        <DialogBody>
        <div className="flex fixed-container  overflow-hidden">
        <img className="p-5 shadow m-auto object-contain image" src={selectedImage && URL.createObjectURL(selectedImage)} alt="Selected" />
        </div>
         
          
        
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setIsModalOpen(false)}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="green"  onClick={handleImageUpload}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>

  );
};

export default ImageUploader;
