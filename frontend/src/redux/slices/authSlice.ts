import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Role = 'super_admin' | 'college_admin' | 'student' | 'hr' | 'interviewer';

interface AuthState {
  isAuthenticated: boolean;
  activeRole: Role | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  activeRole: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ role: Role }>) => {
      state.isAuthenticated = true;
      state.activeRole = action.payload.role;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.activeRole = null;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
