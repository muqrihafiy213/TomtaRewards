import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, where,query } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import {
  Checkbox,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
  } from "@material-tailwind/react";

const PopupComponent = ({  isOpen, closePopup, currentUser }) => {
  const [usersWithNoSuperior, setUsersWithNoSuperior] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
 
 
  const handleClose = () => {
        closePopup()
        
    }

  useEffect(() => {
    const fetchUsersWithNoSuperior = async () => {
      const userRef = collection(db, 'Roles', 'Users', 'UserProfile');
            const q = query(userRef, where('superior', '==', 'none'));
            const querySnapshot = await getDocs(q);
      
      const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsersWithNoSuperior(users);
    };

    fetchUsersWithNoSuperior();
  }, []);

  const handleUserSelection = (userId) => {
    setSelectedUser(userId);
  };

  const handleAddToTeam = async () => {
    if ( selectedUser.length === 0) {
      alert('Please choose at least one user');
      return;
    }
    if (selectedUser) {
      try {
        const userDocRef = doc(db, 'Roles', 'Users', 'UserProfile', selectedUser);
        await updateDoc(userDocRef, { superior: currentUser });
        const updatedUsers = usersWithNoSuperior.filter(user => user.id !== selectedUser);
        setUsersWithNoSuperior(updatedUsers);
        setSelectedUser(null);
        closePopup()
        alert("User Added Succesfully")
        
      } catch (error) {
        console.error('Error Granting Superior Access', error);
        console.log(currentUser)
      }
       
    
      
    }
  };
 
  
  return (
    <div>
        <Dialog open={isOpen} aria-labelledby="add-users-dialog-title" size='xs'>
        <DialogHeader>Add Users to Your Team</DialogHeader>
        <DialogBody>
        <div className='container '>
        { usersWithNoSuperior.length === 0 ? (
                <div className='m-auto container flex justify-center'>
                  <div className='p-10'>No Users Available</div>
                </div>
              ) : (
        usersWithNoSuperior.map(user => (
          <div key={user.id} className='bg-secondary m-1 rounded-md flex justify-between'>
              <div>{user.firstName} - {user.email}</div>
              <Checkbox className="h-4 w-4 rounded-full border-gray-900/20 bg-buttons transition-all hover:scale-105 hover:before:opacity-0"
                  checked={selectedUser.includes(user.id)}
                  onChange={() => handleUserSelection(user.id)}
                />
          </div>
          
        )))}
      </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleClose}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="green" onClick={handleAddToTeam}>
            <span>Add to Team</span>
          </Button>
        </DialogFooter>
      </Dialog>
      
    </div>
  );
};

export default PopupComponent;
