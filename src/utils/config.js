export const BASE_URL =
   typeof window !== 'undefined' && window.location && window.location.hostname.includes('appu.blog')
      ? "https://appu.blog/api/v1"
      : "https://backend-ygdt.onrender.com/api/v1";