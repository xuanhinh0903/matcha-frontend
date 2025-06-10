import AsyncStorage from '@react-native-async-storage/async-storage';
import { type PersistConfig, persistReducer } from 'redux-persist';
import { type PersistedState } from 'redux-persist/es/types';

import {
  authReducers,
  type TAuthInitialState,
  authInitialState,
} from './auth.slice';

const authPersistConfig: PersistConfig<TAuthInitialState> = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user', 'token'],
  version: 1,
  migrate: (state: unknown): Promise<TAuthInitialState & PersistedState> => {
    // Handle state structure changes
    if (!state || typeof state !== 'object') {
      return Promise.resolve({
        ...authInitialState,
        _persist: { version: 1, rehydrated: true },
      });
    }

    // Ensure state has correct structure
    const migratedState: TAuthInitialState & PersistedState = {
      user: (state as any).user || null,
      token: (state as any).token || null,
      _persist: { version: 1, rehydrated: true },
    };

    return Promise.resolve(migratedState);
  },
};

export const authPersistReducer = persistReducer(
  authPersistConfig,
  authReducers
);
