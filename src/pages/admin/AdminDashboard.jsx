import React, { useState, useEffect, useContext } from 'react'
import { Container, Row, Col, Table, Button, Modal, Form, FormGroup, Alert, Spinner, Badge } from 'reactstrap'
import { BASE_URL } from '../../utils/config'
import { AuthContext } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatCurrency'
import './admin.css'

const AdminDashboard = () => {
   const [tours, setTours] = useState([])
   const [bookings, setBookings] = useState([])
   const [users, setUsers] = useState([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(null)
   const [showTourModal, setShowTourModal] = useState(false)
   const [showBookingModal, setShowBookingModal] = useState(false)
   const [showUserModal, setShowUserModal] = useState(false)
   const [selectedBooking, setSelectedBooking] = useState(null)
   const [selectedUser, setSelectedUser] = useState(null)
   const { user, setUser } = useContext(AuthContext)
   const [editingTour, setEditingTour] = useState(null)
   const [notifications, setNotifications] = useState([])
   const [showNotifications, setShowNotifications] = useState(false)
   const [searchTerm, setSearchTerm] = useState('')
   const [activeTab, setActiveTab] = useState('tours')
   const [showBookedUserModal, setShowBookedUserModal] = useState(false)
   const [selectedBookedUser, setSelectedBookedUser] = useState(null)

   const [tourForm, setTourForm] = useState({
      title: '',
      city: '',
      address: '',
      distance: '',
      photo: '',
      desc: '',
      price: '',
      maxGroupSize: ''
   })

   // Get token from multiple sources
   const getToken = () => {
      let token = null
      
      if (user?.token) {
         token = user.token
      }
      
      if (!token) {
         try {
            const userData = localStorage.getItem("user")
            if (userData) {
               const parsedUser = JSON.parse(userData)
               if (parsedUser?.token) {
                  token = parsedUser.token
               }
            }
         } catch (err) {
            console.error("Error parsing user:", err)
         }
      }
      
      if (!token) {
         token = localStorage.getItem("token")
      }
      
      return token
   }

   // Check if user is admin
   const isAdmin = () => {
      return user?.role === 'admin' || user?.isAdmin === true
   }

   // Refresh auth token
   const refreshAuthToken = async () => {
      try {
         const storedUser = localStorage.getItem("user")
         if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            if (parsedUser.token && setUser) {
               setUser(parsedUser)
               return parsedUser.token
            }
         }
      } catch (err) {
         console.error("Error refreshing auth:", err)
      }
      return null
   }

   useEffect(() => {
      const initDashboard = async () => {
         await refreshAuthToken()
         
         if (!isAdmin()) {
            setError("Access Denied: Admin privileges required.")
            setLoading(false)
            return
         }
         
        await fetchData()
      }
      
      initDashboard()
      
      // Request notification permission
      if (Notification.permission === 'default') {
         Notification.requestPermission()
      }
      
      // Set up polling for new bookings
      const interval = setInterval(() => {
         if (isAdmin()) {
            fetchNewBookings()
         }
      }, 30000)
      
      return () => clearInterval(interval)
   }, [user?.token])

   const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
         await Promise.all([fetchTours(), fetchBookings(), fetchUsers()])
      } catch (err) {
         console.error("Fetch error:", err)
         setError(err.message || 'Failed to load data')
      } finally {
         setLoading(false)
      }
   }

  // Fetch tours (public)
   const fetchTours = async () => {
      try {
         const res = await fetch(`${BASE_URL}/tours`)
         if (!res.ok) throw new Error(`HTTP ${res.status}`)
         const data = await res.json()
         
         if (data.success && data.data) {
            setTours(data.data)
         } else if (Array.isArray(data)) {
            setTours(data)
         } else {
            setTours([])
         }
      } catch (err) {
         console.error("Error fetching tours:", err)
         setError("Failed to load tours: " + err.message)
         setTours([])
      }
   }

   // Fetch bookings (protected)
   const fetchBookings = async () => {
      const token = getToken()
      if (!token) {
         setBookings([])
         return
      }

      try {
         const res = await fetch(`${BASE_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
         })

         if (res.status === 401) {
            const newToken = await refreshAuthToken()
            if (newToken) {
               const retryRes = await fetch(`${BASE_URL}/bookings`, {
                  headers: { 'Authorization': `Bearer ${newToken}` }
               })
               if (retryRes.ok) {
                  const data = await retryRes.json()
                  if (data.success && data.data) {
                     setBookings(data.data)
                     return
                  }
               }
            }
            setBookings([])
            return
         }

         if (!res.ok) throw new Error(`HTTP ${res.status}`)

         const data = await res.json()
         
         if (data.success && data.data) {
            setBookings(data.data)
         } else if (Array.isArray(data)) {
            setBookings(data)
         } else {
            setBookings([])
         }
      } catch (err) {
         console.error("Error fetching bookings:", err)
         setBookings([])
      }
   }

   // Fetch new bookings for notifications
   const fetchNewBookings = async () => {
      const token = getToken()
      if (!token) return
      
      try {
         const res = await fetch(`${BASE_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
         })
         const data = await res.json()
         
         if (data.success && data.data) {
            const newBookings = data.data.filter(b => 
               !notifications.some(n => n._id === b._id) && 
               b.status === 'pending'
            )
            
            if (newBookings.length > 0) {
               setNotifications(prev => [...newBookings, ...prev])
               
               // Show browser notification
               if (Notification.permission === 'granted') {
                  newBookings.forEach(booking => {
                     new Notification('New Booking!', {
                        body: `${booking.fullName} booked ${booking.tourName}`,
                        icon: '/favicon.ico'
                     })
                  })
               }
            }
         }
      } catch (err) {
         console.error('Error fetching new bookings:', err)
      }
   }

   // Fetch users (protected)
   const fetchUsers = async () => {
      const token = getToken()
      if (!token) {
         setUsers([])
         return
      }

      try {
         const res = await fetch(`${BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
         })

         if (res.status === 401) {
            const newToken = await refreshAuthToken()
            if (newToken) {
               const retryRes = await fetch(`${BASE_URL}/users`, {
                  headers: { 'Authorization': `Bearer ${newToken}` }
               })
               if (retryRes.ok) {
                  const data = await retryRes.json()
                  if (data.success && data.data) {
                     setUsers(data.data)
                     return
                  }
               }
            }
            setUsers([])
            return
         }

         if (!res.ok) throw new Error(`HTTP ${res.status}`)

         const data = await res.json()
         
         if (data.success && data.data) {
            setUsers(data.data)
         } else if (Array.isArray(data)) {
            setUsers(data)
         } else {
            setUsers([])
         }
      } catch (err) {
         console.error("Error fetching users:", err)
         setUsers([])
      }
   }

   // Create/Update tour
   const handleTourSubmit = async (e) => {
      e.preventDefault()
      
      const token = getToken()
      if (!token) {
         setError("Please login first")
         return
      }

      if (!tourForm.title || !tourForm.city || !tourForm.price) {
         setError("Please fill in all required fields (Title, City, Price)")
         return
      }

      try {
         const method = editingTour ? 'PUT' : 'POST'
         const url = editingTour
            ? `${BASE_URL}/tours/${editingTour}`
            : `${BASE_URL}/tours`

         const res = await fetch(url, {
            method,
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
               ...tourForm,
               price: Number(tourForm.price),
               distance: Number(tourForm.distance) || 0,
               maxGroupSize: Number(tourForm.maxGroupSize) || 10
            })
         })

         if (res.status === 401) {
            setError("Authentication failed. Please logout and login again.")
            return
         }

         const data = await res.json()

         if (!res.ok) {
            setError(data.message || `Failed to ${editingTour ? 'update' : 'create'} tour`)
            return
         }

         setShowTourModal(false)
         await fetchTours()
         
         setEditingTour(null)
         setTourForm({
            title: '',
            city: '',
            address: '',
            distance: '',
            photo: '',
            desc: '',
            price: '',
            maxGroupSize: ''
         })
         
         alert(`Tour ${editingTour ? 'updated' : 'created'} successfully!`)
      } catch (err) {
         console.error("Error saving tour:", err)
         setError("Error saving tour: " + err.message)
      }
   }

   // Delete tour
   const handleDeleteTour = async (id) => {
      const token = getToken()
      if (!token) {
         setError("Login required")
         return
      }

      if (!window.confirm("Delete this tour? This action cannot be undone.")) return

      try {
         const res = await fetch(`${BASE_URL}/tours/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
         })

         if (!res.ok) throw new Error(`HTTP ${res.status}`)

         await fetchTours()
         alert("Tour deleted successfully")
      } catch (err) {
         console.error("Error deleting tour:", err)
         setError("Error deleting tour: " + err.message)
      }
   }

   // Delete booking
   const handleDeleteBooking = async (id) => {
      const token = getToken()
      if (!token) {
         setError("Login required")
         return
      }

      if (!window.confirm("Delete this booking? This action cannot be undone.")) return

      try {
         const res = await fetch(`${BASE_URL}/bookings/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
         })

         if (!res.ok) throw new Error(`HTTP ${res.status}`)

         await fetchBookings()
         alert("Booking deleted successfully")
      } catch (err) {
         console.error("Error deleting booking:", err)
         setError("Error deleting booking: " + err.message)
      }
   }

   // Confirm booking
   const handleConfirmBooking = async (id) => {
      const token = getToken()
      if (!token) return

      try {
         const res = await fetch(`${BASE_URL}/bookings/${id}`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'confirmed' })
         })

         if (res.ok) {
            await fetchBookings()
            setNotifications(notifications.filter(n => n._id !== id))
            alert("Booking confirmed successfully!")
         } else {
            const data = await res.json()
            alert(data.message || "Failed to confirm booking")
         }
      } catch (err) {
         console.error("Error confirming booking:", err)
         alert("Error: " + err.message)
      }
   }

   const viewBookingDetails = (booking) => {
      setSelectedBooking(booking)
      setShowBookingModal(true)
   }

   const viewUserDetails = (userObj) => {
      setSelectedUser(userObj)
      setShowUserModal(true)
   }

   // Delete user
   const handleDeleteUser = async (userId) => {
      const token = getToken()
      if (!token) {
         setError("Login required")
         return
      }

      if (!window.confirm("Delete this user? This action cannot be undone.")) return

      try {
         const res = await fetch(`${BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
         })

         if (!res.ok) throw new Error(`HTTP ${res.status}`)

         await fetchUsers()
         alert("User deleted successfully")
      } catch (err) {
         console.error("Error deleting user:", err)
         setError("Error deleting user: " + err.message)
      }
   }

   const handleEditTour = (tour) => {
      setEditingTour(tour._id)
      setTourForm({
         title: tour.title || '',
         city: tour.city || '',
         address: tour.address || '',
         distance: tour.distance || '',
         photo: tour.photo || '',
         desc: tour.desc || '',
         price: tour.price || '',
         maxGroupSize: tour.maxGroupSize || ''
      })
      setShowTourModal(true)
   }

   const openNewTourModal = () => {
      setEditingTour(null)
      setTourForm({
         title: '',
         city: '',
         address: '',
         distance: '',
         photo: '',
         desc: '',
         price: '',
         maxGroupSize: ''
      })
      setShowTourModal(true)
   }

   // Filter tours based on search
   const filteredTours = tours.filter(tour =>
      tour.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.city?.toLowerCase().includes(searchTerm.toLowerCase())
   )

   // Get booked users with their booking details
   const getBookedUsers = () => {
      const bookedUsersMap = new Map()
      const usersById = new Map(users.map(u => [String(u._id || u.id), u]))
      
      bookings.forEach(booking => {
         const userId = booking.userId || booking.userId === 0 ? String(booking.userId) : null
         const userProfile = userId ? usersById.get(userId) : null
         const key = userId || booking.email || booking.fullName || `${booking._id}`
         const email = booking.email || userProfile?.email || 'Unknown'
         const fullName = booking.fullName || userProfile?.username || userProfile?.name || 'Unknown'
         const phone = booking.phone || userProfile?.phone || 'N/A'

         if (!bookedUsersMap.has(key)) {
            bookedUsersMap.set(key, {
               userId: userId || userProfile?._id || null,
               email,
               fullName,
               phone,
               bookings: [],
               totalSpent: 0
            })
         }
         
         const userData = bookedUsersMap.get(key)
         userData.bookings.push(booking)
         userData.totalSpent += booking.totalAmount || 0
      })
      
      return Array.from(bookedUsersMap.values()).sort((a, b) => b.bookings.length - a.bookings.length)
   }

   const bookedUsers = getBookedUsers()

   const checkAuthStatus = () => {
      const token = getToken()
      console.log("=== AUTH STATUS ===")
      console.log("User:", user)
      console.log("Token exists:", !!token)
      console.log("Is Admin:", isAdmin())
      alert(`Auth Status:\nToken: ${token ? 'Present' : 'Missing'}\nAdmin: ${isAdmin()}\nUser: ${user?.email || 'No user'}`)
   }

   if (loading) {
      return (
         <div className="text-center mt-5">
            <Spinner color="primary" size="lg" />
            <h4 className="mt-3">Loading Dashboard...</h4>
         </div>
      )
   }
   
   if (error) {
      return (
         <Container className="mt-5">
            <Alert color="danger">
               <h4 className="alert-heading">Error</h4>
               <p>{error}</p>
               <hr />
               <Button color="primary" onClick={() => window.location.reload()}>
                  Retry
               </Button>
            </Alert>
         </Container>
      )
   }

   return (
      <div className="admin-dashboard">
         <Container fluid>
            {/* Header with Notifications */}
            <Row className="mb-4">
               <Col lg="12">
                  <div className="dashboard-header">
                     <div className="d-flex justify-content-between align-items-center">
                        <div>
                           <h1>Admin Dashboard</h1>
                           <p>Welcome back, {user?.name || user?.email || 'Admin'}!</p>
                        </div>
                        <div className="notification-area">
                           <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                              <i className="ri-notification-3-line"></i>
                              {notifications.length > 0 && (
                                 <span className="notification-badge">{notifications.length}</span>
                              )}
                              {showNotifications && notifications.length > 0 && (
                                 <div className="notification-dropdown">
                                    <h5>New Bookings</h5>
                                    {notifications.map(notif => (
                                       <div key={notif._id} className="notification-item">
                                          <p><strong>{notif.fullName}</strong> booked <strong>{notif.tourName}</strong></p>
                                          <small>{new Date(notif.bookAt).toLocaleString()}</small>
                                          <div className="mt-2">
                                             <Button size="sm" color="success" onClick={() => handleConfirmBooking(notif._id)}>
                                                Confirm
                                             </Button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              )}
                           </div>
                           <Button size="sm" color="info" onClick={checkAuthStatus} className="ms-2">
                              Debug
                           </Button>
                        </div>
                     </div>
                  </div>
               </Col>
            </Row>

            {/* Stats Cards */}
            <Row className="mb-4">
               <Col lg="3" md="6" className="mb-3">
                  <div className="stat-card bg-primary text-white">
                     <h3>{tours.length}</h3>
                     <p>Total Tours</p>
                  </div>
               </Col>
               <Col lg="3" md="6" className="mb-3">
                  <div className="stat-card bg-success text-white">
                     <h3>{bookings.length}</h3>
                     <p>Total Bookings</p>
                  </div>
               </Col>
               <Col lg="3" md="6" className="mb-3">
                  <div className="stat-card bg-info text-white">
                     <h3>{bookings.filter(b => b.status === 'confirmed').length}</h3>
                     <p>Confirmed Bookings</p>
                  </div>
               </Col>
               <Col lg="3" md="6" className="mb-3">
                  <div className="stat-card bg-warning text-white">
                     <h3>{formatINR(bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.totalAmount || 0), 0))}</h3>
                     <p>Total Revenue</p>
                  </div>
               </Col>
            </Row>

            {/* Search Bar */}
            <Row className="mb-3">
               <Col lg="12">
                  <input
                     type="text"
                     className="form-control"
                     placeholder="Search tours by title or city..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     style={{ maxWidth: '300px' }}
                  />
               </Col>
            </Row>

            {/* Tours Management */}
            <Row className="mb-4">
               <Col lg="12">
                  <div className="section-card">
                     <div className="section-header d-flex justify-content-between align-items-center mb-3">
                        <h2>Tours Management</h2>
                        <Button color="primary" onClick={openNewTourModal}>
                           + Add New Tour
                        </Button>
                     </div>
                     
                     <div className="table-responsive">
                        <Table hover striped className="admin-table">
                           <thead>
                              <tr>
                                 <th>Title</th>
                                 <th>City</th>
                                 <th>Price</th>
                                 <th>Distance</th>
                                 <th>Max Size</th>
                                 <th>Actions</th>
                               </tr>
                           </thead>
                           <tbody>
                              {filteredTours.length === 0 ? (
                                 <tr>
                                    <td colSpan="6" className="text-center">No tours found</td>
                                 </tr>
                              ) : (
                                 filteredTours.map(tour => (
                                    <tr key={tour._id}>
                                       <td><strong>{tour.title}</strong></td>
                                       <td>{tour.city}</td>
                                       <td>{formatINR(tour.price)}</td>
                                       <td>{tour.distance} km</td>
                                       <td>{tour.maxGroupSize}</td>
                                       <td>
                                          <Button size="sm" color="warning" onClick={() => handleEditTour(tour)} className="me-2">
                                             Edit
                                          </Button>
                                          <Button size="sm" color="danger" onClick={() => handleDeleteTour(tour._id)}>
                                             Delete
                                          </Button>
                                        </td>
                                       </tr>
                                 ))
                              )}
                           </tbody>
                        </Table>
                     </div>
                  </div>
               </Col>
            </Row>

            {/* Bookings Management */}
            <Row className="mb-4">
               <Col lg="12">
                  <div className="section-card">
                     <div className="section-header mb-3">
                        <h2>Bookings Management</h2>
                     </div>
                     
                     <div className="table-responsive">
                        <Table hover striped className="admin-table">
                           <thead>
                             <tr>
                                 <th>Customer Name</th>
                                 <th>Tour Name</th>
                                 <th>Booking Date</th>
                                 <th>Guest Size</th>
                                 <th>Status</th>
                                 <th>Actions</th>
                               </tr>
                           </thead>
                           <tbody>
                              {bookings.length === 0 ? (
                                 <tr>
                                    <td colSpan="6" className="text-center">No bookings found</td>
                                 </tr>
                              ) : (
                                 bookings.map(booking => (
                                    <tr key={booking._id}>
                                       <td>
                                          <strong>{booking.fullName}</strong>
                                          <br />
                                          <small>{booking.email}</small>
                                       </td>
                                       <td>{booking.tourName}</td>
                                       <td>{new Date(booking.bookAt).toLocaleDateString()}</td>
                                       <td>{booking.guestSize}</td>
                                       <td>
                                          <Badge color={
                                             booking.status === 'confirmed' ? 'success' :
                                             booking.status === 'pending' ? 'warning' :
                                             booking.status === 'cancelled' ? 'danger' : 'secondary'
                                          }>
                                             {booking.status || 'pending'}
                                          </Badge>
                                       </td>
                                       <td>
                                          <Button size="sm" color="info" onClick={() => viewBookingDetails(booking)} className="me-2">
                                             View
                                          </Button>
                                          {booking.status === 'pending' && (
                                             <Button size="sm" color="success" onClick={() => handleConfirmBooking(booking._id)} className="me-2">
                                                Confirm
                                             </Button>
                                          )}
                                          <Button size="sm" color="danger" onClick={() => handleDeleteBooking(booking._id)}>
                                             Delete
                                          </Button>
                                       </td>
                                    </tr>
                                 ))
                              )}
                           </tbody>
                        </Table>
                     </div>
                  </div>
               </Col>
            </Row>

            {/* Booked Users Section */}
            <Row className="mb-4">
               <Col lg="12">
                  <div className="section-card">
                     <div className="section-header mb-3">
                        <h2>Booked Users Report</h2>
                     </div>
                     
                     <div className="table-responsive">
                        <Table hover striped className="admin-table">
                           <thead>
                             <tr>
                                 <th>Customer Name</th>
                                 <th>Email</th>
                                 <th>Phone</th>
                                 <th>Total Bookings</th>
                                 <th>Total Spent</th>
                                 <th>Latest Booking</th>
                               </tr>
                           </thead>
                           <tbody>
                              {bookedUsers.length === 0 ? (
                                 <tr>
                                    <td colSpan="6" className="text-center">No bookings found</td>
                                 </tr>
                              ) : (
                                 bookedUsers.map((user, idx) => (
                                    <tr key={idx}>
                                       <td>
                                          <strong>{user.fullName}</strong>
                                       </td>
                                       <td>{user.email}</td>
                                       <td>{user.phone || 'N/A'}</td>
                                       <td>
                                          <Badge color="info">{user.bookings.length}</Badge>
                                       </td>
                                       <td>{formatINR(user.totalSpent)}</td>
                                       <td>{new Date(Math.max(...user.bookings.map(b => new Date(b.bookAt)))).toLocaleDateString()}</td>
                                    </tr>
                                 ))
                              )}
                           </tbody>
                        </Table>
                     </div>
                  </div>
               </Col>
            </Row>

            {/* Users Management */}
            <Row className="mb-4">
               <Col lg="12">
                  <div className="section-card">
                     <div className="section-header mb-3">
                        <h2>Users Management</h2>
                     </div>
                     
                     <div className="table-responsive">
                        <Table hover striped className="admin-table">
                           <thead>
                             <tr>
                                 <th>Name</th>
                                 <th>Email</th>
                                 <th>Role</th>
                                 <th>Phone</th>
                                 <th>Actions</th>
                               </tr>
                           </thead>
                           <tbody>
                              {users.length === 0 ? (
                                 <tr>
                                    <td colSpan="5" className="text-center">No users found</td>
                                 </tr>
                              ) : (
                                 users.map(userObj => (
                                    <tr key={userObj._id}>
                                       <td>
                                          <strong>{userObj.username || 'N/A'}</strong>
                                       </td>
                                       <td>{userObj.email}</td>
                                       <td>
                                          <Badge color={userObj.role === 'admin' ? 'primary' : 'secondary'}>
                                             {userObj.role || 'user'}
                                          </Badge>
                                       </td>
                                       <td>{userObj.phone || 'N/A'}</td>
                                       <td>
                                          <Button size="sm" color="info" onClick={() => viewUserDetails(userObj)} className="me-2">
                                             View
                                          </Button>
                                          <Button size="sm" color="danger" onClick={() => handleDeleteUser(userObj._id)}>
                                             Delete
                                          </Button>
                                       </td>
                                    </tr>
                                 ))
                              )}
                           </tbody>
                        </Table>
                     </div>
                  </div>
               </Col>
            </Row>
         </Container>

        {/* Tour Modal */}
        <Modal isOpen={showTourModal} toggle={() => setShowTourModal(false)} size="lg">
           <div className="modal-header">
              <h5 className="modal-title">{editingTour ? 'Edit Tour' : 'Add New Tour'}</h5>
              <button type="button" className="btn-close" onClick={() => setShowTourModal(false)}></button>
           </div>
           
           <Form onSubmit={handleTourSubmit}>
              <div className="modal-body">
                 <Row>
                    <Col md="6">
                       <FormGroup>
                          <label>Title *</label>
                          <input type="text" className="form-control" placeholder="Tour Title" 
                             value={tourForm.title}
                             onChange={e => setTourForm({ ...tourForm, title: e.target.value })} 
                             required />
                       </FormGroup>
                    </Col>
                    <Col md="6">
                       <FormGroup>
                          <label>City *</label>
                          <input type="text" className="form-control" placeholder="City" 
                             value={tourForm.city}
                             onChange={e => setTourForm({ ...tourForm, city: e.target.value })} 
                             required />
                       </FormGroup>
                    </Col>
                 </Row>
                 
                 <Row>
                    <Col md="6">
                       <FormGroup>
                          <label>Price *</label>
                          <input type="number" className="form-control" placeholder="Price" 
                             value={tourForm.price}
                             onChange={e => setTourForm({ ...tourForm, price: e.target.value })} 
                             required />
                       </FormGroup>
                    </Col>
                    <Col md="6">
                       <FormGroup>
                          <label>Distance (km)</label>
                          <input type="number" className="form-control" placeholder="Distance" 
                             value={tourForm.distance}
                             onChange={e => setTourForm({ ...tourForm, distance: e.target.value })} />
                       </FormGroup>
                    </Col>
                 </Row>
                 
                 <Row>
                    <Col md="6">
                       <FormGroup>
                          <label>Address</label>
                          <input type="text" className="form-control" placeholder="Address" 
                             value={tourForm.address}
                             onChange={e => setTourForm({ ...tourForm, address: e.target.value })} />
                       </FormGroup>
                    </Col>
                    <Col md="6">
                       <FormGroup>
                          <label>Max Group Size</label>
                          <input type="number" className="form-control" placeholder="Max Group Size" 
                             value={tourForm.maxGroupSize}
                             onChange={e => setTourForm({ ...tourForm, maxGroupSize: e.target.value })} />
                       </FormGroup>
                    </Col>
                 </Row>
                 
                 <FormGroup>
                    <label>Photo URL</label>
                    <input type="text" className="form-control" placeholder="Photo URL" 
                       value={tourForm.photo}
                       onChange={e => setTourForm({ ...tourForm, photo: e.target.value })} />
                 </FormGroup>
                 
                 <FormGroup>
                    <label>Description</label>
                    <textarea className="form-control" rows="3" placeholder="Tour Description" 
                       value={tourForm.desc}
                       onChange={e => setTourForm({ ...tourForm, desc: e.target.value })} />
                 </FormGroup>
              </div>
              
              <div className="modal-footer">
                 <Button color="secondary" onClick={() => setShowTourModal(false)}>Cancel</Button>
                 <Button type="submit" color="primary">{editingTour ? "Update Tour" : "Create Tour"}</Button>
              </div>
           </Form>
        </Modal>

        {/* Booking Details Modal */}
        <Modal isOpen={showBookingModal} toggle={() => setShowBookingModal(false)} size="lg">
           <div className="modal-header">
              <h5 className="modal-title">Booking Details</h5>
              <button type="button" className="btn-close" onClick={() => setShowBookingModal(false)}></button>
           </div>
           <div className="modal-body">
              {selectedBooking && (
                 <div>
                    <h6>Customer Information</h6>
                    <p><strong>Name:</strong> {selectedBooking.fullName}</p>
                    <p><strong>Email:</strong> {selectedBooking.email}</p>
                    <p><strong>Phone:</strong> {selectedBooking.phone}</p>
                    
                    <h6 className="mt-3">Tour Information</h6>
                    <p><strong>Tour:</strong> {selectedBooking.tourName}</p>
                    <p><strong>Booking Date:</strong> {new Date(selectedBooking.bookAt).toLocaleString()}</p>
                    <p><strong>Guest Size:</strong> {selectedBooking.guestSize}</p>
                    <p><strong>Total Amount:</strong> {formatINR(selectedBooking.totalAmount || 0)}</p>
                    <p><strong>Status:</strong> <Badge color="warning">{selectedBooking.status || 'pending'}</Badge></p>
                    
                    {selectedBooking.specialRequests && (
                       <>
                          <h6 className="mt-3">Special Requests</h6>
                          <p>{selectedBooking.specialRequests}</p>
                       </>
                    )}
                 </div>
              )}
           </div>
           <div className="modal-footer">
              <Button color="secondary" onClick={() => setShowBookingModal(false)}>Close</Button>
           </div>
        </Modal>

        {/* User Details Modal */}
        <Modal isOpen={showUserModal} toggle={() => setShowUserModal(false)} size="lg">
           <div className="modal-header">
              <h5 className="modal-title">User Details</h5>
              <button type="button" className="btn-close" onClick={() => setShowUserModal(false)}></button>
           </div>
           <div className="modal-body">
              {selectedUser && (
                 <div>
                    <h6>User Information</h6>
                    <p><strong>Name:</strong> {selectedUser.username || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                    <p><strong>Role:</strong> <Badge color={selectedUser.role === 'admin' ? 'primary' : 'secondary'}>{selectedUser.role || 'user'}</Badge></p>
                    {selectedUser.photo && (
                       <>
                          <h6 className="mt-3">Photo</h6>
                          <img src={selectedUser.photo} alt="User" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                       </>
                    )}
                 </div>
              )}
           </div>
           <div className="modal-footer">
              <Button color="secondary" onClick={() => setShowUserModal(false)}>Close</Button>
           </div>
        </Modal>
      </div>
   )
}

export default AdminDashboard