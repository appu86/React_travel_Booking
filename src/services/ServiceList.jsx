import React from 'react'
import ServiceCard from './ServiceCard'
import { Col } from 'reactstrap'
import weatherImg from '../assets/images/weather.png'
import guideImg from '../assets/images/guide.png'
import customizationImg from '../assets/images/customization.png'

const servicesData = [
   {
      imgUrl: weatherImg,
      title: `Weather Forecast`,
      desc: `Real-time climate insights and seasonal weather guidance for every destination.`,
   },
   {
      imgUrl: guideImg,
      title: `Expert Tour Guides`,
      desc: `Certified local guides committed to enriching your travel with rich stories.`,
   },
   {
      imgUrl: customizationImg,
      title: `Custom Itineraries`,
      desc: `Tailor your tour packages, seats, and activity schedules to your preferences.`,
   },
]

const ServiceList = () => {
   return <>
      {
         servicesData.map((item, index) => (
            <Col lg='3' md='6' sm='12' className='mb-4' key={index}>
               <ServiceCard item={item} />
            </Col>))
      }
   </>

}

export default ServiceList