import React, { useState } from 'react'
import { Button, Form } from 'reactstrap'
import './search-bar.css'

const SearchBar = ({ onSearch }) => {
   const [searchTerm, setSearchTerm] = useState({
      city: '',
      distance: '',
      maxGroupSize: ''
   })

   const handleChange = (e) => {
      setSearchTerm({
         ...searchTerm,
         [e.target.name]: e.target.value
      })
   }

   const handleSubmit = (e) => {
      e.preventDefault()
      if (onSearch) {
         onSearch(searchTerm)
      }
   }

   const handleReset = () => {
      setSearchTerm({
         city: '',
         distance: '',
         maxGroupSize: ''
      })
      if (onSearch) {
         onSearch({})
      }
   }

   return (
      <div className="search__bar__container">
         <Form onSubmit={handleSubmit} className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="search__field d-flex align-items-center gap-3">
               <span className="search__icon__box text-primary">
                  <i className="ri-map-pin-line fs-4"></i>
               </span>
               <div>
                  <h6 className="mb-0 text-muted small fw-bold">Location / Destination</h6>
                  <input
                     type="text"
                     name="city"
                     placeholder="Where to go? (e.g. London)"
                     value={searchTerm.city}
                     onChange={handleChange}
                     className="search__input__field"
                  />
               </div>
            </div>

            <div className="search__divider d-none d-lg-block"></div>

            <div className="search__field d-flex align-items-center gap-3">
               <span className="search__icon__box text-warning">
                  <i className="ri-road-map-line fs-4"></i>
               </span>
               <div>
                  <h6 className="mb-0 text-muted small fw-bold">Distance</h6>
                  <input
                     type="number"
                     name="distance"
                     placeholder="Max distance (km)"
                     value={searchTerm.distance}
                     onChange={handleChange}
                     className="search__input__field"
                  />
               </div>
            </div>

            <div className="search__divider d-none d-lg-block"></div>

            <div className="search__field d-flex align-items-center gap-3">
               <span className="search__icon__box text-success">
                  <i className="ri-group-line fs-4"></i>
               </span>
               <div>
                  <h6 className="mb-0 text-muted small fw-bold">Max People</h6>
                  <input
                     type="number"
                     name="maxGroupSize"
                     placeholder="Group size"
                     value={searchTerm.maxGroupSize}
                     onChange={handleChange}
                     className="search__input__field"
                  />
               </div>
            </div>

            <div className="d-flex align-items-center gap-2 ms-auto">
               <Button type="submit" className="btn search__submit__btn">
                  <i className="ri-search-line me-1"></i> Search
               </Button>
               {(searchTerm.city || searchTerm.distance || searchTerm.maxGroupSize) && (
                  <Button type="button" outline color="secondary" className="rounded-pill px-3" onClick={handleReset}>
                     Reset
                  </Button>
               )}
            </div>
         </Form>
      </div>
   )
}

export default SearchBar