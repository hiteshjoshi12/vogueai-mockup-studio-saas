import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // This is the auth slice we created earlier

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // As your SaaS grows, you might add more slices here:
    // billing: billingReducer,
    // history: historyReducer,
  },
});

// These are required for TypeScript to understand your Redux state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;