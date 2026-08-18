import React, { useState, useRef, useEffect, useContext } from 'react'
import '../styles/tour-details.css'
import { Container, Row, Col, Form, ListGroup, Spinner, Alert, Badge } from 'reactstrap'
import { useParams } from 'react-router-dom'
import calculateAvgRating from '../utils/avgRating'
import avatar from '../assets/images/avatar.jpg'
import Booking from '../components/Booking/Booking'
import Newsletter from '../shared/Newsletter'
import useFetch from '../hooks/useFetch'
import { BASE_URL } from '../utils/config'
import { AuthContext } from '../context/AuthContext'
import { formatINR } from '../utils/formatCurrency'

const TourDetails = () => {
   const { id } = useParams()
   const reviewMsgRef = useRef('')
   const [tourRating, setTourRating] = useState(5)
   const { user } = useContext(AuthContext)

   const { data: tour, loading, error } = useFetch(`${BASE_URL}/tours/${id}`)

   const { photo, title, desc, price, reviews, city, address, distance, maxGroupSize, createdBy } = tour || {}
   const { avgRating } = calculateAvgRating(reviews)
   const options = { day: 'numeric', month: 'long', year: 'numeric' }

   const submitHandler = async e => {
      e.preventDefault()
      const reviewText = reviewMsgRef.current.value

      try {
         if (!user) {
            return alert('Please sign in to leave a review')
         }
         const reviewObj = {
            username: user?.username || 'Traveler',
            reviewText,
            rating: tourRating
         }

         const res = await fetch(`${BASE_URL}/review/${id}`, {
            method: 'post',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(reviewObj)
         })

         const result = await res.json()
         if (!res.ok) {
            return alert(result.message || 'Failed to submit review')
         }
         alert(result.message || 'Review submitted successfully!')
         reviewMsgRef.current.value = ''
      } catch (err) {
         alert(err.message)
      }
   }

   useEffect(() => {
      window.scrollTo(0, 0)
   }, [tour])

   if (loading) {
      return (
         <div className="text-center py-5">
            <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
            <h4 className="mt-3 text-muted">Loading Tour Details...</h4>
         </div>
      )
   }

   if (error || !tour) {
      return (
         <Container className="py-5">
            <Alert color="danger" className="text-center p-4 rounded-4">
               <h4>Tour Package Not Found</h4>
               <p>{error || 'The requested tour package is unavailable.'}</p>
            </Alert>
         </Container>
      )
   }

   return (
      <section className="py-5 bg-light">
         <Container>
            <Row className="g-4">
               <Col lg='8'>
                  <div className="tour__content">
                     {/* High-res Image Banner */}
                     <div className="tour__image__box">
                        <img 
                           src={photo || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'} 
                           alt={title} 
                           onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'; }}
                        />
                        {(createdBy === 'Admin' || createdBy === 'admin' || !createdBy) && (
                           <div className="position-absolute top-0 end-0 m-3">
                              <Badge color="primary" className="px-3 py-2 fs-6 rounded-pill shadow">
                                 👑 Admin Verified Tour
                              </Badge>
                           </div>
                        )}
                     </div>

                     {/* Main Information Box */}
                     <div className="tour__info">
                        <h2>{title}</h2>

                        <div className="tour__meta__top">
                           <span className="tour__rating__pill">
                              <i className='ri-star-fill'></i> {avgRating === 0 ? '4.8' : avgRating} 
                              <span className="text-muted fw-normal">({reviews?.length || 12} reviews)</span>
                           </span>
                           <span className="tour__address__tag">
                              <i className='ri-map-pin-line'></i> {address || city}
                           </span>
                        </div>

                        {/* Specs Grid */}
                        <div className="tour__extra-details">
                           <div className="spec__item">
                              <i className='ri-building-line'></i>
                              <div>
                                 <small className="text-muted d-block">Destination</small>
                                 <span>{city}</span>
                              </div>
                           </div>

                           <div className="spec__item">
                              <i className='ri-price-tag-3-line'></i>
                              <div>
                                 <small className="text-muted d-block">Price</small>
                                 <span className="text-success fw-bold">{formatINR(price)}</span>
                              </div>
                           </div>

                           <div className="spec__item">
                              <i className='ri-map-pin-time-line'></i>
                              <div>
                                 <small className="text-muted d-block">Distance</small>
                                 <span>{distance} km</span>
                              </div>
                           </div>

                           <div className="spec__item">
                              <i className='ri-group-line'></i>
                              <div>
                                 <small className="text-muted d-block">Max Group</small>
                                 <span>{maxGroupSize} People</span>
                              </div>
                           </div>
                        </div>

                        <h5 className="fw-bold text-dark mb-2"><i className="ri-file-text-line me-2 text-primary"></i>Overview & Itinerary</h5>
                        <p className="text-secondary lh-lg mb-0">{desc || 'Immerse yourself in breathtaking global travel destinations curated by expert travel managers.'}</p>
                     </div>

                     {/* Reviews Section */}
                     <div className="tour__reviews">
                        <h4><i className="ri-chat-smile-2-line me-2 text-primary"></i>Guest Reviews ({reviews?.length || 0})</h4>

                        <Form onSubmit={submitHandler} className="mb-4">
                           <div className="d-flex align-items-center gap-2 mb-3 rating__group">
                              {[1, 2, 3, 4, 5].map((star) => (
                                 <span 
                                    key={star} 
                                    className={tourRating >= star ? 'active' : ''} 
                                    onClick={() => setTourRating(star)}
                                 >
                                    {star} <i className='ri-star-s-fill ms-1'></i>
                                 </span>
                              ))}
                           </div>

                           <div className="review__input">
                              <input type="text" ref={reviewMsgRef} placeholder='Share your thoughts about this tour package...' required />
                              <button className='btn primary__btn text-white rounded-pill px-4' type='submit'>
                                 Submit Review
                              </button>
                           </div>
                        </Form>

                        <ListGroup className='user__reviews'>
                           {reviews?.length === 0 ? (
                              <p className="text-muted small">No reviews yet. Be the first traveler to leave a review!</p>
                           ) : (
                              reviews?.map((review, index) => (
                                 <div className="review__item" key={index}>
                                    <div className="d-flex align-items-start gap-3">
                                       <img src={avatar} alt="" className="rounded-circle" width="42" height="42" />
                                       <div className="w-100">
                                          <div className="d-flex align-items-center justify-content-between">
                                             <div>
                                                <h6 className="fw-bold mb-0 text-dark">{review.username}</h6>
                                                <small className="text-muted">
                                                   {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', options) : 'Recent'}
                                                </small>
                                             </div>
                                             <span className='badge bg-warning text-dark px-2.5 py-1 rounded-pill'>
                                                {review.rating || 5} <i className='ri-star-s-fill ms-1'></i>
                                             </span>
                                          </div>
                                          <p className="mt-2 text-secondary mb-0">{review.reviewText}</p>
                                       </div>
                                    </div>
                                 </div>
                              ))
                           )}
                        </ListGroup>
                     </div>
                  </div>
               </Col>

               <Col lg='4'>
                  <div className="position-sticky" style={{ top: '100px' }}>
                     <Booking tour={tour} avgRating={avgRating} />
                  </div>
               </Col>
            </Row>
         </Container>
         <Newsletter />
      </section>
   )
}

export default TourDetails