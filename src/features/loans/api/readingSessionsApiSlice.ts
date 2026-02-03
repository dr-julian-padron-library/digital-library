import { apiSlice } from '@/common/api/apiSlice';

export type FastCheckoutRequest = {
    user_id: string; // Changed from number to string to support UUIDs
    cota: string;
};

export const readingSessionsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        fastCheckout: builder.mutation<any, FastCheckoutRequest>({
            query: (body) => ({
                url: '/library/reading-sessions/fast_checkout/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Loans'], // Assuming 'Loans' is the tag for reading sessions currently
        }),
    }),
    overrideExisting: false,
});

export const { useFastCheckoutMutation } = readingSessionsApiSlice;
