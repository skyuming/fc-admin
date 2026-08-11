import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { UserForm, UserInfo, UserPageVO, UserQuery, VenuetypeQuery,noPassType } from './types';

/**
 * 登录成功后获取用户信息（昵称、头像、权限集合和角色集合）
 */
export function getUserInfo(): AxiosPromise<UserInfo> {
  return request({
    url: '/auth/api/manager/account/this',
    method: 'get'
  });
}

/**
 * 获取用户分页列表
 *
 * @param queryParams
 */
export function getUserPage(
  queryParams: UserQuery
): AxiosPromise<any> {
  return request({
    url: '/auth/api/manager/account',
    method: 'get',
    params: queryParams
  });
}

/**
 * 获取用户表单详情
 *
 * @param account
 */
export function getUserForm(account: any): AxiosPromise<UserForm> {
  return request({
    url: '/auth/api/manager/account/' + account,
    method: 'get'
  });
}

/**
 * 添加用户
 *
 * @param data
 */
export function addUser(data: any) {
  return request({
    url: '/auth/api/manager/account',
    method: 'post',
    data: data
  });
}

/**
 * 修改用户
 *
 * @param data
 */
export function updateUser(data: UserForm) {
  return request({
    url: '/auth/api/manager/account',
    method: 'put',
    data: data
  });
}

/**
 * 修改密码
 *
 * @param data
 */
export function updatePassword(data: any) {
  return request({
    url: '/auth/api/manager/account/password',
    method: 'put',
    data: data
  });
}

/**
 * 修改用户状态(注销)
 *
 * @param ids
 * @param accountlist
 * @param state
 */
export function updateUserStatus(ids: string, accountlist: string, state: number) {
  return request({
    url: '/auth/api/manager/account/state?listIdStr=' + ids + '&accountlist=' + accountlist + '&state=' + state,
    method: 'put'
  });
}

/**
 * 获取主体类型列表
 */
export function getVenueOmTypeList(queryParams: VenuetypeQuery): AxiosPromise<any> {
  return request({
    url: '/newspaper/api/manager/venuetype',
    method: 'get'
  });
}

/**
 * 免密登录
 */

export function noPassLogin(data:noPassType){
  return request({
    url: '/auth/api/manager/user/thirdparty',
    method: 'POST',
    data
  });
}
/**
 * 浙征订扫码后用code获取信息
 */

export function zzdNoPassLogin(code:string){
  return request({
    url: `/auth/api/manager/zzd/login?code=${code}`,
    method: 'POST',
    
  });
}
/**
 * 西兴街道总平台免登
 */
export function xxjdNoPassLogin(code:string){
  return request({
    url: `/auth/api/manager/zzd/login/xxjdplatform?code=${code}`,
    method: 'POST',
    
  });
}
/**
 * 长河街道总平台免登
 */
export function chjdNoPassLogin(code:string){
  return request({
    url: `/auth/api/manager/zzd/login/chjdplatform?code=${code}`,
    method: 'POST',
    
  });
}
/**
 * 浙征订h5微应用免登
 */
export function zzdH5NoPassLogin(code:string){
  return request({
    url: `/auth/api/manager/zzd/login/app?auth_code=${code}`,
    method: 'POST',
    
  });
}
/**
 * 浙征订申请账号
 */
export function zzdApplyAccount(timestamp:any,_data:any): AxiosPromise<any>{
  return request({
    url: `/auth/api/manager/zzd/applyforauth?timestamp=${timestamp}`,
    method: 'POST',
    data:_data
    
  });
}

//获取手机验证码
export function obtainVerificationCodeApi(account:any,time:any){
  return request({
    url: `/auth/api/manager/account/msgcode?account=${account}&timestamp=${time}`,
    method: 'GET',
  });
}

/**
 * 手机号验证码登录
 */
export function codelogin(_data:any,time:any): AxiosPromise<any>{
  return request({
    url: `/auth/api/manager/account/codelogin?timestamp=${time}`,
    method: 'POST',
    data:_data 
  });
}

// 获取验证码
export let getValidatedCode = async (key:any,time:any) => {
  return request({
      url: `/auth/api/manager/accountlogin/validatedcode?key=${key}&timestamp=${time}`,
      method: 'GET',
  });
}
/**
 * 用户登录
 */
export function usercodelogin(_data:any,time:any): AxiosPromise<any>{
  return request({
    url: `/auth/api/manager/accountlogin?timestamp=${time}`,
    method: 'POST',
    data:_data 
  });
}