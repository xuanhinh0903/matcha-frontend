import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';

import { matchaAPI, adminReportApi, messagesApi } from '@/rtk-query';

import { rootReducers } from './reducers';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  timeout: 0,
  // Blacklist all API reducers to prevent persistence issues
  blacklist: [
    matchaAPI.reducerPath,
    adminReportApi.reducerPath,
    messagesApi.reducerPath,
  ],
};
export const persistedReducer = persistReducer(persistConfig, rootReducers);
