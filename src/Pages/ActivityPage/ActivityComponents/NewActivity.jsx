import React, { useState,useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Radio,
} from "@material-tailwind/react";
import { db } from '../../../firebaseConfig';
import { collection, addDoc,getDocs } from 'firebase/firestore';
import {  DateTimePicker , LocalizationProvider} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import emailjs from '@emailjs/browser';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const NewActivity = ({ openPopUp, closePopUp }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [category, setCategory] = useState("Company") 
  const [emails,setEmail] = useState([])

  function onValueChange(event){
    
    setCategory(event.target.value)
}

const showToastMessage = () => {
  toast.success("Publish Success", {
    position: toast.POSITION.TOP_RIGHT,
  });
};

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
  console.log("reached 1")
  try {
    for (const email of emails) {
      const templateParams = {
        recipient: email,
        title:title,
        location:location,
        category:category,
        date:dateTime.toDate(),
      };

      await emailjs.send(
        'service_g75bz1l',
        'template_0xs8nmh',
        templateParams,
        'ZTHToJsyTTCdorWeZ'
      );
    }
    console.log("email sent")
  } catch (error) {
    console.error('Error sending emails', error);
  }
};


  const handlelosePopUp = (e) => {
    if (e.target.id === 'ModelContainer') {
      closePopUp();
    }
  };

 

  if (!openPopUp) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!title || !location || !dateTime ||!category) {
      alert("Please fill in all fields");
      return;
    }
    
    try {

      
          console.log("Emails:", emails); 
          await addDoc(collection(db, "Activity"), {
            title: title,
            location: location,
            category: category, 
            event_date: dateTime.toDate(),
            
          });
          
          alert("success")
          sendEmails();
          showToastMessage();
          closePopUp();
       
      
    } catch (error) {
      console.error("Listing Error", error);
    }
  };
  const formatDate = (date) => !date.seconds
   ? date // Already a javascript date object
   : date.toDate()

 

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <div
      id='ModelContainer'
      onClick={handlelosePopUp}
      className='absolute inset-0 z-50 bg-black flex justify-center items-center bg-opacity-20 backdrop-blur-sm'>
      <div
        className='p-5 bg-primary shadow-inner border-e-emerald-600 rounded-lg py-5'>
        <div>
          <Card color="transparent" shadow={false}>
            <Typography variant="h4" color="blue-gray">
              New Activity
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Enter your details to publish.
            </Typography>
            <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-screen-md sm:w-96">
              <div className="mb-1 flex flex-col gap-4">
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  Title
                </Typography>
                <Input
                 
                  size="lg"
                  placeholder="Activity Title"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                 Location
                </Typography>
                <Input
                  
                  size="lg"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  Date and Time
                </Typography>
                <DateTimePicker
                    label="Controlled picker"
                    value={formatDate(dateTime)}
                    onChange={(newValue) => setDateTime(newValue)}
                    />
               
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  Category
                </Typography>
                <div className="flex gap-2">
                  <Radio name="type" value="Sport" checked={category === "Sport"} onChange={onValueChange}  label="Sports" />
                  <Radio name="type" value="Food" checked={category === "Food"} onChange={onValueChange} label="Food"  />
                  <Radio name="type" value="Company" checked={category === "Company"} onChange={onValueChange} label="Company Related"  />
              </div>
              </div>
              <Button
                type="submit"
                color='white'
                
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
    
    </LocalizationProvider>
  );
};

export default NewActivity;
