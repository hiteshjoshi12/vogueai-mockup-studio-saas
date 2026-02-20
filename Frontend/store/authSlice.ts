import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  email: string | null;
  tokensAvailable: number;
  isAuthenticated: boolean;
}

// 1. Pull EVERYTHING from localStorage on initial load
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  email: localStorage.getItem('email'),
  // Parse the tokens back into a number, defaulting to 0 if it doesn't exist
  tokensAvailable: localStorage.getItem('tokensAvailable') 
    ? Number(localStorage.getItem('tokensAvailable')) 
    : 0,
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; email: string; tokens: number }>) => {
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.tokensAvailable = action.payload.tokens;
      state.isAuthenticated = true;
      
      // 2. Save EVERYTHING to localStorage when logging in
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('email', action.payload.email);
      localStorage.setItem('tokensAvailable', action.payload.tokens.toString());
    },
    logout: (state) => {
      state.token = null;
      state.email = null;
      state.tokensAvailable = 0;
      state.isAuthenticated = false;
      
      // 3. Clear EVERYTHING from localStorage when logging out
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('tokensAvailable');
    },
    updateTokens: (state, action: PayloadAction<number>) => {
      state.tokensAvailable = action.payload;
      
      // 4. Update localStorage whenever tokens are spent or bought
      localStorage.setItem('tokensAvailable', action.payload.toString());
    }
  }
});

export const { setCredentials, logout, updateTokens } = authSlice.actions;
export default authSlice.reducer;