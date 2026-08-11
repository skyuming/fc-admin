/**
 * 菜单查询参数类型
 */
export interface MenuQuery {
  keywords?: string;
}

/**
 * 菜单视图对象类型
 */
export interface MenuVO {
  /**
   * 子菜单
   */
  children?: MenuVO[];
  /**
   * 组件路径
   */
  component?: string;
  /**
   * ICON
   */
  icon?: string;
  /**
   * 菜单ID
   */
  id?: number;
  /**
   * 菜单名称
   */
  name?: string;
  /**
   * 父菜单ID
   */
  parentId?: number;
  /**
   * 按钮权限标识
   */
  perm?: string;
  /**
   * 跳转路径
   */
  redirect?: string;
  /**
   * 路由名称
   */
  routeName?: string;
  /**
   * 路由相对路径
   */
  routePath?: string;
  /**
   * 菜单排序(数字越小排名越靠前)
   */
  sort?: number;
  /**
   * 菜单类型 0.目录 1.菜单 2.按钮 3.外链
   */
  type?: number;
  /**
   * 菜单是否可见(1:显示;0:隐藏)
   */
  visible?: number;
}

/**
 * 菜单表单对象类型
 */
export interface MenuForm {
  /**
   * 菜单ID
   */
  id?: string;
  /**
   * 父菜单ID
   */
  parent_id?: number;
  /**
   * 菜单名称
   */
  name?: string;
  describe?:string;
  /**
   * 菜单是否可见(1:是;0:否;)
   */
  is_hide?: number;
  no_select_images?: string;
  select_images?: string;
  /**
   * 排序
   */
  sort?: number;
  /**
   * 组件路径
   */
  component?: string;
  /**
   * 路由路径
   */
  url?: string;
  /**
   * 跳转路由路径
   */
  redirect?: string;

  /**
   * 菜单类型 0.目录 1.菜单 2.按钮 3.外链
   */
  type?: number;

  /**
   * 权限标识
   */
  flag?: string;
}
