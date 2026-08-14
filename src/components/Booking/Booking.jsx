import React, { useState, useContext, useEffect } from 'react'
import './booking.css'
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { BASE_URL } from '../../utils/config'
import { formatINR } from '../../utils/formatCurrency'
import SeatPicker from './SeatPicker'

const Booking = ({ tour, avgRating }) => {
   const { price, reviews, title, _id: tourId } = tour || {}
   const navigate = useNavigate()
   const { user } = useContext(AuthContext)

   const [showSeatPicker, setShowSeatPicker] = useState(false)
   const [selectedSeats, setSelectedSeats] = useState([])

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

   const handleSeatsSelected = (seats) => {
      setSelectedSeats(seats)
      if (seats.length > 0) {
         setBooking(prev => ({ ...prev, guestSize: seats.length }))
      }
   }

   const serviceFee = 10
   const totalAmount = Number(price || 0) * Number(booking.guestSize || 1) + Number(serviceFee)

   const getAuthToken = () => {
      if (user?.token) return user.token
      if (token) return token
      try {
         const storedUser = localStorage.getItem('user')
         if (storedUser) {
            const parsed = JSON.parse(storedUser)
            if (parsed?.token) return parsed.token
         }
      } catch (err) {}
      return localStorage.getItem('token') || ''
   }

   const handleClick = async e => {
      e.preventDefault()

      try {
         if (!user) {
            return alert('Please sign in to make a booking')
         }

         const activeToken = getAuthToken()

         const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
            },
            credentials: 'include',
            body: JSON.stringify({
               ...booking,
               seats: selectedSeats,
               totalAmount
            })
         })

         const result = await res.json()

         if (!res.ok) {
            return alert(result.message || 'Failed to create booking')
         }

         navigate('/thank-you', { state: { booking: result.data } })
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
               {avgRating === 0 ? null : avgRating} ({reviews?.length || 0})
            </span>
         </div>

         {/* =============== BOOKING FORM START ============== */}
         <div className="booking__form">
            <h5>Reservation Details</h5>
            <Form className='booking__info-form' onSubmit={handleClick}>
               <FormGroup>
                  <input 
                     type="text" 
                     placeholder='Full Name' 
                     id='fullName' 
                     value={booking.fullName}
                     required
                     onChange={handleChange} 
                  />
               </FormGroup>
               <FormGroup>
                  <input 
                     type="tel" 
                     placeholder='Phone Number' 
                     id='phone' 
                     required
                     onChange={handleChange} 
                  />
               </FormGroup>
               <FormGroup className='d-flex align-items-center gap-3'>
                  <input 
                     type="date" 
                     id='bookAt' 
                     required
                     onChange={handleChange} 
                  />
                  <input 
                     type="number" 
                     placeholder='Guests' 
                     id='guestSize' 
                     min="1"
                     max="10"
                     value={booking.guestSize}
                     required
                     onChange={handleChange} 
                  />
               </FormGroup>

               {/* Interactive Seat Picker Trigger */}
               <div className="seat-picker-trigger my-3">
                  <Button 
                     type="button" 
                     className={`btn w-100 d-flex align-items-center justify-content-between ${selectedSeats.length > 0 ? 'btn-success' : 'btn-outline-primary'}`}
                     onClick={() => setShowSeatPicker(!showSeatPicker)}
                  >
                     <span>
                        <i className="ri-armchair-line me-2"></i>
                        {selectedSeats.length > 0 ? `Seats: ${selectedSeats.join(', ')}` : 'Select Coach Seats'}
                     </span>
                     <i className={showSeatPicker ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
                  </Button>
               </div>

               {showSeatPicker && (
                  <SeatPicker 
                     onSeatsSelected={handleSeatsSelected} 
                     initialSeats={selectedSeats}
                     maxSeatsAllowed={10}
                  />
               )}

               {/* =============== BOOKING SUMMARY ================ */}
               <div className="booking__bottom">
                  <ListGroup>
                     <ListGroupItem className='border-0 px-0'>
                        <h5 className='d-flex align-items-center gap-1'>
                           {formatINR(price)} <i className='ri-close-line'></i> {booking.guestSize} person(s)
                        </h5>
                        <span>{formatINR(Number(price || 0) * Number(booking.guestSize || 1))}</span>
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

                  <Button className='btn primary__btn w-100 mt-4' type='submit'>
                     Confirm & Book Now
                  </Button>
               </div>
            </Form>
         </div>
      </div>
   )
}

export default Booking