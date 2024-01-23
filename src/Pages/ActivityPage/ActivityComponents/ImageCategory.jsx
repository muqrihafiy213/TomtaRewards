import React from 'react'
import Sports from '../../../Assets/Sports.jpg'
import Food from '../../../Assets/Food.jpg'
import Company from '../../../Assets/Company.jpeg'
import noimage from '../../../Assets/logo-ori-transparent.png'

const ImageCategory = ({value}) => {
    let ImageToShow

    if(value === "Sport"){
        ImageToShow = Sports
    }
    else if(value === "Food"){
        ImageToShow = Food
    }
    else if(value === "Company"){
        ImageToShow = Company
    }
    else {
        ImageToShow = noimage
    }

  return (
    <div className='flex fixed-container  overflow-hidden'>
        <img
                        className='p-5 shadow m-auto object-contain image'
                        src={ImageToShow}
                        alt= "gambar"
                        
                      />
    </div>
  )
}

export default ImageCategory