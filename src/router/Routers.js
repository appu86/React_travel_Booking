import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ThankYou from '../pages/ThankYou'
import Home from './../pages/Home'
import Login from './../pages/Login'
import Register from './../pages/Register'
import SearchResultList from './../pages/SearchResultList'
import TourDetails from './../pages/TourDetails'
import Tours from './../pages/Tours'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminRoute from '../components/AdminRoute'
import MyBookings from '../pages/MyBookings'

const Routers = () => {
   return (
      <Routes>
         <Route path='/' element={<Navigate to='/home'/>} />
         <Route path='/home' element={<Home/>} />
         <Route path='/tours' element={<Tours/>} />
         <Route path='/tours/:id' element={<TourDetails/>} />
         <Route path='/login' element={<Login/>} />
         <Route path='/register' element={<Register/>} />
         <Route path='/thank-you' element={<ThankYou/>} />
         <Route path='/my-bookings' element={<MyBookings/>} />
         <Route path='/tours/search' element={<SearchResultList/>} />
         <Route path='/admin' element={<AdminRoute><AdminDashboard/></AdminRoute>} />
      </Routes>
   )
}

export default Routers