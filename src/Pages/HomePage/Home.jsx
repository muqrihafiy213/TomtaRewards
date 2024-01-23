import React from 'react'
import MainLayout from '../../Layouts/MainLayout'
import Announcement from './homeComponents/Announcement'
import UpcomingActivity
 from './homeComponents/UpcomingActivity'


function Home() {

  
 

  return (
    <div>
      <MainLayout >
        <div>
        <Announcement />
        </div>
        <div >
            <UpcomingActivity />     
        </div>
        
      {/* <div className="flex min-h-screen ">
        <div className="w-4/12  bg-red-200 rounded shadow  " >
            <ObjectiveAnnouncement />

        </div>
        
    </div> */}
      
      
      </MainLayout>
    </div>
  )
}

export default Home