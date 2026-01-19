import { apiSlice } from '@/common/api/apiSlice';
import { RoomBooking, RoomBookingInsert } from '../types/room_bookings';
import { BlockedSchedules } from '../types/blocked_schedules';

export const roomBookingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRoomBookings: builder.query<RoomBooking[], { date?: string; status?: string }>({
            query: (params) => ({
                url: '/room-bookings/',
                method: 'GET',
                params,
            }),
            transformResponse: (response: { results: RoomBooking[] }) => response.results,
            providesTags: ['RoomBookings' as any],
        }),
        getBlockedSchedules: builder.query<BlockedSchedules[], { date?: string }>({
            query: (params) => ({
                url: '/blocked-schedules/',
                method: 'GET',
                params,
            }),
            transformResponse: (response: { results: BlockedSchedules[] }) => response.results,
            providesTags: ['BlockedSchedules' as any],
        }),
        createRoomBooking: builder.mutation<RoomBooking, RoomBookingInsert>({
            query: (bookingData) => ({
                url: '/room-bookings/',
                method: 'POST',
                body: bookingData,
            }),
            invalidatesTags: ['RoomBookings' as any],
        }),
        approveBooking: builder.mutation<RoomBooking, { id: string; data?: RoomBookingInsert }>({
            query: ({ id, data }) => ({
                url: `/room-bookings/${id}/approve/`,
                method: 'POST',
                body: data || {},
            }),
            invalidatesTags: ['RoomBookings' as any],
        }),
        cancelBooking: builder.mutation<RoomBooking, { id: string; data?: RoomBookingInsert }>({
            query: ({ id, data }) => ({
                url: `/room-bookings/${id}/cancel/`,
                method: 'POST',
                body: data || {},
            }),
            invalidatesTags: ['RoomBookings' as any],
        }),
        rejectBooking: builder.mutation<RoomBooking, { id: string; data?: RoomBookingInsert }>({
            query: ({ id, data }) => ({
                url: `/room-bookings/${id}/reject/`,
                method: 'POST',
                body: data || {},
            }),
            invalidatesTags: ['RoomBookings' as any],
        }),
    }),
});

export const {
    useGetRoomBookingsQuery,
    useGetBlockedSchedulesQuery,
    useCreateRoomBookingMutation,
    useApproveBookingMutation,
    useCancelBookingMutation,
    useRejectBookingMutation,
} = roomBookingsApiSlice;
