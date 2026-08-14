import React, { useState, useEffect, useContext } from 'react'
import { Container, Row, Col, Card, CardBody, Badge, Spinner, Alert, Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { BASE_URL } from '../utils/config'
import { formatINR } from '../utils/formatCurrency'

const MyBookings = () => {
   const [bookings, setBookings] = useState([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(null)
   const { user } = useContext(AuthContext)

   useEffect(() => {
      const fetchMyBookings = async () => {
         let token = user?.token
         if (!token) {
            try {
               const storedUser = localStorage.getItem('user')
               if (storedUser) {
                  const parsed = JSON.parse(storedUser)
                  token = parsed?.token
               }
            } catch (err) {}
         }
         if (!token) {
            token = localStorage.getItem('token')
         }

         if (!token) {
            setLoading(false)
            return
         }

         try {
            const res = await fetch(`${BASE_URL}/bookings/my-bookings`, {
               headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success && data.data) {
               setBookings(data.data)
            } else if (Array.isArray(data)) {
               setBookings(data)
            }
         } catch (err) {
            console.error("Error fetching my bookings:", err)
            setError(err.message || 'Failed to load bookings')
         } finally {
            setLoading(false)
         }
      }

      fetchMyBookings()
   }, [user])

   if (!user) {
      return (
         <Container className="py-5 text-center">
            <Alert color="warning" className="p-4 rounded-4 shadow-sm my-5">
               <h4><i className="ri-lock-line me-2"></i>Sign In Required</h4>
               <p className="mb-3">Please sign in to view your tour reservations and booking status.</p>
               <Button color="primary" className="rounded-pill px-4" tag={Link} to="/login">
                  Sign In Now
               </Button>
            </Alert>
         </Container>
      )
   }

   return (
      <section className="py-5 bg-light" style={{ minHeight: '80vh' }}>
         <Container>
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
               <div>
                  <h2 className="fw-bold text-dark mb-1">
                     <i className="ri-bookmark-3-line text-primary me-2"></i>My Bookings & Reservation Status
                  </h2>
                  <p className="text-muted mb-0">Track your requested tour packages, admin acceptance, and payment notifications.</p>
               </div>
               <Button color="outline-primary" className="rounded-pill px-3" tag={Link} to="/tours">
                  <i className="ri-add-line me-1"></i> Book New Tour
               </Button>
            </div>

            {loading ? (
               <div className="text-center py-5">
                  <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                  <p className="mt-3 text-muted">Fetching your booking status...</p>
               </div>
            ) : error ? (
               <Alert color="danger">{error}</Alert>
            ) : bookings.length === 0 ? (
               <Card className="text-center p-5 border-0 shadow-sm rounded-4">
                  <CardBody>
                     <i className="ri-calendar-event-line text-muted display-1 mb-3"></i>
                     <h4 className="fw-bold text-dark">No Bookings Found</h4>
                     <p className="text-muted mb-4">You have not submitted any tour booking requests yet.</p>
                     <Button color="primary" className="rounded-pill px-4" tag={Link} to="/tours">
                        Browse Tour Packages
                     </Button>
                  </CardBody>
               </Card>
            ) : (
               <Row className="g-4">
                  {bookings.map((booking) => (
                     <Col lg="6" key={booking._id}>
                        <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                           <CardBody className="p-4 d-flex flex-direction-column justify-content-between">
                              <div>
                                 <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3 flex-wrap gap-2">
                                    <div>
                                       <h5 className="fw-bold text-primary mb-1">{booking.tourName || 'Tour Package'}</h5>
                                       <small className="text-muted">Ref ID: #{booking._id?.slice(-8).toUpperCase()}</small>
                                    </div>
                                    <Badge 
                                       color={booking.status === 'confirmed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'warning'} 
                                       className="px-3 py-2 fs-6 rounded-pill"
                                    >
                                       {booking.status === 'confirmed' ? '✅ ACCEPTED & PAYMENT NOTIFIED' : booking.status === 'cancelled' ? '❌ CANCELLED' : '⏳ AWAITING ADMIN CONFIRMATION'}
                                    </Badge>
                                 </div>

                                 <div className="row g-3 mb-3">
                                    <div className="col-6">
                                       <small className="text-muted d-block">Passenger</small>
                                       <span className="fw-semibold text-dark">{booking.fullName}</span>
                                    </div>
                                    <div className="col-6">
                                       <small className="text-muted d-block">Travel Date</small>
                                       <span className="fw-semibold text-dark">
                                          {booking.bookAt ? new Date(booking.bookAt).toLocaleDateString() : 'Upcoming'}
                                       </span>
                                    </div>
                                    <div className="col-6">
                                       <small className="text-muted d-block">Guests</small>
                                       <span className="fw-semibold text-dark">{booking.guestSize} Person(s)</span>
                                    </div>
                                    <div className="col-6">
                                       <small className="text-muted d-block">Total Estimated Cost</small>
                                       <span className="fw-bold text-success">{formatINR(booking.totalAmount)}</span>
                                    </div>
                                 </div>

                                 {booking.seats && booking.seats.length > 0 && (
                                    <div className="mb-3 d-flex align-items-center gap-2">
                                       <i className="ri-armchair-line text-primary"></i>
                                       <small className="fw-semibold text-dark me-1">Seats:</small>
                                       {booking.seats.map((seat, i) => (
                                          <Badge key={i} color="dark" pill className="px-2 py-1">{seat}</Badge>
                                       ))}
                                    </div>
                                 )}

                                 {/* Admin Payment Instructions Box */}
                                 <Alert color={booking.status === 'confirmed' ? 'success' : 'light'} className="p-3 mb-0 rounded-3 border">
                                    <div className="fw-bold text-dark mb-1">
                                       <i className="ri-wallet-3-line me-1 text-primary"></i> Payment Mode & Instructions:
                                    </div>
                                    <small className="text-dark d-block">
                                       {booking.paymentMode || 'To be notified by Admin team upon confirmation.'}
                                    </small>
                                    {booking.status !== 'confirmed' && (
                                       <small className="text-muted d-block mt-1 font-italic">
                                          * Our Admin team will contact you directly to confirm your booking and provide payment instructions.
                                       </small>
                                    )}
                                 </Alert>
                              </div>
                           </CardBody>
                        </Card>
                     </Col>
                  ))}
               </Row>
            )}
         </Container>
      </section>
   )
}

export default MyBookings
