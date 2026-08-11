/**
 * Built-in test account (超级管理员 / Super Admin)
 *
 * Used when VITE_USE_MOCK=true. Real deployments MUST delete this file
 * (or set VITE_USE_MOCK=false in .env.production).
 *
 * Test account:
 *   username: admin
 *   password: admin123
 *
 * Granted:
 *   - role: ROOT          (bypasses v-has-perm checks per fc-admin-arch)
 *   - perms: all 6 core admin domains (user / role / menu / dept / dict / region)
 */

export const TEST_ACCOUNT = {
  username: 'admin',
  password: 'admin123'
};

/** User object returned by `/auth/api/manager/account/this` */
export const TEST_USER_INFO = {
  id: 1,
  account: TEST_ACCOUNT.username,
  nickname: '超级管理员',
  avatar: '',
  roles: ['ROOT'],
  // Per-domain permissions — covers every `v-has-perm` button in the 6 core admin pages.
  perms: [
    'sys:user:list', 'sys:user:add', 'sys:user:edit', 'sys:user:del', 'sys:user:detail',
    'sys:role:list', 'sys:role:add', 'sys:role:edit', 'sys:role:del',
    'sys:menu:list', 'sys:menu:add', 'sys:menu:edit', 'sys:menu:del',
    'sys:dept:list', 'sys:dept:add', 'sys:dept:edit', 'sys:dept:del',
    'sys:dict:list', 'sys:dict:add', 'sys:dict:edit', 'sys:dict:del',
    'sys:region:list', 'sys:region:add', 'sys:region:edit', 'sys:region:del'
  ],
  menu: [
    {
      id: 1,
      name: '系统管理',
      describe: '/system',
      icon: 'system',
      sort: 100,
      children: [
        { id: 11, name: '用户管理', describe: '/system/user', icon: 'user', routepath: 'system/user/index', sort: 1 },
        { id: 12, name: '角色管理', describe: '/system/role', icon: 'user-filled', routepath: 'system/role/index', sort: 2 },
        { id: 13, name: '菜单管理', describe: '/system/menu', icon: 'menu', routepath: 'system/menu/index', sort: 3 },
        { id: 14, name: '部门管理', describe: '/system/dept', icon: 'office-building', routepath: 'system/dept/index', sort: 4 },
        { id: 15, name: '字典管理', describe: '/system/dict', icon: 'notebook', routepath: 'system/dict/index', sort: 5 },
        { id: 16, name: '区域管理', describe: '/system/region', icon: 'location', routepath: 'system/region/index', sort: 6 }
      ]
    }
  ]
};

/** Mock token issued on successful login */
export function generateMockToken(): string {
  return 'mock-token-' + Math.random().toString(36).slice(2, 12);
}
