import { apiSlice } from '@/common/api/apiSlice';
import type { components } from "@/common/types/generated-api-types";

export type BookReservation = components["schemas"]["BookReservation"];
// Attempting to use the standard pattern. If strict types fail, we might need to verify the list name.
// Usually it is Paginated<ModelName>List.
export type PaginatedBookReservationList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: BookReservation[];
};

export type BookReservationStatusEnum = components["schemas"]["BookReservationStatusEnum"];

export const bookReservationsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getBookReservations: builder.query<
            PaginatedBookReservationList,
            {
                page?: number;
                page_size?: number;
                search?: string;
                status?: string; // string to allow "ALL" or multiple if generic
                ordering?: string;
            }
        >({
            query: (params) => ({
                url: '/library/book-reservations/',
                method: 'GET',
                params,
            }),
            providesTags: ['BookReservations'] as any,
        }),
        fulfillBookReservation: builder.mutation<void, string>({
            query: (id) => ({
                url: `/library/book-reservations/${id}/fulfill/`,
                method: 'POST',
            }),
            invalidatesTags: ['BookReservations'] as any,
        }),
        deleteBookReservation: builder.mutation<void, string>({
            query: (id) => ({
                url: `/library/book-reservations/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['BookReservations'] as any,
        }),
        cancelBookReservation: builder.mutation<BookReservation, string>({
            query: (id) => ({
                url: `/library/book-reservations/${id}/`,
                method: 'PATCH',
                body: { status: 'CANCELLED' }
            }),
            invalidatesTags: ['BookReservations'] as any,
        })
    }),
    overrideExisting: false,
});

export const {
    useGetBookReservationsQuery,
    useFulfillBookReservationMutation,
    useDeleteBookReservationMutation,
    useCancelBookReservationMutation
} = bookReservationsApiSlice;
