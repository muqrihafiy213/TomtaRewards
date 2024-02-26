import React, {useEffect, useState, useRef } from 'react'
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai'
import { Link, useMatch, useResolvedPath } from "react-router-dom"
import Avatar from './Avatar'
import Points from './Points'


const Navbar = ({userRole}) => {
  const [nav, setNav] = useState(false)
  const navRef = useRef(null);
  const buttonRef = useRef(null);

  const handleNav = () => {
    setNav(!nav)
  }

  const handleOutsideClick = (event) => {
    if (
      navRef.current &&
      !navRef.current.contains(event.target) &&
      event.target !== buttonRef.current
    ) {
      setNav(false);
    }
  };


  useEffect(() => {
    if(nav){
      document.body.classList.add("overflow-hidden")
    }
    else {
      document.body.classList.remove("overflow-hidden")
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
   },);

   const sidebarItems = [
    { to: '/', label: 'Home' },
    { to: '/activity', label: 'Activity' },
    { to: '/rewards', label: 'Rewards' },
    { to: '/teamMembers', label: 'Team Members', roles: ['superior'] },
    { to: '/announcements', label: 'Announcement Hub', roles: [ 'admin'] },
    { to: '/rewardsAdmin', label: 'Rewards Hub', roles: ['admin'] },
    { to: '/activityAdmin', label: 'Activity Hub', roles: ['admin'] },
    { to: '/userlist', label: 'User Hub', roles: ['admin'] },
  ];

  const renderSidebarItems = () => {
    let renderedItems = [];
    let adminPageRendered = false; // Flag to track if admin page is rendered
    
    sidebarItems.forEach((item, index) => {
      const isAllowed =
        !item.roles || (userRole && item.roles.includes(userRole.toLowerCase()));
  
      if (isAllowed) {
        
        if (userRole === 'admin' && item.roles && item.roles.includes('admin') && !adminPageRendered) {
          renderedItems.push(
            <div key={`admin-label`} className="text-sm 2xl:text-xl text-gray-500 uppercase font-semibold px-4 py-1">Admin</div>
          );
          renderedItems.push(<hr key={`separator-${index}`} className="my-2 border-t border-gray-400" />);
          adminPageRendered = true; // Set flag to true after rendering the first admin page
        }
  
        renderedItems.push(
          <CustomLink key={item.to} to={item.to}>
            <li className='p-4'>{item.label}</li>
          </CustomLink>
        );
      }
    });
  
    return renderedItems;
  };

   
  return (
    <div className='flex relative justify-between items-center h-24 2xl:h-32 mx-auto px-4 text-secondary bg-primary drop-shadow-md z-50 '>
    
      <div onClick={handleNav} className='flex '>
        {nav ? <AiOutlineClose size={20} className='my-auto' /> : <AiOutlineMenu size={20} className='my-auto' />}
        <Link to="/" className="">
          <p className='md:text-[28px] 2xl:text-[32px] text-[20px] font-extrabold text-secondary px-2  uppercase'>
            Tomta Rewards
          </p>
        </Link>
      </div>


      <ul className='hidden items-center 2xl:text-[28px] uppercase md:flex '>
        <CustomLink to="/">
          <li className='font-bold p-4'>Home</li>
        </CustomLink>
        <CustomLink to="/rewards">
          <li className='font-bold p-4'>Rewards </li>
        </CustomLink>
        <CustomLink to="/activity">
          <li className='font-bold p-4'>Activity</li>
        </CustomLink>
        <CustomLink to="/profile">
          <li className="border-2 border-buttons m-auto bg-secondary rounded-full shadow hover:scale-105 duration-300">
            <Avatar />
          </li>
        </CustomLink>
      </ul>
      <div className='md:hidden'>
        <CustomLink to="/profile">
          <div className="border-2 border-buttons m-auto bg-secondary rounded-full shadow hover:scale-105 duration-300 ">
            <Avatar />
          </div>
        </CustomLink>
      </div>

       {/* sidebar */}
      <div ref={navRef}  className={`${
    nav
      ? 'left-0 top-0 md:w-[30%] w-[50%] h-screen  absolute bg-secondary ease-in-out duration-500 z-50 overflow-y-auto'
      : 'left-[-100%] top-0 md:w-[30%] w-[50%] h-screen  absolute bg-secondary ease-in-out duration-1000 z-50'
  }`}>
        <div className='bg-primary h-24 items-center py-7 sm:px-2'>
        <div onClick={handleNav} className=' flex justify-center'>
        {nav ? <AiOutlineClose size={20} className='my-auto' /> : <AiOutlineMenu size={20} className='my-auto' />}
        <Link to="/" className="">
          <p className='md:text-3xl text-[18px] font-bold text-secondary px-2  sm:text-center '>
            Tomta Rewards
          </p>
        </Link>
      </div></div>
        <li className='font-bold p-4'>
          <div className=" flex  bg-primary rounded-[99px] shadow-xl  p-2" >
            
            <span className="text-secondary 2xl:text-[24px] mx-auto"><Points /></span>
          </div>
        </li>
        <div className='bg-secondary text-buttons'>
          <ul className='pt-3 uppercase sm:text-[12px] 2xl:text-[24px]'>
          {renderSidebarItems()}

          </ul>
        </div>
        
      </div>
    </div>
  )
}
function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to)
  const isActive = useMatch({ path: resolvedPath.pathname, end: true })

  return (
    <div className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </div>
  )
}
export default Navbar