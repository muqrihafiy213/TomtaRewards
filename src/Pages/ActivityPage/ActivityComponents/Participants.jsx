import React, { useState, useEffect } from 'react';
import {
  Button,
} from "@material-tailwind/react";
import { Transition } from '@headlessui/react';


const Participants = ({ openPopUp, closePopUp, selectedActivity }) => {
  
    const [participantsData, setParticipantsData] = useState([]);

    useEffect(() => {
    const fetchParticipants = async () => {
      try {
        // Assume participants are stored directly in the `selectedActivity` object
        const participants = selectedActivity.participants || [];
        setParticipantsData(participants);
      } catch (error) {
        console.error('Error fetching participants:', error);
      }
    };

    if (selectedActivity) {
      fetchParticipants();
    }
  }, [selectedActivity]);

  return (
    <div
      className='absolute inset-0 z-50 bg-black flex justify-center items-center bg-opacity-20 backdrop-blur-sm'>
      <Transition show={openPopUp} as="div" className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as="div"
            className="fixed inset-0 transition-opacity"
            onClick={closePopUp}
          >
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </Transition.Child>

          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
          &#8203;
          <Transition.Child
        as="div"
        className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full sm:max-w-lg"
      >
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              {/* ... SVG icon */}
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedActivity.title}</h3>
              <div className="mt-2">
                {participantsData.length === 0 ? (
                  <p>No participants yet.</p>
                ) : (
                  <ul className="list-disc pl-4">
                    {participantsData.map((participant, index) => (
                      <li key={index}>{participant.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <Button color="light-blue" onClick={closePopUp} ripple="light">
            Close
          </Button>
        </div>
      </Transition.Child>
        </div>
      </Transition>
    </div>
  );
};

export default Participants;