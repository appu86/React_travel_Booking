import React, { useState } from 'react'
import { Container, Row, Col, Form, FormGroup, Button } from 'reactstrap'
import '../styles/login.css'
import { Link, useNavigate } from 'react-router-dom'
import registerImg from '../assets/images/login.png'
import { BASE_URL } from '../utils/config'

const Register = () => {
   const [credentials, setCredentials] = useState({
      username: "",
      email: "",
      password: ""
   })

   const [loading, setLoading] = useState(false)
   const navigate = useNavigate()

   const handleChange = (e) => {
      setCredentials((prev) => ({
         ...prev,
         [e.target.id]: e.target.value
      }))
   }

   const handleClick = async (e) => {
      e.preventDefault()

      if (!credentials.username || !credentials.email || !credentials.password) {
         return alert("⚠️ All fields are required!")
      }

      try {
         setLoading(true)

         const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
         })

         let result
         try {
            result = await res.json()
         } catch {
            throw new Error("Invalid server response")
         }

         if (!res.ok) {
            return alert(result.message || "Registration failed")
         }

         alert("✅ Registration successful! Please sign in with your credentials.")
         navigate('/login')

      } catch (err) {
         console.error("Registration error:", err)
         alert(err.message || "Server error. Check backend connection.")
      } finally {
         setLoading(false)
      }
   }

   return (
      <section className="py-5 bg-light" style={{ minHeight: '85vh' }}>
         <Container>
            <Row>
               <Col lg='10' xl='9' className='m-auto'>
                  <div className="login__container d-flex">
                     
                     <div className="login__img text-white text-center">
                        <img src={registerImg} alt="Register Illustration" className="mb-4" />
                        <h4 className="fw-bold">Join Travel World</h4>
                        <p className="text-white-50 small mb-0">Create an account to book tours, select seats, and manage reservations.</p>
                     </div>

                     <div className="login__form">
                        <div className="mb-4">
                           <h2>Create Account ✨</h2>
                           <p className="text-muted small mb-0 text-start">Fill in your details to start exploring global tour packages.</p>
                        </div>

                        <Form onSubmit={handleClick}>
                           <FormGroup className="mb-3">
                              <label className="fw-bold small text-secondary mb-1">Username</label>
                              <input 
                                 type="text" 
                                 placeholder="Choose a username"
                                 id="username"
                                 value={credentials.username}
                                 onChange={handleChange}
                                 required
                              />
                           </FormGroup>

                           <FormGroup className="mb-3">
                              <label className="fw-bold small text-secondary mb-1">Email Address</label>
                              <input 
                                 type="email"
                                 placeholder="name@example.com"
                                 id="email"
                                 value={credentials.email}
                                 onChange={handleChange}
                                 required
                              />
                           </FormGroup>

                           <FormGroup className="mb-4">
                              <label className="fw-bold small text-secondary mb-1">Password</label>
                              <input 
                                 type="password"
                                 placeholder="Create a strong password"
                                 id="password"
                                 value={credentials.password}
                                 onChange={handleChange}
                                 required
                              />
                           </FormGroup>

                           <Button 
                              className='btn auth__btn'
                              type='submit'
                              disabled={loading}
                           >
                              {loading ? "Registering..." : "Create Account"}
                           </Button>
                        </Form>

                        <p className="mb-0">
                           Already have an account? <Link to='/login'>Sign In</Link>
                        </p>
                     </div>

                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   )
}

export default Register