import React, { useState,useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Radio,
  Select,
  Option,
} from "@material-tailwind/react";
import { db } from '../../../firebaseConfig';
import { collection, addDoc,getDocs } from 'firebase/firestore';
import {  DateTimePicker , LocalizationProvider,renderTimeViewClock} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import emailjs from '@emailjs/browser';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const NewActivity = ({ openPopUp, closePopUp }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState('1 Hour');
  const [category, setCategory] = useState("Company") 
  const [emails,setEmail] = useState([])

  function onValueChange(event){
    
    setCategory(event.target.value)
}

const showToastMessage = () => {
  console.log("masukmessage")
  toast.success("Activity Success", {
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
        // duration:duration,
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
  
    if (!title || !location || !dateTime ||!category ) {
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
            duration:duration,
            
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
    <ToastContainer />
    <div
      id='ModelContainer'
      onClick={handlelosePopUp}
      className='fixed inset-0 z-50 bg-black flex justify-center items-center bg-opacity-20 backdrop-blur-sm'>
      <div
        className='p-5 bg-primary shadow-inner border-e-emerald-600 rounded-lg md:py-5'>
        <div>
          <Card color="transparent" shadow={false}>
            <Typography variant="h4" color="blue-gray" className='sm:text-[14px]'>
              New Activity
            </Typography>
            <form onSubmit={handleSubmit} className="mt-5 mb-2  max-w-screen-md sm:min-w-fit ">
              <div className="mb-1 grid grid-rows-3 grid-flow-col sm:flex sm:flex-col gap-4 sm:text-[10px]">
                <div>
                <Typography variant="h6" color="blue-gray" className=" sm:text-[12px]">
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
                </div>
               <div>
               <Typography variant="h6" color="blue-gray" className=" sm:text-[12px]">
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
               </div>
               <div>
                <Typography variant="h6" color="blue-gray" className=" sm:text-[12px]">
                  Category
                </Typography>
                <div className="flex gap-2">
                  <Radio name="type" value="Sport" checked={category === "Sport"} onChange={onValueChange}  label="Sports" />
                  <Radio name="type" value="Food" checked={category === "Food"} onChange={onValueChange} label="Food"  />
                  <Radio name="type" value="Company" checked={category === "Company"} onChange={onValueChange} label="Company Related"  />
              </div>
                </div>
              <div >
              <Typography variant="h6" color="blue-gray" className=" sm:text-[12px]">
                  Date and Time
                </Typography>
                <DateTimePicker
                    className='sm:text-[12px]'
                    value={formatDate(dateTime)}
                    onChange={(newValue) => setDateTime(newValue)}
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                      
                    }}
                    />
                </div>
                <Select
                  label="Select Duration"
                  value={duration}
                  onChange={(val) => setDuration(val)}
                >
                  <Option value="1 Hour">1 Hour</Option>
                  <Option value="1 Hour and a half">1 Hour and a half</Option>
                  <Option value="2 Hours">2 Hours</Option>
                  <Option value="2 Hours and a half">2 Hours and a half</Option>
                  <Option value="Whole Day">Whole Day</Option>
                </Select>
                <Button
                type="submit"
                color='blue-gray'
                
                className="mt-6 bg-buttons"
                fullWidth
              >
                Create
              </Button>
              </div>
             
            </form>
           
            
          </Card>
        </div>
      </div>
    
    </div>
    
    </LocalizationProvider>
  );
};

export default NewActivity;
