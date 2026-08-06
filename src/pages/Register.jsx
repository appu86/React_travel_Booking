import React, { useState } from 'react'
import { Container, Row, Col, Form, FormGroup, Button } from 'reactstrap'
import '../styles/login.css'
import { Link, useNavigate } from 'react-router-dom'
import registerImg from '../assets/images/login.png'
import userIcon from '../assets/images/user.png'
import { BASE_URL } from '../utils/config'

const Register = () => {
   const [credentials, setCredentials] = useState({
      username: "",
      email: "",
      password: ""
   })

   const [loading, setLoading] = useState(false)
   const navigate = useNavigate()

   // handle input change
   const handleChange = (e) => {
      setCredentials((prev) => ({
         ...prev,
         [e.target.id]: e.target.value
      }))
   }

   // handle submit
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

         // 🔥 handle non-JSON responses safely
         let result
         try {
            result = await res.json()
         } catch {
            throw new Error("Invalid server response")
         }

         if (!res.ok) {
            console.error("Backend error:", result)
            return alert(result.message || "Registration failed")
         }

         alert("✅ Registration successful!")
         navigate('/login')

      } catch (err) {
         console.error("Network/Server error:", err)
         alert("❌ Server error. Check backend or MongoDB connection.")
      } finally {
         setLoading(false)
      }
   }

   return (
      <section>
         <Container>
            <Row>
               <Col lg='8' className='m-auto'>
                  <div className="login__container d-flex justify-content-between">
                     
                     {/* image */}
                     <div className="login__img">
                        <img src={registerImg} alt="register" />
                     </div>

                     {/* form */}
                     <div className="login__form">
                        <div className="user">
                           <img src={userIcon} alt="user" />
                        </div>

                        <h2>Register</h2>

                        <Form onSubmit={handleClick}>
                           <FormGroup>
                              <input 
                                 type="text" 
                                 placeholder="Username"
                                 id="username"
                                 value={credentials.username}
                                 onChange={handleChange}
                                 required
                              />
                           </FormGroup>

                           <FormGroup>
                              <input 
                                 type="email"
                                 placeholder="Email"
                                 id="email"
                                 value={credentials.email}
                                 onChange={handleChange}
                                 required
                              />
                           </FormGroup>

                           <FormGroup>
                              <input 
                                 type="password"
                                 placeholder="Password"
                                 id="password"
                                 value={credentials.password}
                                 onChange={handleChange}
                                 required
                              />
                           </FormGroup>

                           <Button 
                              className='btn secondary__btn auth__btn'
                              type='submit'
                              disabled={loading}
                           >
                              {loading ? "Creating..." : "Create Account"}
                           </Button>
                        </Form>

                        <p>
                           Already have an account? <Link to='/login'>Login</Link>
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