'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux/store';
import { SessionManager } from '@/components/auth/SessionManager';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionManager>
          {children}
        </SessionManager>
      </PersistGate>
    </Provider>
  );
}
