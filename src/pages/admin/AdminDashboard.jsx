/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import { 
   Container, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, 
   Form, FormGroup, Label, Input, Badge, Spinner, Alert, Nav, NavItem, NavLink 
} from 'reactstrap';
import { BASE_URL } from '../../utils/config';
import { AuthContext } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatCurrency';
import './admin.css';

const PRESET_PHOTOS = [
  { name: "London", url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80" },
  { name: "Bali", url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80" },
  { name: "Swiss Alps", url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80" },
  { name: "Tokyo", url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80" },
  { name: "Paris", url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80" },
  { name: "Taj Mahal", url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80" },
  { name: "Maldives", url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80" },
  { name: "Santorini", url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80" }
];

const AdminDashboard = () => {
   const [tours, setTours] = useState([]);
   const [bookings, setBookings] = useState([]);
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [successMsg, setSuccessMsg] = useState('');
   const [activeTab, setActiveTab] = useState('overview');
   const [searchTerm, setSearchTerm] = useState('');

   // Modals
   const [showTourModal, setShowTourModal] = useState(false);
   const [editingTour, setEditingTour] = useState(null);

   const { user } = useContext(AuthContext);

   // Form State
   const [tourForm, setTourForm] = useState({
      title: '',
      city: '',
      address: '',
      distance: '',
      photo: PRESET_PHOTOS[0].url,
      desc: '',
      price: '',
      maxGroupSize: '10',
      featured: true,
      createdBy: 'Admin'
   });

   const getToken = () => {
      let token = user?.token;
      if (!token) {
         try {
            const userData = localStorage.getItem("user");
            if (userData) {
               const parsedUser = JSON.parse(userData);
               token = parsedUser?.token;
            }
         } catch (err) {
            console.error("Error parsing user token", err);
         }
      }
      if (!token) {
         token = localStorage.getItem("token");
      }
      return token;
   };

   const isAdmin = () => {
      return user?.role === 'admin' || user?.isAdmin === true;
   };

   useEffect(() => {
      fetchData();
   }, [user?.token]);

   const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
         await Promise.all([fetchTours(), fetchBookings(), fetchUsers()]);
      } catch (err) {
         console.error("Fetch error:", err);
         setError(err.message || 'Failed to load dashboard data');
      } finally {
         setLoading(false);
      }
   };

   const fetchTours = async () => {
      try {
         const res = await fetch(`${BASE_URL}/tours?limit=100`);
         if (!res.ok) throw new Error(`HTTP ${res.status}`);
         const data = await res.json();
         if (data.success && data.data) {
            setTours(data.data);
         } else if (Array.isArray(data)) {
            setTours(data);
         }
      } catch (err) {
         console.error("Error fetching tours:", err);
      }
   };

   const fetchBookings = async () => {
      const token = getToken();
      if (!token) return;
      try {
         const res = await fetch(`${BASE_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (!res.ok) return;
         const data = await res.json();
         if (data.success && data.data) {
            setBookings(data.data);
         }
      } catch (err) {
         console.error("Error fetching bookings:", err);
      }
   };

   const fetchUsers = async () => {
      const token = getToken();
      if (!token) return;
      try {
         const res = await fetch(`${BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (!res.ok) return;
         const data = await res.json();
         if (data.success && data.data) {
            setUsers(data.data);
         }
      } catch (err) {
         console.error("Error fetching users:", err);
      }
   };

   // Open Create/Edit Modal
   const handleOpenTourModal = (tour = null) => {
      if (tour) {
         setEditingTour(tour._id);
         setTourForm({
            title: tour.title || '',
            city: tour.city || '',
            address: tour.address || '',
            distance: tour.distance || '',
            photo: tour.photo || PRESET_PHOTOS[0].url,
            desc: tour.desc || '',
            price: tour.price || '',
            maxGroupSize: tour.maxGroupSize || '10',
            featured: tour.featured || false,
            createdBy: tour.createdBy || 'Admin'
         });
      } else {
         setEditingTour(null);
         setTourForm({
            title: '',
            city: '',
            address: '',
            distance: '',
            photo: PRESET_PHOTOS[0].url,
            desc: '',
            price: '',
            maxGroupSize: '10',
            featured: true,
            createdBy: 'Admin'
         });
      }
      setShowTourModal(true);
   };

   // Tour Form Submit
   const handleTourSubmit = async (e) => {
      e.preventDefault();
      const token = getToken();
      if (!token) {
         setError("Admin authentication token required. Please login.");
         return;
      }

      if (!tourForm.title || !tourForm.city || !tourForm.price) {
         setError("Please fill in required fields (Title, City, Price)");
         return;
      }

      try {
         const method = editingTour ? 'PUT' : 'POST';
         const url = editingTour ? `${BASE_URL}/tours/${editingTour}` : `${BASE_URL}/tours`;

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
               maxGroupSize: Number(tourForm.maxGroupSize) || 10,
               createdBy: tourForm.createdBy || 'Admin'
            })
         });

         const data = await res.json();
         if (!res.ok) throw new Error(data.message || 'Operation failed');

         setShowTourModal(false);
         setSuccessMsg(`Tour successfully ${editingTour ? 'updated' : 'created by Admin'}!`);
         setTimeout(() => setSuccessMsg(''), 4000);
         await fetchTours();
      } catch (err) {
         console.error("Save tour error:", err);
         setError(err.message || "Failed to save tour");
      }
   };

   // Toggle Featured
   const handleToggleFeatured = async (tour) => {
      const token = getToken();
      if (!token) return;
      try {
         const res = await fetch(`${BASE_URL}/tours/${tour._id}`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ featured: !tour.featured })
         });
         if (res.ok) {
            fetchTours();
         }
      } catch (err) {
         console.error("Toggle featured error:", err);
      }
   };

   // Delete Tour
   const handleDeleteTour = async (id) => {
      if (!window.confirm("Are you sure you want to delete this tour?")) return;
      const token = getToken();
      if (!token) return;
      try {
         const res = await fetch(`${BASE_URL}/tours/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (res.ok) {
            setSuccessMsg("Tour deleted successfully");
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchTours();
         }
      } catch (err) {
         console.error("Delete tour error:", err);
      }
   };

   // Confirm Booking and Notify Payment Mode
   const handleConfirmBooking = async (booking) => {
      const token = getToken();
      if (!token) return;

      const paymentMode = window.prompt(
         "Enter payment mode & instructions to notify customer (e.g., UPI/GPay 9876543210, Bank Transfer, Cash at Tour):",
         booking.paymentMode || "UPI / GPay (Admin Contact: 9876543210)"
      );

      if (paymentMode === null) return; // User cancelled prompt

      try {
         const res = await fetch(`${BASE_URL}/bookings/${booking._id}`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
               status: 'confirmed',
               paymentMode: paymentMode || 'Notified by Admin Team'
            })
         });
         if (res.ok) {
            setSuccessMsg("Booking accepted & Payment mode notified to customer!");
            setTimeout(() => setSuccessMsg(''), 4000);
            fetchBookings();
         }
      } catch (err) {
         console.error("Confirm booking error:", err);
      }
   };

   // Delete Booking
   const handleDeleteBooking = async (id) => {
      if (!window.confirm("Delete this booking record?")) return;
      const token = getToken();
      if (!token) return;
      try {
         const res = await fetch(`${BASE_URL}/bookings/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (res.ok) {
            setSuccessMsg("Booking record deleted");
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchBookings();
         }
      } catch (err) {
         console.error("Delete booking error:", err);
      }
   };

   // Revenue calculation
   const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || b.price || 0), 0);

   // Filtered Tours
   const filteredTours = tours.filter(t => 
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.city?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   // Filtered Bookings
   const filteredBookings = bookings.filter(b => 
      b.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.tourName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   // Filtered Users
   const filteredUsers = users.filter(u => 
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   if (!isAdmin()) {
      return (
         <Container className="py-5 text-center">
            <Alert color="danger" className="py-4">
               <h4><i className="ri-shield-cross-line me-2"></i>Access Denied</h4>
               <p className="mb-0">You must be logged in as an Admin to access the Admin Control Center.</p>
            </Alert>
         </Container>
      );
   }

   return (
      <div className="admin-dashboard-container">
         <Container fluid="lg" className="pt-4">
            
            {/* Header Banner */}
            <div className="admin-header-banner d-flex align-items-center justify-content-between flex-wrap gap-3">
               <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                     <h1><i className="ri-dashboard-3-line me-2"></i>Admin Control Center</h1>
                     <span className="admin-badge-role">👑 System Administrator</span>
                  </div>
                  <p className="text-white-50 mb-0">Manage tour packages created by admin, monitor bookings, and oversee registered accounts.</p>
               </div>

               <div className="d-flex align-items-center gap-2">
                  <Button color="light" className="rounded-pill px-4 font-weight-bold" onClick={() => handleOpenTourModal()}>
                     <i className="ri-add-line me-1"></i> Add Tour (Admin)
                  </Button>
                  <Button outline color="light" className="rounded-pill" onClick={fetchData}>
                     <i className="ri-refresh-line"></i>
                  </Button>
               </div>
            </div>

            {/* Alerts */}
            {successMsg && <Alert color="success" className="rounded-12 shadow-sm mb-4"><i className="ri-checkbox-circle-line me-2"></i>{successMsg}</Alert>}
            {error && <Alert color="danger" className="rounded-12 shadow-sm mb-4"><i className="ri-error-warning-line me-2"></i>{error}</Alert>}

            {/* KPI Cards Grid */}
            <Row className="g-4 mb-4">
               <Col lg="3" sm="6">
                  <div className="admin-kpi-card">
                     <div className="kpi-content">
                        <h3>{tours.length}</h3>
                        <p>Total Tours</p>
                     </div>
                     <div className="kpi-icon-box kpi-icon-indigo">
                        <i className="ri-flight-takeoff-line"></i>
                     </div>
                  </div>
               </Col>
               <Col lg="3" sm="6">
                  <div className="admin-kpi-card">
                     <div className="kpi-content">
                        <h3>{bookings.length}</h3>
                        <p>Active Bookings</p>
                     </div>
                     <div className="kpi-icon-box kpi-icon-emerald">
                        <i className="ri-bookmark-3-line"></i>
                     </div>
                  </div>
               </Col>
               <Col lg="3" sm="6">
                  <div className="admin-kpi-card">
                     <div className="kpi-content">
                        <h3>{users.length}</h3>
                        <p>Registered Users</p>
                     </div>
                     <div className="kpi-icon-box kpi-icon-sky">
                        <i className="ri-user-star-line"></i>
                     </div>
                  </div>
               </Col>
               <Col lg="3" sm="6">
                  <div className="admin-kpi-card">
                     <div className="kpi-content">
                        <h3>{formatINR(totalRevenue)}</h3>
                        <p>Total Revenue</p>
                     </div>
                     <div className="kpi-icon-box kpi-icon-amber">
                        <i className="ri-wallet-3-line"></i>
                     </div>
                  </div>
               </Col>
            </Row>

            {/* Main Tabs Header */}
            <div className="d-flex align-items-center justify-content-between flex-wrap mb-3 gap-3">
               <Nav className="admin-nav-tabs">
                  <NavItem>
                     <NavLink className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <i className="ri-pie-chart-2-line"></i> Overview
                     </NavLink>
                  </NavItem>
                  <NavItem>
                     <NavLink className={activeTab === 'tours' ? 'active' : ''} onClick={() => setActiveTab('tours')}>
                        <i className="ri-earth-line"></i> Manage Tours ({tours.length})
                     </NavLink>
                  </NavItem>
                  <NavItem>
                     <NavLink className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
                        <i className="ri-calendar-check-line"></i> Bookings ({bookings.length})
                     </NavLink>
                  </NavItem>
                  <NavItem>
                     <NavLink className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                        <i className="ri-group-line"></i> Users ({users.length})
                     </NavLink>
                  </NavItem>
               </Nav>

               <div style={{ maxWidth: '300px' }} className="w-100">
                  <Input 
                     type="text" 
                     placeholder="Search tours, bookings, users..." 
                     className="rounded-pill border-0 shadow-sm px-3"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            {/* Loading Spinner */}
            {loading ? (
               <div className="text-center py-5">
                  <Spinner color="indigo" style={{ width: '3rem', height: '3rem' }} />
                  <p className="mt-3 text-muted">Loading dashboard records...</p>
               </div>
            ) : (
               <>
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === 'overview' && (
                     <Row className="g-4">
                        <Col lg="8">
                           <div className="admin-panel-card">
                              <div className="d-flex align-items-center justify-content-between mb-3">
                                 <h5 className="fw-bold mb-0"><i className="ri-history-line me-2 text-indigo"></i>Recent Tours Added by Admin</h5>
                                 <Button color="link" size="sm" onClick={() => setActiveTab('tours')}>View All</Button>
                              </div>
                              <div className="table-responsive">
                                 <table className="admin-custom-table">
                                    <thead>
                                       <tr>
                                          <th>Tour</th>
                                          <th>Destination</th>
                                          <th>Price</th>
                                          <th>Badge</th>
                                       </tr>
                                    </thead>
                                    <tbody>
                                       {tours.slice(0, 5).map((tour) => (
                                          <tr key={tour._id}>
                                             <td>
                                                <div className="d-flex align-items-center gap-3">
                                                   <img src={tour.photo || PRESET_PHOTOS[0].url} alt="" className="tour-admin-thumb" />
                                                   <div>
                                                      <div className="fw-bold text-dark">{tour.title}</div>
                                                      <small className="text-muted"><i className="ri-map-pin-line me-1"></i>{tour.address || tour.city}</small>
                                                   </div>
                                                </div>
                                             </td>
                                             <td><span className="badge bg-light text-dark px-3 py-2 rounded-pill">{tour.city}</span></td>
                                             <td className="fw-bold text-emerald">{formatINR(tour.price)}</td>
                                             <td>
                                                <Badge color="indigo" pill className="px-3 py-2">
                                                   👑 Added by Admin
                                                </Badge>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                        </Col>

                        <Col lg="4">
                           <div className="admin-panel-card">
                              <h5 className="fw-bold mb-3"><i className="ri-pulse-line me-2 text-emerald"></i>System Quick Actions</h5>
                              <div className="d-grid gap-2">
                                 <Button color="indigo" block className="py-2.5 rounded-12 fw-semibold" onClick={() => handleOpenTourModal()}>
                                    <i className="ri-add-circle-line me-2"></i>Create New Admin Tour
                                 </Button>
                                 <Button outline color="secondary" block className="py-2.5 rounded-12 fw-semibold" onClick={() => setActiveTab('bookings')}>
                                    <i className="ri-survey-line me-2"></i>Review Pending Bookings
                                 </Button>
                              </div>

                              <hr className="my-4" />

                              <h6 className="fw-bold mb-2">Tour Category Distribution</h6>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                 <span className="text-muted">Featured Tours:</span>
                                 <Badge color="warning" pill>{tours.filter(t => t.featured).length}</Badge>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                 <span className="text-muted">Standard Tours:</span>
                                 <Badge color="secondary" pill>{tours.filter(t => !t.featured).length}</Badge>
                              </div>
                           </div>
                        </Col>
                     </Row>
                  )}

                  {/* TAB 2: MANAGE TOURS */}
                  {activeTab === 'tours' && (
                     <div className="admin-panel-card">
                        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                           <div>
                              <h5 className="fw-bold mb-1">Tours Portfolio ({filteredTours.length})</h5>
                              <p className="text-muted small mb-0">Tours created and managed by administrator.</p>
                           </div>
                           <Button color="primary" className="rounded-pill px-4" onClick={() => handleOpenTourModal()}>
                              <i className="ri-add-line me-1"></i> Add Tour
                           </Button>
                        </div>

                        <div className="table-responsive">
                           <table className="admin-custom-table">
                              <thead>
                                 <tr>
                                    <th>Package Info</th>
                                    <th>City</th>
                                    <th>Price</th>
                                    <th>Group / Dist</th>
                                    <th>Featured</th>
                                    <th>Created By</th>
                                    <th className="text-end">Actions</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {filteredTours.map((tour) => (
                                    <tr key={tour._id}>
                                       <td>
                                          <div className="d-flex align-items-center gap-3">
                                             <img src={tour.photo || PRESET_PHOTOS[0].url} alt="" className="tour-admin-thumb" />
                                             <div>
                                                <div className="fw-bold text-dark">{tour.title}</div>
                                                <small className="text-muted">{tour.address || 'Standard Address'}</small>
                                             </div>
                                          </div>
                                       </td>
                                       <td><span className="badge bg-light text-dark px-3 py-2 rounded-pill">{tour.city}</span></td>
                                       <td className="fw-bold text-success">{formatINR(tour.price)}</td>
                                       <td>
                                          <small className="d-block text-dark fw-medium"><i className="ri-user-3-line"></i> {tour.maxGroupSize} max</small>
                                          <small className="text-muted"><i className="ri-road-map-line"></i> {tour.distance} km</small>
                                       </td>
                                       <td>
                                          <button 
                                             className={`action-btn-circle ${tour.featured ? 'action-featured' : 'bg-secondary'}`}
                                             onClick={() => handleToggleFeatured(tour)}
                                             title="Toggle Featured"
                                          >
                                             <i className={tour.featured ? "ri-star-fill" : "ri-star-line"}></i>
                                          </button>
                                       </td>
                                       <td>
                                          <span className="badge bg-primary px-2.5 py-1.5 rounded-pill">
                                             👑 {tour.createdBy || 'Admin'}
                                          </span>
                                       </td>
                                       <td className="text-end">
                                          <button className="action-btn-circle action-edit" onClick={() => handleOpenTourModal(tour)} title="Edit Tour">
                                             <i className="ri-pencil-line"></i>
                                          </button>
                                          <button className="action-btn-circle action-delete" onClick={() => handleDeleteTour(tour._id)} title="Delete Tour">
                                             <i className="ri-delete-bin-line"></i>
                                          </button>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  )}

                  {/* TAB 3: BOOKINGS */}
                  {activeTab === 'bookings' && (
                     <div className="admin-panel-card">
                        <div className="mb-4">
                           <h5 className="fw-bold mb-1">Customer Bookings Management ({filteredBookings.length})</h5>
                           <p className="text-muted small mb-0">Overview of user tour bookings and status confirmation.</p>
                        </div>

                        <div className="table-responsive">
                           <table className="admin-custom-table">
                              <thead>
                                 <tr>
                                    <th>Customer</th>
                                    <th>Tour Name</th>
                                    <th>Group Size</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {filteredBookings.length === 0 ? (
                                    <tr>
                                       <td colSpan="6" className="text-center py-4 text-muted">No booking records found.</td>
                                    </tr>
                                 ) : (
                                    filteredBookings.map((b) => (
                                       <tr key={b._id}>
                                          <td>
                                             <div className="fw-bold text-dark">{b.fullName || 'Guest User'}</div>
                                             <small className="text-muted">{b.userEmail || b.phone || 'No Contact'}</small>
                                          </td>
                                          <td className="fw-semibold text-primary">
                                             <div>{b.tourName || 'Tour Package'}</div>
                                             <small className="text-muted"><i className="ri-wallet-3-line me-1"></i>{b.paymentMode || 'Payment mode notified upon acceptance'}</small>
                                          </td>
                                          <td>{b.guestSize || b.maxGroupSize || 1} Person(s)</td>
                                          <td>{b.bookAt ? new Date(b.bookAt).toLocaleDateString() : 'Recent'}</td>
                                          <td>
                                             <Badge color={b.status === 'confirmed' ? 'success' : 'warning'} pill className="px-3 py-2">
                                                {b.status === 'confirmed' ? '✅ Accepted & Payment Notified' : '⏳ Awaiting Admin Acceptance'}
                                             </Badge>
                                          </td>
                                          <td className="text-end">
                                             {b.status !== 'confirmed' && (
                                                <button className="action-btn-circle action-confirm" onClick={() => handleConfirmBooking(b)} title="Accept Booking & Notify Payment Mode">
                                                   <i className="ri-check-line"></i>
                                                </button>
                                             )}
                                             <button className="action-btn-circle action-delete" onClick={() => handleDeleteBooking(b._id)} title="Delete Booking">
                                                <i className="ri-delete-bin-line"></i>
                                             </button>
                                          </td>
                                       </tr>
                                    ))
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  )}

                  {/* TAB 4: USERS */}
                  {activeTab === 'users' && (
                     <div className="admin-panel-card">
                        <div className="mb-4">
                           <h5 className="fw-bold mb-1">Registered System Accounts ({filteredUsers.length})</h5>
                           <p className="text-muted small mb-0">Registered user and admin profiles.</p>
                        </div>

                        <div className="table-responsive">
                           <table className="admin-custom-table">
                              <thead>
                                 <tr>
                                    <th>User</th>
                                    <th>Email Address</th>
                                    <th>Role</th>
                                    <th>Joined Date</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {filteredUsers.length === 0 ? (
                                    <tr>
                                       <td colSpan="4" className="text-center py-4 text-muted">No registered users found.</td>
                                    </tr>
                                 ) : (
                                    filteredUsers.map((u) => (
                                       <tr key={u._id}>
                                          <td>
                                             <div className="d-flex align-items-center gap-3">
                                                <div className="user__avatar">{u.username ? u.username.charAt(0).toUpperCase() : 'U'}</div>
                                                <div className="fw-bold text-dark">{u.username}</div>
                                             </div>
                                          </td>
                                          <td className="text-muted">{u.email}</td>
                                          <td>
                                             <Badge color={u.role === 'admin' ? 'indigo' : 'secondary'} pill className="px-3 py-2">
                                                {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                                             </Badge>
                                          </td>
                                          <td><small className="text-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</small></td>
                                       </tr>
                                    ))
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  )}
               </>
            )}

            {/* TOUR MODAL (ADD / EDIT) */}
            <Modal isOpen={showTourModal} toggle={() => setShowTourModal(false)} size="lg" centered>
               <ModalHeader toggle={() => setShowTourModal(false)} className="bg-gradient text-white">
                  <i className="ri-plane-line me-2"></i>
                  {editingTour ? 'Edit Admin Tour Package' : 'Create New Tour (Added by Admin)'}
               </ModalHeader>
               <Form onSubmit={handleTourSubmit}>
                  <ModalBody className="p-4">
                     <Row>
                        <Col md="6">
                           <FormGroup>
                              <Label className="fw-bold">Tour Title *</Label>
                              <Input 
                                 type="text" 
                                 required
                                 placeholder="e.g. Westminster Bridge & Royal London"
                                 value={tourForm.title}
                                 onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })}
                              />
                           </FormGroup>
                        </Col>

                        <Col md="6">
                           <FormGroup>
                              <Label className="fw-bold">City / Destination *</Label>
                              <Input 
                                 type="text" 
                                 required
                                 placeholder="e.g. London"
                                 value={tourForm.city}
                                 onChange={(e) => setTourForm({ ...tourForm, city: e.target.value })}
                              />
                           </FormGroup>
                        </Col>

                        <Col md="6">
                           <FormGroup>
                              <Label className="fw-bold">Full Address / Meeting Point</Label>
                              <Input 
                                 type="text" 
                                 placeholder="e.g. Westminster, London SW1A 0AA"
                                 value={tourForm.address}
                                 onChange={(e) => setTourForm({ ...tourForm, address: e.target.value })}
                              />
                           </FormGroup>
                        </Col>

                        <Col md="3">
                           <FormGroup>
                              <Label className="fw-bold">Price (₹ INR) *</Label>
                              <Input 
                                 type="number" 
                                 required
                                 min="0"
                                 placeholder="12999"
                                 value={tourForm.price}
                                 onChange={(e) => setTourForm({ ...tourForm, price: e.target.value })}
                              />
                           </FormGroup>
                        </Col>

                        <Col md="3">
                           <FormGroup>
                              <Label className="fw-bold">Max Group Size</Label>
                              <Input 
                                 type="number" 
                                 min="1"
                                 value={tourForm.maxGroupSize}
                                 onChange={(e) => setTourForm({ ...tourForm, maxGroupSize: e.target.value })}
                              />
                           </FormGroup>
                        </Col>

                        <Col md="6">
                           <FormGroup>
                              <Label className="fw-bold">Distance (KM)</Label>
                              <Input 
                                 type="number" 
                                 placeholder="350"
                                 value={tourForm.distance}
                                 onChange={(e) => setTourForm({ ...tourForm, distance: e.target.value })}
                              />
                           </FormGroup>
                        </Col>

                        <Col md="6">
                           <FormGroup className="pt-4">
                              <Label check className="fw-bold text-primary">
                                 <Input 
                                    type="checkbox" 
                                    checked={tourForm.featured}
                                    onChange={(e) => setTourForm({ ...tourForm, featured: e.target.checked })}
                                    className="me-2"
                                 />
                                 Mark as Featured Tour Package
                              </Label>
                           </FormGroup>
                        </Col>

                        <Col md="12">
                           <FormGroup>
                              <Label className="fw-bold">Photo Image URL</Label>
                              <Input 
                                 type="url" 
                                 placeholder="https://images.unsplash.com/..."
                                 value={tourForm.photo}
                                 onChange={(e) => setTourForm({ ...tourForm, photo: e.target.value })}
                              />
                           </FormGroup>

                           {/* Preset Quick Select Image Buttons */}
                           <div className="mb-3">
                              <small className="text-muted fw-bold d-block mb-1">Click to select high-res preset image:</small>
                              <div className="image-preset-grid">
                                 {PRESET_PHOTOS.map((p, idx) => (
                                    <button 
                                       type="button" 
                                       key={idx} 
                                       className={`image-preset-btn ${tourForm.photo === p.url ? 'selected' : ''}`}
                                       onClick={() => setTourForm({ ...tourForm, photo: p.url })}
                                    >
                                       <img src={p.url} alt={p.name} />
                                       <span>{p.name}</span>
                                    </button>
                                 ))}
                              </div>
                           </div>

                           {/* Live Preview */}
                           {tourForm.photo && (
                              <div className="image-preview-container mb-3">
                                 <img src={tourForm.photo} alt="Preview" onError={(e) => { e.target.src = PRESET_PHOTOS[0].url; }} />
                              </div>
                           )}
                        </Col>

                        <Col md="12">
                           <FormGroup>
                              <Label className="fw-bold">Tour Description</Label>
                              <Input 
                                 type="textarea" 
                                 rows="3"
                                 placeholder="Provide detailed itinerary, highlight key sights, inclusion details..."
                                 value={tourForm.desc}
                                 onChange={(e) => setTourForm({ ...tourForm, desc: e.target.value })}
                              />
                           </FormGroup>
                        </Col>
                     </Row>
                  </ModalBody>
                  <ModalFooter>
                     <Button color="secondary" onClick={() => setShowTourModal(false)}>Cancel</Button>
                     <Button color="indigo" type="submit" className="px-4">
                        <i className="ri-save-line me-1"></i> {editingTour ? 'Save Tour Changes' : 'Publish Tour (by Admin)'}
                     </Button>
                  </ModalFooter>
               </Form>
            </Modal>

         </Container>
      </div>
   );
};

export default AdminDashboard;