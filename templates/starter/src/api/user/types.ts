/**
 * 登录用户信息
 */
export interface UserInfo {
  nickname: string;
  avatar: string;
  roles: string[];
  perms: string[];
  account: string;
  region_id: string;
  menu: object[];
  regionManager: object[];
  is_force_update_pwd?: number;
}

/**
 * 用户查询对象类型
 */
export interface UserQuery extends PageQuery {
  account?: string;
  status?: number;
  region_id?: string;
}

/**
 * 主体类型查询对象类型
 */
export interface VenuetypeQuery extends PageQuery {
  name?: string;
  region_id?: number | string;
}
/**
 * 用户分页对象
 */
export interface UserPageVO {
  /**
   * 用户头像地址
   */
  avatar?: string;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 部门名称
   */
  deptName?: string;
  /**
   * 用户邮箱
   */
  email?: string;
  /**
   * 性别
   */
  genderLabel?: string;
  /**
   * 用户ID
   */
  id?: number;
  /**
   * 手机号
   */
  mobile?: string;
  /**
   * 用户昵称
   */
  nickname?: string;
  /**
   * 角色名称，多个使用英文逗号(,)分割
   */
  roleNames?: string;
  /**
   * 用户状态(1:启用;0:禁用)
   */
  status?: number;
  /**
   * 用户名
   */
  username?: string;
}

/**
 * 用户表单类型
 */
export interface UserForm {
  id?: number;
  account?: string;
  telephone?: string;
  password?: string;
  password_e_t?: string;
  name?: string;
  role_id?: number;
  user_id?: number;
  role?: object;
  region_id?: number[];
  /**
   * 用户状态(1:正常;3:注销)
   */
  state?: number;
  village_id?: number[];
  configinfo:{  // ai外呼配置
    ai_appkey:string,
    ai_appsecret:string
  }
}

//免密登录
export interface noPassType {
  code: string,
  appkey: string
}
