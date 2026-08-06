// frontend/src/hooks/useFetch.js
import { useState, useEffect } from 'react'

const useFetch = (url) => {
   const [data, setData] = useState(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(null)

   useEffect(() => {
      const fetchData = async () => {
         setLoading(true)
         setError(null)
         
         try {
            const response = await fetch(url)
            
            if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const result = await response.json()
            
            // Handle different response formats
            if (result.success) {
               setData(result.data || result)
            } else {
               setData(result)
            }
         } catch (err) {
            console.error('Fetch error:', err)
            setError(err.message || 'Failed to fetch data')
            setData(null)
         } finally {
            setLoading(false)
         }
      }

      fetchData()
   }, [url])

   return { data, loading, error }
}

export default useFetch