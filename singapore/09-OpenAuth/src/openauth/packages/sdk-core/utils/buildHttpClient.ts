import axios from 'axios'

export type ErrorHandler = (error: Error) => void

export function buildHttpClient(baseURL: string, token?: string, onError?: ErrorHandler) {
  const instance = axios.create({ baseURL })

  instance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    error => Promise.reject(error),
  )

  instance.interceptors.response.use(
    (res) => {
      if (res.status >= 400) {
        const error = new Error(res?.data?.message ?? 'Unkown error')
        onError?.(error)
        throw error
      }
      return res
    },
    (err) => {
      const error = new Error(err.response?.data?.message ?? err.message ?? 'Unkown error')
      onError?.(error)
      throw error
    },
  )

  return instance
}
