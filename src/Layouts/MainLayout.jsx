import React from 'react'
import Navbar from '../MainComponents/Navbar'
import { useSelector } from 'react-redux'
import { selectUser } from '../userSlice'

const MainLayout = ({ children }) => {
  const user = useSelector(selectUser);
  const userType = user?.userProfile.user_type
  let userrole

  if (userType === "0004"){
     userrole = "normal"
  }
  else if ( userType === "0003"){
    userrole = "superior"
  }
  else if (userType === "0002"){
    userrole = "admin"
  }
  // console.log(userrole)
  return (
    <div>
      <Navbar userRole={userrole}/>
       {children}
    </div>
  )
}

export default MainLayout