import React, { useEffect, useRef, useContext } from 'react'
import { Container, Row, Button } from 'reactstrap'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import Logo from '../../assets/images/logo.png'
import "./header.css"
import { AuthContext } from '../../context/AuthContext'

const nav__links = [
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

const Header = () => {
   const headerRef = useRef(null)
   const menuRef = useRef(null)
   const navigate = useNavigate()
   const { user, dispatch } = useContext(AuthContext)

   const logout = () => {
      dispatch({ type: 'LOGOUT' })
      navigate('/')
   }

   useEffect(() => {
      const handleScroll = () => {
         if (!headerRef.current) return

         if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
            headerRef.current.classList.add('sticky__header')
         } else {
            headerRef.current.classList.remove('sticky__header')
         }
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
   }, [])

   const toggleMenu = () => menuRef.current?.classList.toggle('show__menu')

   return (
      <header className='header' ref={headerRef}>
         <Container>
            <Row>
               <div className="nav__wrapper d-flex align-items-center justify-content-between">
                  {/* ========== LOGO ========== */}
                  <div className="logo">
                     <img src={Logo} alt="Travel Booking Logo" />
                  </div>

                  {/* ========== MENU START ========== */}
                  <div className="navigation" ref={menuRef} onClick={toggleMenu}>
                     <ul className="menu d-flex align-items-center gap-5">
                        {
                           nav__links.map((item, index) => (
                              <li className="nav__item" key={index}>
                                 <NavLink to={item.path} className={navClass => navClass.isActive ? 'active__link' : ''}>{item.display}</NavLink>
                              </li>
                           ))
                        }
                     </ul>
                  </div>

                  {/* ========== RIGHT NAV CONTROLS ========== */}
                  <div className="nav__right d-flex align-items-center gap-3">
                     <div className="nav__btns d-flex align-items-center gap-2">
                        {
                           user ? <>                                  <div className="user__profile__chip d-flex align-items-center gap-2">
                                     <div className="user__avatar">
                                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                     </div>
                                     <span className='user__name fw-bold me-1'>{user.username}</span>
                                  </div>
                                  <Button className='btn btn-outline-primary btn-sm rounded-pill px-3 me-1'>
                                     <Link to='/my-bookings' style={{textDecoration: 'none', color: 'inherit'}}>
                                        <i className="ri-bookmark-3-line me-1"></i> My Bookings
                                     </Link>
                                  </Button>
                                  {(user.role === 'admin' || user.isAdmin) && (
                                     <Button className='btn admin__nav__btn me-1'>
                                        <Link to='/admin' style={{color: '#fff', textDecoration: 'none'}}>
                                           <i className="ri-shield-user-line me-1"></i> Admin Panel
                                        </Link>
                                     </Button>
                                  )}
                                  <Button className='btn btn-outline-danger btn-sm rounded-pill px-3' onClick={logout}>
                                     <i className="ri-logout-box-r-line"></i> Logout
                                  </Button>
                              </> : <>
                                 <Button className='btn secondary__btn'><Link to='/login'>Login</Link></Button>
                                 <Button className='btn primary__btn'><Link to='/register'>Register</Link></Button>
                              </>
                        }
                     </div>

                     <span className="mobile__menu" onClick={toggleMenu}>
                        <i className="ri-menu-line"></i>
                     </span>
                  </div>
               </div>
            </Row>
         </Container>
      </header>
   )
}

export default Header