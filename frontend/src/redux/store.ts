import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

import authReducer from './slices/authSlice'; 
import studentReducer from './slices/studentSlice';
import collegeAdminReducer from './slices/collegeAdminSlice';
import hrReducer from './slices/hrSlice';
import interviewerReducer from './slices/interviewerSlice';
import superAdminReducer from './slices/superAdminSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  student: studentReducer,
  collegeAdmin: collegeAdminReducer,
  hr: hrReducer,
  interviewer: interviewerReducer,
  superAdmin: superAdminReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'student', 'collegeAdmin', 'hr', 'interviewer', 'superAdmin'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
