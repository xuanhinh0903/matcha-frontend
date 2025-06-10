import { combineReducers } from '@reduxjs/toolkit';

import { authPersistReducer } from '@/store/global/auth';

import { matchaAPI } from '.';
import { adminReportApi } from './admin/reportApi';
import { messagesApi } from './messages';

export const rootReducers = combineReducers({
  auth: authPersistReducer,
  [matchaAPI.reducerPath]: matchaAPI.reducer,
  [adminReportApi.reducerPath]: adminReportApi.reducer,
  [messagesApi.reducerPath]: messagesApi.reducer,
});
