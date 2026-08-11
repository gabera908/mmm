import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_BASE = '/api'

const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)

export default api
