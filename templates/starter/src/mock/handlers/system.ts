import type { MockAdapter } from 'axios-mock-adapter';
import { TEST_USER_INFO } from '../data/admin-account';

/**
 * Mock system admin endpoints so the 6 core admin pages (user/role/menu/dept/dict/region)
 * can render without a backend. Returns a single seed row per domain pointing at the
 * built-in admin account.
 */

function pageOk<T>(records: T[]) {
  return [200, { code: 200, msg: 'ok', data: { records, total: records.length } }];
}

export function registerSystemHandlers(mock: MockAdapter) {
  // User list — seed with the admin user
  mock.onGet('/auth/api/manager/account').reply(() =>
    pageOk([
      {
        id: 1,
        account: TEST_USER_INFO.account,
        nickname: TEST_USER_INFO.nickname,
        status: 1,
        createTime: new Date().toISOString()
      }
    ])
  );

  // Roles
  mock.onGet('/auth/api/manager/role').reply(() =>
    pageOk([{ id: 1, name: '超级管理员', code: 'ROOT', status: 1 }])
  );

  // Menus
  mock.onGet('/auth/api/manager/menu').reply(() =>
    pageOk(TEST_USER_INFO.menu.flatMap(m => m.children || []))
  );

  // Departments
  mock.onGet('/auth/api/manager/dept').reply(() =>
    pageOk([{ id: 1, name: '默认部门', parentId: 0, sort: 1, status: 1 }])
  );

  // Dictionary types
  mock.onGet('/api/v1/dict/types/page').reply(() => pageOk([]));
  mock.onGet('/api/v1/dict/types').reply(() => pageOk([]));

  // Regions
  mock.onGet('/auth/api/manager/region').reply(() =>
    pageOk([{ id: 1, name: '默认区域', code: 'default', sort: 1 }])
  );
}
