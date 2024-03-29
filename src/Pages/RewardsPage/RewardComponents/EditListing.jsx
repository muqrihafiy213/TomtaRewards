import React, { useState } from 'react';
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useSelector } from 'react-redux';
import {  selectUser } from '../../../userSlice';


const EditListing = ({ openPopUp, closePopUp, selectedReward, onSaveChanges }) => {

  const [title, setTitle] = useState(selectedReward.name);
  const [quantity, setQuantity] = useState(selectedReward.quantity);
  const [price, setPrice] = useState(selectedReward.price);
  const [active, setActive] = useState(selectedReward.active);
  const user = useSelector(selectUser);
  const userName = user?.userProfile?.firstName + ' ' + user?.userProfile?.lastName;
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') setTitle(value);
    else if (name === 'quantity') setQuantity(value);
    else if (name === 'price') setPrice(value);
    else if (name === 'active') setActive(value);
  };

  const handleCheckboxChange = () => {
    setActive((prev) => !prev);
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
              Edit Rewards
            </Typography>
            <form  className="mt-8 mb-2 w-80 max-w-screen-md sm:w-96">
              <div className="mb-1 flex flex-col gap-4">
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  Name
                </Typography>
                <p>{title}</p>
                <Typography variant="h6" color="blue-gray" className="-mb-3">
                  Points
                </Typography>
                <Input
                  type='number'
                  size="lg"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  name="price"
                  value={price}
                  onChange={ handleInputChange}
                />
                <Typography variant="h6" color="blue-gray" className="-mb-3">
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
                  name="quantity"
                  value={quantity}
                  onChange={ handleInputChange}
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
                onClick ={() => {
                    onSaveChanges({ title, quantity, price, active, last_update: new Date() , 
                    edited_by: userName });
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

export default EditListing;
