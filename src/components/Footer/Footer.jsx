import React from 'react'
import './footer.css'
import { Container, Row, Col, ListGroup, ListGroupItem } from 'reactstrap'
import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

const quick__links = [
   { path: '/home', display: 'Home' },
   { path: '/tours', display: 'Explore Tours' },
   { path: '/my-bookings', display: 'My Reservations' },
]

const quick__links2 = [
   { path: '/login', display: 'Sign In' },
   { path: '/register', display: 'Register' },
   { path: '/admin', display: 'Admin Portal' },
]

const Footer = () => {
   const year = new Date().getFullYear()

   return (
      <footer className='footer'>
         <Container>
            <Row className="g-4">
               <Col lg='4' md='6'>
                  <div className="logo">
                     <img src={logo} alt="Travel World" />
                     <p className="pe-lg-4">
                        Your ultimate partner for curated global tours, luxury stays, interactive seat pickers, and seamless travel reservations worldwide.
                     </p>
                     <div className="social__link d-flex align-items-center gap-3 mt-3">
                        <span><Link to='#' aria-label="YouTube"><i className='ri-youtube-line'></i></Link></span>
                        <span><Link to='#' aria-label="GitHub"><i className='ri-github-fill'></i></Link></span>
                        <span><Link to='#' aria-label="Facebook"><i className='ri-facebook-circle-line'></i></Link></span>
                        <span><Link to='#' aria-label="Instagram"><i className='ri-instagram-line'></i></Link></span>
                     </div>
                  </div>
               </Col>

               <Col lg='2' md='6'>
                  <h5 className="footer__link-title">Discover</h5>
                  <ListGroup className='footer__quick-links'>
                     {quick__links.map((item, index) => (
                        <ListGroupItem key={index} className='ps-0 border-0'>
                           <Link to={item.path}>{item.display}</Link>
                        </ListGroupItem>
                     ))}
                  </ListGroup>
               </Col>

               <Col lg='2' md='6'>
                  <h5 className="footer__link-title">Quick Links</h5>
                  <ListGroup className='footer__quick-links'>
                     {quick__links2.map((item, index) => (
                        <ListGroupItem key={index} className='ps-0 border-0'>
                           <Link to={item.path}>{item.display}</Link>
                        </ListGroupItem>
                     ))}
                  </ListGroup>
               </Col>

               <Col lg='4' md='6'>
                  <h5 className="footer__link-title">Contact Support</h5>
                  <ListGroup className='footer__quick-links'>
                     <ListGroupItem className='ps-0 border-0 d-flex align-items-center gap-3'>
                        <h6 className='mb-0 d-flex align-items-center gap-2'>
                           <span><i className='ri-map-pin-line'></i></span>
                           Address:
                        </h6>
                        <span className='mb-0 text-slate-300'>Mumbai, Maharashtra, India</span>
                     </ListGroupItem>

                     <ListGroupItem className='ps-0 border-0 d-flex align-items-center gap-3'>
                        <h6 className='mb-0 d-flex align-items-center gap-2'>
                           <span><i className='ri-mail-line'></i></span>
                           Email:
                        </h6>
                        <span className='mb-0 text-slate-300'>support@travelworld.com</span>
                     </ListGroupItem>

                     <ListGroupItem className='ps-0 border-0 d-flex align-items-center gap-3'>
                        <h6 className='mb-0 d-flex align-items-center gap-2'>
                           <span><i className='ri-phone-fill'></i></span>
                           Phone:
                        </h6>
                        <span className='mb-0 text-slate-300'>+91 98765 43210</span>
                     </ListGroupItem>
                  </ListGroup>
               </Col>
            </Row>

            <Row className="mt-4">
               <Col lg="12" className="text-center copyright">
                  <p className="mb-0">© {year} Travel App Platform. Built for global travel management.</p>
               </Col>
            </Row>
         </Container>
      </footer>
   )
}

export default Footer