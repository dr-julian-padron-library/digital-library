import { apiSlice } from '@/common/api/apiSlice';
import { RoomBooking, RoomBookingInsert } from '../types/room_bookings';
import { BlockedSchedules } from '../types/blocked_schedules';

export const roomBookingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRoomBookings: builder.query<
            { count: number; next?: string; previous?: string; results: RoomBooking[] },
            {
                page?: number;
                page_size?: number;
                search?: string;
                ordering?: string;
                status?: string;
                event_date?: string;
                event_type?: string;
            }
        >({
            query: (params) => ({
                url: '/room-bookings/',
                method: 'GET',
                params,
            }),
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
        deleteRoomBooking: builder.mutation<void, string>({
            query: (id) => ({
                url: `/room-bookings/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['RoomBookings' as any],
        }),
        restoreRoomBooking: builder.mutation<RoomBooking, string>({
            query: (id) => ({
                url: `/room-bookings/${id}/restore/`,
                method: 'POST',
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
    useDeleteRoomBookingMutation,
    useRestoreRoomBookingMutation,
} = roomBookingsApiSlice;
