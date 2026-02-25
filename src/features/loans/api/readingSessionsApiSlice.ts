import { apiSlice } from '@/common/api/apiSlice';
import type { components } from "@/common/types/generated-api-types";

export type ReadingSession = components["schemas"]["ReadingSession"];
export type ReadingSessionDetail = components["schemas"]["ReadingSessionDetail"];
export type PaginatedReadingSessionList = components["schemas"]["PaginatedReadingSessionDetailList"];

export type FastCheckoutRequest = {
    user_id: string;
    cota: string;
};

export type FastReturnRequest = {
    user_id: string;
    cota: string;
};



export const readingSessionsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getReadingSessions: builder.query<
            PaginatedReadingSessionList,
            {
                page?: number;
                page_size?: number;
                search?: string;
                ordering?: string;
                status?: "Active" | "Overdue" | "Returned";
                user?: number;
                book?: string;
            }
        >({
            query: (params) => ({
                url: '/library/reading-sessions/',
                method: 'GET',
                params,
            }),
            providesTags: ['ReadingSessions'] as any,
        }),
        fastCheckout: builder.mutation<ReadingSession, FastCheckoutRequest>({
            query: (body) => ({
                url: '/library/reading-sessions/fast_checkout/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ReadingSessions'] as any,
        }),
        fastReturn: builder.mutation<void, FastReturnRequest>({
            query: (body) => ({
                url: '/library/reading-sessions/fast_return/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ReadingSessions'] as any,
        }),
        returnReadingSession: builder.mutation<ReadingSession, string>({
            query: (id) => ({
                url: `/library/reading-sessions/${id}/return/`,
                method: 'POST',
            }),
            invalidatesTags: ['ReadingSessions'] as any,
        }),
        deleteReadingSession: builder.mutation<void, string>({
            query: (id) => ({
                url: `/library/reading-sessions/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ReadingSessions'] as any,
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetReadingSessionsQuery,
    useFastCheckoutMutation,
    useFastReturnMutation,

    useReturnReadingSessionMutation,
    useDeleteReadingSessionMutation,
} = readingSessionsApiSlice;
