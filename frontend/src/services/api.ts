import axios from 'axios'

const API_BASE = '/api'

function getToken(): string | null {
  const token = localStorage.getItem('token')
  if (!token) {
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const state = parsed?.state
        if (state?.token) {
          return state.token
        }
      } catch {
        // ignore
      }
    }
  }
  return token
}

const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const token = getToken()
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
