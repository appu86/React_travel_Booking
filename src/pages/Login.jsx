import React, { useContext, useState } from 'react'
import { Container, Row, Col, Form, FormGroup, Button } from 'reactstrap'
import '../styles/login.css'
import { Link, useNavigate } from 'react-router-dom'
import loginImg from '../assets/images/login.png'
import { AuthContext } from '../context/AuthContext'
import { BASE_URL } from '../utils/config'

const Login = () => {
   const [credentials, setCredentials] = useState({
      email: '',
      password: ''
   })

   const { dispatch } = useContext(AuthContext)
   const navigate = useNavigate()

   const handleChange = e => {
      setCredentials(prev => ({ ...prev, [e.target.id]: e.target.value }))
   }

   const fillDemoAdmin = () => {
      setCredentials({ email: 'appu1444@gmail.com', password: '1234' })
   }

   const handleClick = async e => {
      e.preventDefault()
      dispatch({ type: 'LOGIN_START' })

      try {
         const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'post',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(credentials)
         })

         const result = await res.json()

         if (!res.ok) {
            alert(result.message || 'Login failed')
            dispatch({ type: 'LOGIN_FAILURE', payload: result.message || 'Login failed' })
            return
         }

         const userData = { ...result.data, role: result.role, token: result.token }
         if (result.token) {
            localStorage.setItem('token', result.token)
         }
         localStorage.setItem('user', JSON.stringify(userData))

         dispatch({ type: 'LOGIN_SUCCESS', payload: userData })
         navigate(userData.role === 'admin' ? '/admin' : '/tours')
      } catch (err) {
         alert(err.message)
         dispatch({ type: "LOGIN_FAILURE", payload: err.message })
      }
   }

   return (
      <section className="py-5 bg-light" style={{ minHeight: '85vh' }}>
         <Container>
            <Row>
               <Col lg='10' xl='9' className='m-auto'>
                  <div className="login__container d-flex">
                     <div className="login__img text-white text-center">
                        <img src={loginImg} alt="Travel Login Illustration" className="mb-4" />
                        <h4 className="fw-bold">Explore the World</h4>
                        <p className="text-white-50 small mb-0">Sign in to manage tour reservations, seat selections, and admin controls.</p>
                     </div>

                     <div className="login__form">
                        <div className="mb-4">
                           <h2>Welcome Back 👋</h2>
                           <p className="text-muted small mb-0 text-start">Enter your credentials to access your travel account.</p>
                        </div>

                        <Form onSubmit={handleClick}>
                           <FormGroup className="mb-3">
                              <label className="fw-bold small text-secondary mb-1">Email Address</label>
                              <input 
                                 type="email" 
                                 placeholder='name@example.com' 
                                 id='email' 
                                 value={credentials.email}
                                 onChange={handleChange} 
                                 required 
                              />
                           </FormGroup>
                           <FormGroup className="mb-4">
                              <label className="fw-bold small text-secondary mb-1">Password</label>
                              <input 
                                 type="password" 
                                 placeholder='••••••••' 
                                 id='password' 
                                 value={credentials.password}
                                 onChange={handleChange} 
                                 required 
                              />
                           </FormGroup>
                           <Button className='btn auth__btn' type='submit'>
                              Sign In
                           </Button>
                        </Form>

                        {/* Demo Admin Helper Box for Interviewers */}
                        <div className="demo-credentials-badge mt-4 text-start">
                           <div className="d-flex align-items-center justify-content-between">
                              <strong className="text-dark"><i className="ri-key-2-line text-warning me-1"></i>Demo Admin Account:</strong>
                              <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none fw-bold" onClick={fillDemoAdmin}>
                                 Auto-Fill
                              </button>
                           </div>
                           <small className="d-block text-muted">Email: appu1444@gmail.com | Pass: 1234</small>
                        </div>

                        <p className="mb-0">Don't have an account? <Link to='/register'>Create Account</Link></p>
                     </div>
                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   )
}

export default Login