import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

import { matchaAPI, adminReportApi, messagesApi } from '@/rtk-query';

import { persistedReducer } from './persistor';

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // Cast to any to fix TypeScript error with middleware composition
    }).concat(
      matchaAPI.middleware,
      adminReportApi.middleware,
      messagesApi.middleware
    ) as any,
});
setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Selector integrated with rtk-query
 * E.g
  const signIn = useAppSelector(
    state => state.matchaAPI.mutations.signIn?.data,
  );
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
