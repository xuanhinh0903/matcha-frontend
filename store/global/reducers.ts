import { combineReducers } from '@reduxjs/toolkit';

import { matchaAPI, adminReportApi, messagesApi } from '../../rtk-query';
import { authPersistReducer } from './auth';
import { callsReducer } from './calls';
import { websocketReducer } from './websocket';
import discoverFiltersReducer from './discover/discover-filters.slice';
import matchReducer from './match';

export const rootReducers = combineReducers({
  auth: authPersistReducer,
  calls: callsReducer,
  websocket: websocketReducer,
  discoverFilters: discoverFiltersReducer,
  match: matchReducer,
  [matchaAPI.reducerPath]: matchaAPI.reducer,
  [adminReportApi.reducerPath]: adminReportApi.reducer,
  [messagesApi.reducerPath]: messagesApi.reducer,
});
