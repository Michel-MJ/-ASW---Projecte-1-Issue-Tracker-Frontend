import axios from 'axios'

// Creamos una instancia base de axios
const api = axios.create({
  baseURL: 'https://asw-projecte-1-issue-tracker-1278.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json'
  }
})

// L'nterceptor s'executa abans de cada petició i ens permet afegir la API Key al header de cada sol·licitud
api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('active_api_key')
  
  if (apiKey) {
    config.headers['X-API-KEY'] = apiKey
  }
  
  return config
}, (error) => {
  return Promise.reject(error)
})

export default api