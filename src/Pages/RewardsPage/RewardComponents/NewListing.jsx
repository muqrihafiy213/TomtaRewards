import React, { useState } from 'react';
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { db, imgDB } from '../../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewListing = ({ openPopUp, closePopUp }) => {
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [active, setActive] = useState(false);
  
  const showToastMessage = () => {
    toast.success("New Reward Added", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handlelosePopUp = (e) => {
    if (e.target.id === 'ModelContainer') {
      closePopUp();
    }
  };

  const handleCheckboxChange = () => {
    setActive(true);
  };

  if (!openPopUp) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!title || !quantity || !price || !image) {
      alert("Please fill in all fields");
      return;
    }
  
    try {
      const fileName = `${title}.${image.name.split('.').pop()}`;
      const fileRef = storageRef(imgDB, `rewards/${fileName}`);
      const uploadTask = uploadBytesResumable(fileRef, image);
  
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress if needed
        },
        (error) => {
          console.error("Error uploading file:", error);
          alert("Error uploading file. Please try again.");
        },
        async () => {
          // File uploaded successfully
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Add the document with the download URL
          await addDoc(collection(db, "rewards"), {
            name: title,
            quantity: quantity,
            price: price,
            main_image: url, 
            active: active,
            added_on: new Date(),
          });
          setTitle('');
          setQuantity('');
          setPrice('');
          setImage(null);
          setActive(false);
          
          closePopUp();
        },
        showToastMessage(),
      );
    } catch (error) {
      console.error("Listing Error", error);
    }
  };
  

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }

  }

  return (
    <div
      id='ModelContainer'
      onClick={handlelosePopUp}
      className='fixed inset-0 z-50 bg-black flex justify-center items-center bg-opacity-20 backdrop-blur-sm'>
      <div
        className='p-5  bg-primary shadow-inner border-e-emerald-600 rounded-lg md:py-5'>
        <div>
          <Card color="transparent" shadow={false}>
            <Typography variant="h4" color="blue-gray" className='sm:text-[16px]'>
              New Reward
            </Typography>
            <form onSubmit={handleSubmit} className="mt-5 mb-2  max-w-screen-md sm:min-w-fit ">
              <div className="mb-1 grid grid-rows-3 grid-flow-col sm:flex sm:flex-col gap-4 sm:text-[16px]">
                <div>
                <Typography variant="h6" color="blue-gray" className="">
                  Name
                </Typography>
                <Input
                  size="lg"
                  placeholder="Reward Title"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                </div>
                <div>
                <Typography variant="h6" color="blue-gray" className="">
                  Points
                </Typography>
                <Input
                  type='number'
                  size="lg"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                </div>
                <div>
                <Typography variant="h6" color="blue-gray" className="">
                  Quantity
                </Typography>
                <Input
                  type="number"
                  size="lg"
                  placeholder="Insert Total"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                </div>
                <div>
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  Image
                </Typography>
                <Input
                  placeholder="Choose image"
                  accept="image/png,image/jpeg"
                  type="file"
                  variant="standard"
                  onChange={handleImageChange}
                />
                </div>
                 <Checkbox
                checked={active}
                onChange={handleCheckboxChange}
                label={
                  <Typography
                    variant="small"
                    color="gray"
                    className="flex items-center font-normal"
                  >
                    Active
                  </Typography>
                }
                containerProps={{ className: "-ml-2.5" }}
              />
              <Button
                type="submit"
                color='white'
                onClick={handleFileUpload}
                className="mt-4 bg-buttons"
                fullWidth
              >
                Upload
              </Button>
              </div>
             
            </form>
           
            
          </Card>
          
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default NewListing;
