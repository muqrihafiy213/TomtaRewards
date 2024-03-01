import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'

const EditProfile = ({ openPopUp, closePopUp, selectedUser, onSaveChanges }) => {
    
  const [firstName, setFirstName] = useState(selectedUser.firstName);
  const [lastName, setLastName] = useState(selectedUser.lastName);
  const [phone, setPhone] = useState(selectedUser.phone);
   
  useEffect(() => {
    if (selectedUser) {
      setFirstName(selectedUser.firstName || '');
      setLastName(selectedUser.lastName || '');
      setPhone(selectedUser.phone || '');
    }
  }, [selectedUser]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'firstName') setFirstName(value);
    else if (name === 'lastName') setLastName(value);
   
  };


  const handleLosePopUp = (e) => {
    if (e.target.id === 'ModelContainer') {
      closePopUp();
    }
  };

  if (!openPopUp) return null;

  return (
    <div
      id='ModelContainer'
      onClick={handleLosePopUp}
      className='fixed inset-0 z-50 bg-black flex justify-center items-center bg-opacity-20 backdrop-blur-sm overscroll-y-none overflow-hidden '>
      <div
        className='p-5 bg-primary shadow-inner border-e-emerald-600 rounded-lg py-5'>
        <div>
          <Card color="transparent" shadow={false}>
            <Typography variant="h4" color="blue-gray">
              Edit Profile
            </Typography>
            <form  className="mt-8 mb-2 w-80 max-w-screen-md sm:w-96">
              <div className="mb-1 flex flex-col gap-4">
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  First Name
                </Typography>
                <Input
                  type='text'
                  size="lg"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  name="firstName"
                  value={firstName}
                  onChange={ handleInputChange}
                />
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  Last Name
                </Typography>
                <Input
                  type='text'
                  size="lg"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  name="lastName"
                  value={lastName}
                  onChange={ handleInputChange}
                />
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  Phone Number
                </Typography>
                <PhoneInput
                  placeholder="Insert Phone Number"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  name="phone"
                  value={phone}
                  onChange={setPhone}
                />
              </div>
              <Button
                onClick ={() => {
                    onSaveChanges({ firstName,lastName,phone });
                  }}
                className="mt-6 bg-buttons"
                fullWidth
              >
                Save
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
