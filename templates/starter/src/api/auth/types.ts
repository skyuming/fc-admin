/**
 * 登录请求参数
 */
export interface LoginData {
  /**
   * 用户名
   */
  username?: string;
  /**
   * 密码
   */
  password?: string;

  /**
   * 验证码
   */
  verificationCode?: string;
  scope?: string;
  grant_type?: string;
  account?:string;
  code?:string;
  ip?:string;
  password_e_t?:string;
  code_key?:string;
}

/**
 * 登录响应
 */
export interface LoginResult {
  /**
   * 访问token
   */
  access_token?: string;
  /**
   * 过期时间(单位：毫秒)
   */
  expires_in?: number;
  /**
   * 来源
   */
  scope?: string;
  /**
   * token 类型
   */
  token_type?: string;
}
