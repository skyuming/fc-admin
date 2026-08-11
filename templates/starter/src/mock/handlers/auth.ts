import type { MockAdapter } from 'axios-mock-adapter';
import { TEST_ACCOUNT, TEST_USER_INFO, generateMockToken } from '../data/admin-account';

/** Mock auth endpoints (login + getUserInfo) */
export function registerAuthHandlers(mock: MockAdapter) {
  // POST /auth/connect/token  — login
  mock.onPost('/auth/connect/token').reply(config => {
    const data = JSON.parse(config.data || '{}');
    const { username, password } = data;
    if (username === TEST_ACCOUNT.username && password === TEST_ACCOUNT.password) {
      return [
        200,
        {
          access_token: generateMockToken(),
          expires_in: 7200,
          token_type: 'Bearer',
          scope: 'all'
        }
      ];
    }
    return [
      401,
      { error: 'invalid_grant', error_description: '用户名或密码错误' }
    ];
  });

  // GET /auth/api/manager/account/this  — fetch current user info
  mock.onGet('/auth/api/manager/account/this').reply(200, TEST_USER_INFO);

  // POST /auth/api/manager/account/logout  — logout (no-op in mock)
  mock.onPost('/auth/api/manager/account/logout').reply(200, { success: true });
}
