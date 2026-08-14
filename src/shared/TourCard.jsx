// frontend/src/shared/TourCard.jsx
import React from 'react'
import { Card, CardBody, Button } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import { formatINR } from '../utils/formatCurrency'
import './tour-card.css'

const TourCard = ({ tour }) => {
   const navigate = useNavigate()

   const handleBookNow = () => {
      navigate(`/tours/${tour._id}`, { state: { tour } })
   }

   const handleViewDetails = () => {
      navigate(`/tours/${tour._id}`)
   }

   return (
      <Card className="tour__card">
         <div className="tour__img">
            <img 
               src={tour.photo || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'} 
               alt={tour.title}
               onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'
               }}
            />
            <div className="tour__badges">
               {tour.featured && <span className="featured__badge">★ Featured</span>}
               {(tour.createdBy === 'Admin' || tour.createdBy === 'admin' || !tour.createdBy) && (
                  <span className="admin__badge"><i className="ri-shield-star-line"></i> Admin Tour</span>
               )}
            </div>
         </div>
         
         <CardBody>
            <div className="card__top d-flex align-items-center justify-content-between">
               <span className="tour__location d-flex align-items-center gap-1">
                  <i className="ri-map-pin-line"></i> {tour.city}
               </span>
               <span className="tour__rating d-flex align-items-center gap-1">
                  <i className="ri-star-fill"></i> {tour.rating || 4.5}
               </span>
            </div>
            
            <h5 className="tour__title mt-2">{tour.title}</h5>
            
            <div className="card__bottom d-flex align-items-center justify-content-between mt-3">
               <div className="tour__price">
                  <h5>{formatINR(tour.price)}</h5>
                  <p>/per person</p>
               </div>
               
               <div className="tour__details">
                  <span className="d-flex align-items-center gap-1">
                     <i className="ri-group-line"></i> {tour.maxGroupSize} max
                  </span>
                  <span className="d-flex align-items-center gap-1">
                     <i className="ri-road-map-line"></i> {tour.distance} km
                  </span>
               </div>
            </div>
            
            <div className="card__buttons d-flex gap-2 mt-3">
               <Button 
                  color="primary" 
                  onClick={handleBookNow}
                  className="flex-grow-1"
               >
                  Book Now
               </Button>
               <Button 
                  color="light" 
                  onClick={handleViewDetails}
                  className="flex-grow-1"
               >
                  Details
               </Button>
            </div>
         </CardBody>
      </Card>
   )
}

export default TourCard