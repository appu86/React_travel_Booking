import React from 'react'
import { Container, Row, Col, Button } from 'reactstrap'
import { Link, useLocation } from 'react-router-dom'
import '../styles/thank-you.css'
import { formatINR } from '../utils/formatCurrency'

const ThankYou = () => {
   const location = useLocation()
   const booking = location.state?.booking

   return (
      <section className="thank-you-section">
         <Container>
            <Row className="justify-content-center">
               <Col lg='8' className='pt-4 text-center'>
                  <div className="thank__you shadow-lg rounded-4 p-4 p-md-5 bg-white">
                     <span className="success-icon-wrapper">
                        <i className='ri-checkbox-circle-fill text-success display-3'></i>
                     </span>
                     <h1 className='mt-3 mb-1 fw-bold text-dark'>Booking Confirmed!</h1>
                     <p className='text-muted mb-4'>Thank you for choosing Travel World. Your reservation is set.</p>

                     {booking && (
                        <div className="e-ticket-card text-start p-4 mb-4 rounded-3 bg-light border">
                           <div className="ticket-header d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom">
                              <div>
                                 <h5 className="mb-0 fw-bold text-primary">{booking.tourName || 'Tour Package'}</h5>
                                 <small className="text-muted">Pass ID: #{booking._id?.slice(-8).toUpperCase() || 'TW-8921'}</small>
                              </div>
                              <span className="badge bg-success px-3 py-2 fs-6">CONFIRMED</span>
                           </div>

                           <div className="row g-3 ticket-body">
                              <div className="col-6 col-md-3">
                                 <small className="text-muted d-block">Passenger</small>
                                 <strong className="text-dark">{booking.fullName}</strong>
                              </div>
                              <div className="col-6 col-md-3">
                                 <small className="text-muted d-block">Travel Date</small>
                                 <strong className="text-dark">
                                    {booking.bookAt ? new Date(booking.bookAt).toLocaleDateString() : 'Upcoming'}
                                 </strong>
                              </div>
                              <div className="col-6 col-md-3">
                                 <small className="text-muted d-block">Guests</small>
                                 <strong className="text-dark">{booking.guestSize} Person(s)</strong>
                              </div>
                              <div className="col-6 col-md-3">
                                 <small className="text-muted d-block">Total Paid</small>
                                 <strong className="text-primary fs-6">{formatINR(booking.totalAmount)}</strong>
                              </div>
                           </div>

                           {booking.seats && booking.seats.length > 0 && (
                              <div className="ticket-seats mt-3 pt-3 border-top d-flex align-items-center gap-2">
                                 <i className="ri-armchair-fill text-primary fs-5"></i>
                                 <span className="fw-semibold">Reserved Seats:</span>
                                 <div className="d-flex gap-1 flex-wrap">
                                    {booking.seats.map((seat, idx) => (
                                       <span key={idx} className="badge bg-dark text-white px-2 py-1 fs-6">
                                          Seat {seat}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     )}

                     <div className="d-flex justify-content-center gap-3 mt-4">
                        <Button className='btn primary__btn px-4 py-2'>
                           <Link to='/home' className="text-white text-decoration-none">Explore More Tours</Link>
                        </Button>
                        <Button className='btn btn-outline-secondary px-4 py-2' onClick={() => window.print()}>
                           <i className="ri-printer-line me-1"></i> Print Pass
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