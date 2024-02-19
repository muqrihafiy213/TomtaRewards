import React from 'react'
import { MdSportsSoccer } from 'react-icons/md'
import { CiBurger } from 'react-icons/ci' 
import { MdMiscellaneousServices } from 'react-icons/md'
import { MdQuestionMark } from 'react-icons/md'

const IconCategory = ({value}) => {
    let IconToShow

    if(value === "Sport"){
        IconToShow = <MdSportsSoccer className='h-10 w-10 2xl:h-20 2xl:w-20'/>
    }
    else if(value === "Food"){
        IconToShow = <CiBurger className='h-12 w-12 2xl:h-24 2xl:w-24'/>
    }
    else if(value === "Company"){
        IconToShow = <MdMiscellaneousServices className='h-10 w-10 2xl:h-20 2xl:w-20'/>
    }
    else {
        IconToShow = <MdQuestionMark className='h-10 w-10 2xl:h-20 2xl:w-20'/>
    }

  return (
    <div >
        {IconToShow}
    </div>
  )
}

export default IconCategory