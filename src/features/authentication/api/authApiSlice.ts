// src/features/authentication/api/authApiSlice.ts
import { apiSlice } from '@/common/api/apiSlice';
import type { components } from '@/common/types/generated-api-types';
import { deleteCookie } from '@/common/lib/utils'

export type LoginRequest = components['schemas']['LoginRequest'];
export type SignUpRequest = components['schemas']['SingUpRequest'];

// New response type matching backend
export interface AuthUserResponse {
    first_name: string;
    last_name: string;
    email: string;
    groups: string[];
}

export interface UserProfileResponse {
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
    national_document: string | null;
    address: string | null;
    birth_date: string | null;
    phone: string | null;
    id: string;
}

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        logIn: builder.mutation<AuthUserResponse, LoginRequest>({
            query: (payload) => ({
                url: 'login/',
                method: 'POST',
                body: payload,
            }),
        }),
        signUp: builder.mutation<AuthUserResponse, SignUpRequest>({
            query: (payload) => ({
                url: 'signup/',
                method: 'POST',
                body: payload,
            }),
        }),
        signOut: builder.mutation<void, void>({
            query: () => ({
                url: 'signout/',
                method: 'POST',
                body: {},
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    deleteCookie('csrftoken');
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            },
        }),
        getUserProfile: builder.query<UserProfileResponse, void>({
            query: () => 'user/me/',
            providesTags: ['User'],
        }),
        updateUserProfile: builder.mutation<UserProfileResponse, FormData>({
            query: (payload) => ({
                url: 'user/me/',
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: ['User'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useLogInMutation,
    useSignUpMutation,
    useSignOutMutation,
    useGetUserProfileQuery,
    useLazyGetUserProfileQuery,
    useUpdateUserProfileMutation
} = authApiSlice;