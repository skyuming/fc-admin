import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import type { RequestAdapter } from './adapter'
import type { RequestConfig } from './types/common'

export class AxiosAdapter implements RequestAdapter {
  private instance = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_AIAPI,
    timeout: 120000
  })

  constructor() {
    this.instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = token
      }
      return config
    })

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.clear()
          sessionStorage.clear()
        }
        return Promise.reject(error)
      }
    )
  }

  async request<TResponse>(config: RequestConfig): Promise<TResponse> {
    const response = await this.instance.request<TResponse>({
      url: config.url,
      method: config.method,
      data: config.data,
      params: config.params
    })
    return response.data
  }
}