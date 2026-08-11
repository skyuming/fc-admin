/**
 * Mock setup — intercepts HTTP calls when VITE_USE_MOCK=true.
 *
 * Initialization: called once from main.ts. Safe to call multiple times (idempotent).
 *
 * Real deployments MUST set VITE_USE_MOCK=false in .env.production.
 */

import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { registerAuthHandlers } from './handlers/auth';
import { registerSystemHandlers } from './handlers/system';

let initialized = false;

export function setupMock(): void {
  if (initialized) return;
  initialized = true;

  const mock = new MockAdapter(axios, { delayResponse: 200 });

  registerAuthHandlers(mock);
  registerSystemHandlers(mock);

  // eslint-disable-next-line no-console
  console.info('[fc-admin mock] enabled — built-in test account: admin / admin123');
}
