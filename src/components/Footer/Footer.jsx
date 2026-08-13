import React from 'react'
import './footer.css'
import { Container, Row, Col, ListGroup, ListGroupItem } from 'reactstrap'
import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

const quick__links = [
   {
      path: '/home',
      display: 'Home'
   },
   {
      path: '/about',
      display: 'About'
   },
   {
      path: '/tours',
      display: 'Tours'
   },
]

const quick__links2 = [
   {
      path: '/gallery',
      display: 'Gallery'
   },
   {
      path: '/login',
      display: 'Login'
   },
   {
      path: '/register',
      display: 'Register'
   },
]

const Footer = () => {
   const year = new Date().getFullYear()

   return (
      <footer className='footer'>
         <Container>
            <Row>
               <Col lg='3'>
                  <div className="logo">
                     <img src={logo} alt="" />
                     <p>Your ultimate partner for curated global tours, luxury stays, and seamless travel seat bookings worldwide.</p>
                     <div className="social__link d-flex align-items-center gap-4">
                        <span>
                           <Link to='#'>
                              <i className='ri-youtube-line'></i>
                           </Link>
                        </span>
                        <span>
                           <Link to='#'>
                              <i className='ri-github-fill'></i>
                           </Link>
                        </span>
                        <span>
                           <Link to='#'>
                              <i className='ri-facebook-circle-line'></i>
                           </Link>
                        </span>
                        <span>
                           <Link to='#'>
                              <i className='ri-instagram-line'></i>
                           </Link>
                        </span>
                     </div>
                  </div>
               </Col>

               <Col lg='3'>
                  <h5 className="footer__link-title">Discover</h5>

                  <ListGroup className='footer__quick-links'>
                     {
                        quick__links.map((item, index) => (
                           <ListGroupItem key={index} className='ps-0 border-0'>
                              <Link to={item.path}>{item.display}</Link>
                           </ListGroupItem>
                        ))
                     }
                  </ListGroup>
               </Col>
               <Col lg='3'>
                  <h5 className="footer__link-title">Quick Links</h5>

                  <ListGroup className='footer__quick-links'>
                     {
                        quick__links2.map((item, index) => (
                           <ListGroupItem key={index} className='ps-0 border-0'>
                              <Link to={item.path}>{item.display}</Link>
                           </ListGroupItem>
                        ))
                     }
                  </ListGroup>
               </Col>
               <Col lg='3'>
                  <h5 className="footer__link-title">Contact</h5>

                  <ListGroup className='footer__quick-links'>
                     <ListGroupItem className='ps-0 border-0 d-flex align-items-center gap-3'>
                        <h6 className='mb-0 d-flex align-items-center gap-2'>
                           <span><i className='ri-map-pin-line'></i></span>
                           Address:
                        </h6>
                        <p className='mb-0'>Mumbai, India</p>
                     </ListGroupItem>

                     <ListGroupItem className='ps-0 border-0 d-flex align-items-center gap-3'>
                        <h6 className='mb-0 d-flex align-items-center gap-2'>
                              <span><i className='ri-mail-line'></i></span>
                              Email:
                        </h6>

                        <p className='mb-0'>support@travelworld.com</p>
                     </ListGroupItem>

                     <ListGroupItem className='ps-0 border-0 d-flex align-items-center gap-3'>
                        <h6 className='mb-0 d-flex align-items-center gap-2'>
                              <span><i className='ri-phone-fill'></i></span>
                              Phone:
                        </h6>

                        <p className='mb-0'>+91 98765 43210</p>
                     </ListGroupItem>
                  </ListGroup>
               </Col>
            </Row>
               <Row className="mt-4">
                  <Col lg="12" className="text-center">
                     <p className="mb-0">© {year} Travel App. All rights reserved.</p>
                  </Col>
               </Row>
         </Container>
      </footer>
   )
}

export default Footer