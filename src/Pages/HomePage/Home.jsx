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
        <div className='flex'>
        <div className='w-3/5'>
        <Announcement />
        </div>
        <div className='w-2/5 py-2'>
            <NextActivity />
            <UpcomingActivity />     
        </div>
        
        </div>
     
      
      
      </MainLayout>
    </div>
  )
}

export default Home