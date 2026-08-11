import type { RequestConfig } from './types/common'

interface RequestAdapter {
  request<TResponse>(config: RequestConfig): Promise<TResponse>
}

export type { RequestAdapter }