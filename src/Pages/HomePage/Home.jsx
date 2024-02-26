import React from 'react'
import MainLayout from '../../Layouts/MainLayout'
import Announcement from './homeComponents/Announcement'
import UpcomingActivity
 from './homeComponents/UpcomingActivity'
import NextActivity from './homeComponents/NextActivity'


function Home() {

  
 

  return (
    <div>
      <MainLayout >
        <div>
        <Announcement />
        <div className='md:flex '>
          <div className='md:w-1/2'>
          <NextActivity />
          </div>
           <div className='md:w-1/2'>
           <UpcomingActivity />
           </div>
        </div>
        
        </div>
     
      
      
      </MainLayout>
    </div>
  )
}

export default Home