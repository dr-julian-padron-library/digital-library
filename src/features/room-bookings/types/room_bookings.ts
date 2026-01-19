export enum RoomBookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export type RoomBooking = {
  national_document: string;
  admin_comments: string | null;
  description: string;
  email: string;
  requested_equipment: string | null;
  status: RoomBookingStatus;
  event_date: string;
  response_date: string | null;
  end_time: string;
  start_time: string;
  id: string;
  full_name: string;
  participant_count: number;
  request_number: string;
  requires_equipment: boolean | null;
  phone: string;
  event_type: string;
  updated_at: string;
};

export type RoomBookingRow = RoomBooking & {
  created_at: string;
  updated_at: string;
};

export type RoomBookingInsert = Partial<RoomBooking>;

export type RoomBookingUpdate = Partial<RoomBooking>;