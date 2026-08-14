import React from 'react'
import { Container, Row, Col, Button, Alert } from 'reactstrap'
import { Link, useLocation } from 'react-router-dom'
import '../styles/thank-you.css'
import { formatINR } from '../utils/formatCurrency'

const ThankYou = () => {
   const location = useLocation()
   const booking = location.state?.booking

   return (
      <section className="thank-you-section py-5">
         <Container>
            <Row className="justify-content-center">
               <Col lg='9' md='10' className='pt-2 text-center'>
                  <div className="thank__you shadow-lg rounded-4 p-4 p-md-5 bg-white border">
                     
                     <div className="success-icon-wrapper mb-3">
                        <i className='ri-time-line text-warning display-2'></i>
                     </div>

                     <h2 className='mb-2 fw-bold text-dark'>Booking Request Submitted!</h2>
                     <p className='text-muted fs-6 mb-4'>
                        Your tour reservation request has been successfully registered. Our Admin team will review and confirm your booking.
                     </p>

                     {/* Highlighted Notice Card */}
                     <Alert color="warning" className="text-start p-4 rounded-3 mb-4 shadow-sm border-start border-4 border-warning">
                        <h5 className="fw-bold text-dark mb-2">
                           <i className="ri-information-fill text-warning me-2 fs-4 align-middle"></i>
                           Next Steps & Admin Confirmation
                        </h5>
                        <ul className="mb-0 text-dark small ps-3 lh-lg">
                           <li>
                              <strong>Admin Review:</strong> Our Admin team will contact you shortly via phone or email to verify your travel dates & guest headcount.
                           </li>
                           <li>
                              <strong>Payment Instructions:</strong> Mode of payment and payment link will be <u>notified by the Admin</u> after your booking request is accepted & confirmed.
                           </li>
                        </ul>
                     </Alert>

                     {booking && (
                        <div className="e-ticket-card text-start p-4 mb-4 rounded-3 bg-light border">
                           <div className="ticket-header d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom flex-wrap gap-2">
                              <div>
                                 <h5 className="mb-0 fw-bold text-primary">{booking.tourName || 'Tour Package'}</h5>
                                 <small className="text-muted">Booking Reference: #{booking._id?.slice(-8).toUpperCase() || 'TW-8921'}</small>
                              </div>
                              <span className="badge bg-warning text-dark px-3 py-2 fs-6">
                                 ⏳ AWAITING ADMIN CONFIRMATION
                              </span>
                           </div>

                           <div className="row g-3 ticket-body">
                              <div className="col-6 col-md-3">
                                 <small className="text-muted d-block">Passenger Name</small>
                                 <strong className="text-dark">{booking.fullName}</strong>
                              </div>
                              <div className="col-6 col-md-3">
                                 <small className="text-muted d-block">Travel Date</small>
                                 <strong className="text-dark">
                                    {booking.bookAt ? new Date(booking.bookAt).toLocaleDateString() : 'Upcoming'}
                                 </strong>
                              </div>
                              <div className="col-6 col-md-3">
                                 <small className="text-muted d-block">Headcount</small>
                                 <strong className="text-dark">{booking.guestSize} Person(s)</strong>
                              </div>
                              <div className="col-6 col-md-3">
                                 <small className="text-muted d-block">Est. Package Total</small>
                                 <strong className="text-primary fs-6">{formatINR(booking.totalAmount)}</strong>
                              </div>
                           </div>

                           {booking.seats && booking.seats.length > 0 && (
                              <div className="ticket-seats mt-3 pt-3 border-top d-flex align-items-center gap-2">
                                 <i className="ri-armchair-fill text-primary fs-5"></i>
                                 <span className="fw-semibold">Requested Seats:</span>
                                 <div className="d-flex gap-1 flex-wrap">
                                    {booking.seats.map((seat, idx) => (
                                       <span key={idx} className="badge bg-dark text-white px-2 py-1 fs-6">
                                          Seat {seat}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                           )}

                           <div className="mt-3 pt-3 border-top text-muted small">
                              <i className="ri-wallet-3-line me-1 text-primary"></i> 
                              <strong>Payment Mode:</strong> {booking.paymentMode || 'To be notified by Admin team upon confirmation.'}
                           </div>
                        </div>
                     )}

                     <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                        <Button className='btn primary__btn px-4 py-2'>
                           <Link to='/home' className="text-white text-decoration-none">
                              <i className="ri-compass-line me-1"></i> Back to Home
                           </Link>
                        </Button>
                        <Button className='btn btn-outline-primary px-4 py-2' tag={Link} to='/my-bookings'>
                           <i className="ri-bookmark-3-line me-1"></i> Track My Bookings
                        </Button>
                        <Button className='btn btn-outline-secondary px-4 py-2' onClick={() => window.print()}>
                           <i className="ri-printer-line me-1"></i> Print Request Summary
                        </Button>
                     </div>

                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   )
}

export default ThankYou