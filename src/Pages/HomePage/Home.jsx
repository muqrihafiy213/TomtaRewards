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
        <div className='md:flex'>
        <div className='md:w-3/5'>
        <Announcement />
        </div>
        <div className='md:w-2/5 md:py-2'>
            <NextActivity />
            <UpcomingActivity />     
        </div>
        
        </div>
     
      
      
      </MainLayout>
    </div>
  )
}

export default Home