// src/features/authentication/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApiSlice, AuthUserResponse, UserProfileResponse } from './authApiSlice.ts';
import type { AppRole } from '../types/user_roles';

interface AuthState {
  isAuthenticated: boolean;
  userRole: AppRole | null;
  user: AuthUserResponse | null;
  profile: UserProfileResponse | null;
  accessToken: string | null;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userRole: null,
  user: null,
  profile: null,
  accessToken: null,
  error: null,
};

// Helper to determine role from groups
const determineRole = (groups: string[] = []): AppRole | null => {
  if (groups.includes('ADMIN')) return 'ADMIN';
  if (groups.includes('LIBRARIAN')) return 'LIBRARIAN';
  if (groups.includes('USER')) return 'USER';
  return null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsAuthenticated: (state) => {
      state.isAuthenticated = true;
      state.error = null;
    },
    setUserRole: (state, action: PayloadAction<AppRole | null>) => {
      state.userRole = action.payload;
    },
    setUser: (state, action: PayloadAction<AuthUserResponse | null>) => {
      state.user = action.payload;
    },
    setProfile: (state, action: PayloadAction<UserProfileResponse | null>) => {
      state.profile = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    clearIsAuthenticated: (state) => {
      state.isAuthenticated = false;
      state.userRole = null;
      state.user = null;
      state.profile = null;
      state.accessToken = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {


    builder
      .addMatcher(authApiSlice.endpoints.logIn.matchFulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.userRole = determineRole(action.payload.groups);
        state.error = null;
      })
      .addMatcher(authApiSlice.endpoints.logIn.matchRejected, (state, action) => {
        state.isAuthenticated = false;
        state.userRole = null;
        state.user = null;
        state.error = action.error?.message ?? 'Unknown error';
      })
      .addMatcher(authApiSlice.endpoints.signUp.matchFulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.userRole = determineRole(action.payload.groups);
        state.error = null;
      })
      .addMatcher(authApiSlice.endpoints.signUp.matchRejected, (state, action) => {
        state.isAuthenticated = false;
        state.userRole = null;
        state.user = null;
        state.error = action.error?.message ?? 'Unknown error';
      })
      .addMatcher(authApiSlice.endpoints.signOut.matchFulfilled, (state) => {
        state.isAuthenticated = false;
        state.userRole = null;
        state.user = null;
        state.error = null;
      })
      .addMatcher(authApiSlice.endpoints.signOut.matchRejected, (state, action) => {
        state.isAuthenticated = false;
        state.userRole = null;
        state.user = null;
        state.profile = null;
        state.error = action.error?.message ?? 'Unknown error';
      })
      .addMatcher(authApiSlice.endpoints.getUserProfile.matchFulfilled, (state, action) => {
        state.profile = action.payload;
        // On reload, state.user is null. We must set isAuthenticated = true.
        // We also populate state.user with available data to prevent null errors, 
        // though groups/roles might be missing until a proper re-auth/refresh cycle if needed.
        if (!state.user) {
          state.user = {
            ...action.payload.user,
            groups: [], // Profile doesn't return groups, so we default to empty.
          };
        }
        state.isAuthenticated = true;
        state.error = null;
      });
  },
});

export const { setIsAuthenticated, setUserRole, setUser, setProfile, setAccessToken, clearIsAuthenticated } = authSlice.actions;
export default authSlice.reducer;