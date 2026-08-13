import React from 'react'
import Slider from 'react-slick'
import ava01 from '../../assets/images/ava-1.jpg'
import ava02 from '../../assets/images/ava-2.jpg'
import ava03 from '../../assets/images/ava-3.jpg'

const Testimonials = () => {
   const settings = {
      dots:true,
      infinite:true,
      autoplay:true,
      speed:1000,
      swipeToSlide:true,
      autoplaySpeed:2000,
      slidesToShow:3,

      responsive: [
         {
            breakpoint: 992,
            settings: {
               slidesToShow: 2,
               slidesToScroll: 1,
               infinite: true,
               dots: true,
            }
         },
         {
            breakpoint: 576,
            settings: {
               slidesToShow: 1,
               slidesToScroll: 1,
               infinite: true,
               dots: true,
            }
         }
      ]
   }

   return <Slider {...settings}>
      <div className="testimonial py-4 px-3">
         <p>
            "Booking our Paris & Swiss Alps package through Travel World was the smoothest experience ever! The seat selection feature allowed us to reserve front-row panorama seats."
         </p>

         <div className='d-flex align-items-center gap-4 mt-3'>
            <img src={ava01} className='w-25 h-25 rounded-2' alt="" />
            <div>
               <h6 className='mb-0 mt-3'>Rohan Sharma</h6>
               <p>Frequent Traveler</p>
            </div>
         </div> 
      </div>

      <div className="testimonial py-4 px-3">
         <p>
            "Exceptional customer service! Our guide was super knowledgeable, and the interactive booking process made customizing our family vacation completely stress-free."
         </p>

         <div className='d-flex align-items-center gap-4 mt-3'>
            <img src={ava02} className='w-25 h-25 rounded-2' alt="" />
            <div>
               <h6 className='mb-0 mt-3'>Lia Franklin</h6>
               <p>Adventure Enthusiast</p>
            </div>
         </div> 
      </div>

      <div className="testimonial py-4 px-3">
         <p>
            "Highly recommended travel agency! From real-time tour updates to transparent pricing with no hidden charges, everything exceeded our expectations."
         </p>

         <div className='d-flex align-items-center gap-4 mt-3'>
            <img src={ava03} className='w-25 h-25 rounded-2' alt="" />
            <div>
               <h6 className='mb-0 mt-3'>David Miller</h6>
               <p>Globe Trotter</p>
            </div>
         </div> 
      </div>

      <div className="testimonial py-4 px-3">
         <p>
            "The online booking pass and instant seat assignment feature gave us total peace of mind before we even arrived at the airport!"
         </p>

         <div className='d-flex align-items-center gap-4 mt-3'>
            <img src={ava01} className='w-25 h-25 rounded-2' alt="" />
            <div>
               <h6 className='mb-0 mt-3'>Sophia Patel</h6>
               <p>Solo Traveler</p>
            </div>
         </div> 
      </div>
   </Slider>
}

export default Testimonials