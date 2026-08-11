import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LoginData, LoginResult } from './types';

/**
 * 登录API
 *
 * @param data {LoginData}
 * @returns
 */

export function loginApi(data: any, time: string): AxiosPromise<LoginResult> {
  return request({
    url: `/auth/connect/token?timestamp=${time}`,
    method: 'post',
    data
  });
}
