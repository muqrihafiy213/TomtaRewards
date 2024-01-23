import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Radio,
} from "@material-tailwind/react";
import { db } from '../../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import {  DateTimePicker , LocalizationProvider} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'



const NewActivity = ({ openPopUp, closePopUp }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [category, setCategory] = useState("Company") 

  function onValueChange(event){
    
    setCategory(event.target.value)
}


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
          await addDoc(collection(db, "Activity"), {
            title: title,
            location: location,
            category: category, 
            event_date: dateTime.toDate(),
            
          });
         
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
        className='p-5 bg-secondary shadow-inner border-e-emerald-600 rounded-lg py-5'>
        <div>
          <Card color="transparent" shadow={false}>
            <Typography variant="h4" color="blue-gray">
              New Activity
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Enter your details to list.
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
    </div>
    </LocalizationProvider>
  );
};

export default NewActivity;
