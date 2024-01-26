import React, { useState,useEffect } from 'react';
import {
  Checkbox,
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { db, imgDB } from '../../firebaseConfig';
import { collection, addDoc ,getDocs} from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import emailjs from '@emailjs/browser';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const NewAnnouncement = ({ openPopUp, closePopUp }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [quote, setQuote] = useState('');
  const [image, setImage] = useState(null);
  const [importance, setImportance] = useState(false);
  const [emails,setEmail] = useState([])
  

  useEffect(() => {   
    const fetchEmail = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Roles', 'Users', 'UserProfile'));
        const emails = querySnapshot.docs.map(doc => doc.data().email);
        setEmail(emails);
      } catch (error) {
        console.error('Error fetching rewards:', error);
        return [];
      }
    };
    fetchEmail();
  }, []);

  const sendEmails = async () => {
    try {
      for (const email of emails) {
        const templateParams = {
          recipient: email,
          title:title,
          quote:quote,
          message:text,
        };

        await emailjs.send(
          'service_g75bz1l',
          'template_f964rh9',
          templateParams,
          'ZTHToJsyTTCdorWeZ'
        );
      }
    } catch (error) {
      console.error('Error sending emails', error);
    }
  };

  const showToastMessage = () => {
    toast.success("Publish Success", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };


  const handlelosePopUp = (e) => {
    if (e.target.id === 'ModelContainer') {
      closePopUp();
    }
  };

  const handleCheckboxChange = () => {
    setImportance(true);
  };

  if (!openPopUp) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!title || !quote|| !text || !image) {
      alert("Please fill in all fields");
      return;
    }
  
    try {
      const fileName = `announcement.${image.name.split('.').pop()}`;
      const fileRef = storageRef(imgDB, `announcement/${fileName}`);
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
          sendEmails();
          // Add the document with the download URL
          await addDoc(collection(db, "announcements"), {
            title: title,
            quote : quote,
            text : text,
            header_image: url, 
            publish_date: new Date(),
            is_important : importance,
          });
          setTitle('');
          setQuote('');
          setText('');
          setImage(null);
          setImportance(false);
          
          closePopUp();
        },
        showToastMessage(),
      );
    } catch (error) {
      console.error("Publish Error", error);
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
      className='absolute inset-0 z-50 bg-black flex justify-center items-center bg-opacity-20 backdrop-blur-sm'>
      <div
        className='p-5 bg-primary shadow-inner border-e-emerald-600 rounded-lg py-5'>
        <div>
          <Card color="transparent" shadow={false}>
            <Typography variant="h4" color="blue-gray">
              New Announcement
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Enter Announcement Details
            </Typography>
            <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-screen-md sm:w-96">
              <div className="mb-1 flex flex-col gap-4">
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  Title
                </Typography>
                <Input
                  size="lg"
                  placeholder="Listing Title"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                 Quote
                </Typography>
                <Input
                  
                  size="lg"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                />
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  Text
                </Typography>
                <Input
                  size="lg"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
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
                checked={importance}
                onChange={handleCheckboxChange}
                label={
                  <Typography
                    variant="small"
                    color="gray"
                    className="flex items-center font-normal"
                  >
                    Important
                  </Typography>
                }
                containerProps={{ className: "-ml-2.5" }}
              />
              <Button
                type="submit"
                color='white'
                onClick={handleFileUpload}
                className="mt-6 bg-buttons"
                fullWidth
              >
                Upload
              </Button>
            </form>
           
            
          </Card>
        </div>
      </div>
      <ToastContainer />
    </div>
    
  );
};

export default NewAnnouncement;
