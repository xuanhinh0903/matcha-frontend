import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';

import { matchaAPI } from '.';
import { rootReducers } from './reducers';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  timeout: 0,
  blacklist: [matchaAPI.reducerPath],
};
export const persistedReducer = persistReducer(persistConfig, rootReducers);
