type Endpoint = 'manager' | 'app'

interface PaginationParams {
  index: number
  size: number
}

interface PaginatedResponse<T> {
  list: T[]
  total: number
  index: number
  size: number
}

interface RequestConfig<TData = unknown> {
  url: string
  method: 'GET' | 'POST'
  data?: TData
  params?: Record<string, unknown>
  endpoint?: Endpoint
}

interface ApiError {
  status: number
  message: string
}

export type {
  Endpoint,
  PaginationParams,
  PaginatedResponse,
  RequestConfig,
  ApiError,
}