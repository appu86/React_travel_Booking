// frontend/src/shared/SearchBar.jsx
import React, { useState } from 'react'
import { Col, Row, Button, Form, FormGroup, Input } from 'reactstrap'

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
      <div className="search__bar">
         <Form onSubmit={handleSubmit}>
            <Row className="align-items-center">
               <Col lg="4" md="4" sm="6">
                  <FormGroup>
                     <Input
                        type="text"
                        name="city"
                        placeholder="Search by city..."
                        value={searchTerm.city}
                        onChange={handleChange}
                        className="search__input"
                     />
                  </FormGroup>
               </Col>
               
               <Col lg="3" md="3" sm="6">
                  <FormGroup>
                     <Input
                        type="number"
                        name="distance"
                        placeholder="Max distance (km)"
                        value={searchTerm.distance}
                        onChange={handleChange}
                        className="search__input"
                     />
                  </FormGroup>
               </Col>
               
               <Col lg="3" md="3" sm="6">
                  <FormGroup>
                     <Input
                        type="number"
                        name="maxGroupSize"
                        placeholder="Group size"
                        value={searchTerm.maxGroupSize}
                        onChange={handleChange}
                        className="search__input"
                     />
                  </FormGroup>
               </Col>
               
               <Col lg="2" md="2" sm="6" className="d-flex gap-2">
                  <Button type="submit" color="primary" className="search__btn w-100">
                     Search
                  </Button>
                  <Button type="button" color="secondary" onClick={handleReset}>
                     Reset
                  </Button>
               </Col>
            </Row>
         </Form>
      </div>
   )
}

export default SearchBar