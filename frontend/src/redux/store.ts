import { configureStore } from '@reduxjs/toolkit';
import { useDispatch as useReduxDispatch } from 'react-redux';
import authReducer from './slices/authSlice';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __REDUX_DEVTOOLS_EXTENSION__?: () => any;
  }
}

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    devTools: window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch = () => useReduxDispatch<AppDispatch>();