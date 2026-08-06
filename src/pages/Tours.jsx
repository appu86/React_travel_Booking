import React, { useState, useEffect } from 'react'
import CommonSection from '../shared/CommonSection'
import '../styles/tour.css'
import TourCard from './../shared/TourCard'
import SearchBar from './../shared/SearchBar'
import Newsletter from './../shared/Newsletter'
import { Col, Container, Row, Spinner, Alert } from 'reactstrap'
import useFetch from '../hooks/useFetch'
import { BASE_URL } from '../utils/config'

const Tours = () => {
   const [pageCount, setPageCount] = useState(0)
   const [page, setPage] = useState(0)
   const [searchParams, setSearchParams] = useState({
      city: '',
      distance: '',
      maxGroupSize: ''
   })

   // Fetch tours with pagination
   const { 
     data: tours, 
     loading, 
     error 
   } = useFetch(`${BASE_URL}/tours?page=${page}&limit=8`)

   // Fetch total tour count for pagination
   const { 
     data: tourCountData, 
     loading: countLoading 
   } = useFetch(`${BASE_URL}/tours/count`)

   useEffect(() => {
      if (tourCountData) {
         const total = tourCountData.count || tourCountData.data || 0
         const pages = Math.ceil(total / 8)
         setPageCount(pages)
      }
      window.scrollTo(0, 0)
   }, [page, tourCountData])

   // Handle search
   const handleSearch = async (searchData) => {
      setSearchParams(searchData)
      setPage(0)
      
      try {
         const queryParams = new URLSearchParams()
         if (searchData.city) queryParams.append('city', searchData.city)
         if (searchData.distance) queryParams.append('distance', searchData.distance)
         if (searchData.maxGroupSize) queryParams.append('maxGroupSize', searchData.maxGroupSize)
         
         const response = await fetch(`${BASE_URL}/tours/search?${queryParams}`)
         const data = await response.json()
         
         if (data.success) {
           // Update tours with search results (you'll need to handle this in your useFetch hook)
           // For now, we'll refresh the page with search params
           window.location.search = queryParams.toString()
         }
      } catch (err) {
         console.error('Search error:', err)
      }
   }

   if (loading && !tours) {
      return (
         <div className="text-center mt-5 pt-5">
            <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
            <h4 className="mt-3">Loading Tours...</h4>
         </div>
      )
   }

   if (error) {
      return (
         <div className="mt-5 pt-5">
            <Alert color="danger" className="text-center">
               <h4>Error Loading Tours</h4>
               <p>{error}</p>
               <button 
                  className="btn btn-primary" 
                  onClick={() => window.location.reload()}
               >
                  Try Again
               </button>
            </Alert>
         </div>
      )
   }

   return (
      <>
         <CommonSection title={"All Tours"} />
         
         {/* Search Section */}
         <section>
            <Container>
               <Row>
                  <SearchBar onSearch={handleSearch} />
               </Row>
            </Container>
         </section>

         {/* Tours Listing Section */}
         <section className='pt-0'>
            <Container>
               {loading ? (
                  <div className="text-center py-5">
                     <Spinner color="primary" />
                     <h4 className="mt-3">Loading tours...</h4>
                  </div>
               ) : (
                  <>
                     <Row>
                        {tours && tours.length > 0 ? (
                           tours.map(tour => (
                              <Col lg='3' md='6' sm='6' className='mb-4' key={tour._id}>
                                 <TourCard tour={tour} />
                              </Col>
                           ))
                        ) : (
                           <Col lg='12' className="text-center py-5">
                              <h4>No tours found</h4>
                              <p>Try adjusting your search criteria</p>
                           </Col>
                        )}
                     </Row>

                     {/* Pagination */}
                     {tours && tours.length > 0 && pageCount > 1 && (
                        <Row>
                           <Col lg='12'>
                              <div className="pagination d-flex align-items-center justify-content-center mt-4 gap-3">
                                 <button
                                    onClick={() => setPage(prev => Math.max(0, prev - 1))}
                                    disabled={page === 0}
                                    className="pagination-btn"
                                 >
                                    Previous
                                 </button>
                                 
                                 {[...Array(pageCount).keys()].map(number => (
                                    <span 
                                       key={number} 
                                       onClick={() => setPage(number)}
                                       className={page === number ? 'active__page' : ''}
                                    >
                                       {number + 1}
                                    </span>
                                 ))}
                                 
                                 <button
                                    onClick={() => setPage(prev => Math.min(pageCount - 1, prev + 1))}
                                    disabled={page === pageCount - 1}
                                    className="pagination-btn"
                                 >
                                    Next
                                 </button>
                              </div>
                           </Col>
                        </Row>
                     )}

                     {/* Results Info */}
                     <Row className="mt-3">
                        <Col lg='12' className="text-center">
                           <p className="text-muted">
                              Showing {tours?.length || 0} of {tourCountData?.count || 0} tours
                           </p>
                        </Col>
                     </Row>
                  </>
               )}
            </Container>
         </section>
         
         <Newsletter />
      </>
   )
}

export default Tours