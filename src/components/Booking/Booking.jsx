import React, { useState, useContext, useEffect } from 'react'
import './booking.css'
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from 'reactstrap'

import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { BASE_URL } from '../../utils/config'
import { formatINR } from '../../utils/formatCurrency'

const Booking = ({ tour, avgRating }) => {
   const { price, reviews, title, _id: tourId } = tour
   const navigate = useNavigate()

   const { user } = useContext(AuthContext)

   const [booking, setBooking] = useState({
      userId: user?._id || '',
      tourId: tourId || '',
      tourName: title || '',
      fullName: user?.name || user?.username || '',
      email: user?.email || '',
      phone: '',
      guestSize: 1,
      bookAt: ''
   })

   const [token, setToken] = useState('')

   useEffect(() => {
      setBooking(prev => ({
         ...prev,
         userId: user?._id || prev.userId,
         email: user?.email || prev.email,
         tourName: title || prev.tourName,
         tourId: tourId || prev.tourId
      }))
      setToken(user?.token || '')
   }, [user, title, tourId])

   const handleChange = e => {
      const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
      setBooking(prev => ({ ...prev, [e.target.id]: value }))
   }

   const serviceFee = 10
   const totalAmount = Number(price) * Number(booking.guestSize || 1) + Number(serviceFee)

   const handleClick = async e => {
      e.preventDefault()

      try {
         if (!user) {
            return alert('Please sign in')
         }

         const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ ...booking, totalAmount })
         })

         const result = await res.json()

         if(!res.ok) {
            return alert(result.message || 'Failed to create booking')
         }

         navigate('/thank-you')
      } catch (error) {
         alert(error.message)
      }   
   }

   return (
      <div className='booking'>
         <div className="booking__top d-flex align-items-center justify-content-between">
            <h3>{formatINR(price)} <span>/per person</span></h3>
            <span className="tour__rating d-flex align-items-center">
               <i className='ri-star-fill' style={{ color: 'var(--secondary-color)' }}></i>
               {avgRating === 0 ? null : avgRating} ({reviews?.length})
            </span>
         </div>

         {/* =============== BOOKING FORM START ============== */}
         <div className="booking__form">
            <h5>Information</h5>
            <Form className='booking__info-form' onSubmit={handleClick}>
               <FormGroup>
                  <input type="text" placeholder='Full Name' id='fullName' required
                     onChange={handleChange} />
               </FormGroup>
               <FormGroup>
                  <input type="tel" placeholder='Phone' id='phone' required
                     onChange={handleChange} />
               </FormGroup>
               <FormGroup className='d-flex align-items-center gap-3'>
                  <input type="date" placeholder='' id='bookAt' required
                     onChange={handleChange} />
                  <input type="number" placeholder='Guest' id='guestSize' required
                     onChange={handleChange} />
               </FormGroup>

               {/* =============== BOOKING BOTTOM ================ */}
               <div className="booking__bottom">
                  <ListGroup>
                     <ListGroupItem className='border-0 px-0'>
                        <h5 className='d-flex align-items-center gap-1'>{formatINR(price)} <i className='ri-close-line'></i> 1 person</h5>
                        <span>{formatINR(price)}</span>
                     </ListGroupItem>
                     <ListGroupItem className='border-0 px-0'>
                        <h5>Service charge</h5>
                        <span>{formatINR(serviceFee)}</span>
                     </ListGroupItem>
                     <ListGroupItem className='border-0 px-0 total'>
                        <h5>Total</h5>
                        <span>{formatINR(totalAmount)}</span>
                     </ListGroupItem>
                  </ListGroup>

                  <Button className='btn primary__btn w-100 mt-4' type='submit'>Book Now</Button>
               </div>
            </Form>
         </div>
         {/* =============== BOOKING FORM END ================ */}
         <div className="booking__bottom">
            <ListGroup>
               <ListGroupItem className='border-0 px-0'>
                  <h5 className='d-flex align-items-center gap-1'>{formatINR(price)} <i className='ri-close-line'></i> 1 person</h5>
                  <span>{formatINR(price)}</span>
               </ListGroupItem>
               <ListGroupItem className='border-0 px-0'>
                  <h5>Service charge</h5>
                  <span>{formatINR(serviceFee)}</span>
               </ListGroupItem>
               <ListGroupItem className='border-0 px-0 total'>
                  <h5>Total</h5>
                  <span>{formatINR(totalAmount)}</span>
               </ListGroupItem>
            </ListGroup>

            <Button className='btn primary__btn w-100 mt-4' type='submit'>Book Now</Button>
         </div>
      </div>
   )
}

export default Booking