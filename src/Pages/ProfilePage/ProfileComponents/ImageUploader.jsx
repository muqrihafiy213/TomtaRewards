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
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  const handleOpen = () => setIsWarningOpen(!isWarningOpen);

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

  const handleDeleteImage = async () => {
    try {
      const user = auth.currentUser;
      const userId = user.uid;
      const userProfileRef = doc(collection(db, 'Roles', 'Users', 'UserProfile'), userId);

      await updateDoc(userProfileRef, {
        profile_image: "null",
      });
      fetchImageUrl();
      setIsWarningOpen(false)
    } catch (error) {
      console.error('Delete Error', error);
    }
  };

  return (
    <div className="text-center">
      <div className='group relative '>
      <img
        alt="avatar"
        src={imageUrl ? imageUrl : img}
        className="w-52 h-52 mx-6 mt-10 mb-5 rounded-full shadow"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = img;
          e.target.alt = 'placeholder';
        }}
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
        className="invisible group-hover:visible  
        absolute top-1/2 bottom-1/2 left-0 right-0 bg-blue-500 text-buttons cursor-pointer"
       
      >
        Change Avatar
      </label> 
      {/* <button className="invisible group-hover:visible  
            absolute top-1/2 bottom-1/2 left-0 right-0 bg-blue-500 text-white">Button</button> */}
      </div>
      <button className={`pb-1 ${imageUrl === "null" || null ? "invisible" : "text-buttons visible"}`} onClick={handleOpen}>
        Remove Image
      </button>
      {/* <input
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
      </label> */}
      
      
      {/* {isModalOpen && (
        <div className="modal">
          <img src={URL.createObjectURL(selectedImage)} alt="Selected" />
          <button onClick={handleImageUpload}>Confirm</button>
          <button onClick={() => setIsModalOpen(false)}>Cancel</button>
        </div>
      )} */}
      <Dialog open={isModalOpen} handler={handleOpen}>
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

      {/* Warning dialog */}
      <Dialog size="xs" open={isWarningOpen} >
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>
        <div className="flex   m-auto overflow-hidden">
         Are you sure to remove current photo?
        </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setIsWarningOpen(false)}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="green"  onClick={handleDeleteImage}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>

  );
};

export default ImageUploader;
