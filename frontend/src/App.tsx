import { useState } from "react";
import { PageShell } from "./components/PageShell";
import { PageHeader } from "./components/PageHeader";
import { SectionCard } from "./components/SectionCard";
import { RoomCard } from "./components/RoomCard";
import { BookingForm } from "./components/BookingForm";
import { BookingRow } from "./components/BookingRow";
import { EmptyState } from "./components/EmptyState";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { FeedbackBanner } from "./components/FeedbackBanner";
import { Paginator } from "./components/Paginator";
import { useRooms } from "./hooks/useRooms";
import { useBookings } from "./hooks/useBookings";
import type { Room } from "./types";

// For this demo, user is fixed to ID 1 (alice). In production this comes from auth.
const DEMO_USER_ID = 1;

export default function App() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [filterDate, setFilterDate] = useState("");

  const {
    rooms,
    loading: roomsLoading,
    error: roomsError,
    pagination: roomsPagination,
    goToPage: goToRoomPage,
  } = useRooms();

  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    cancelBooking,
    cancellingId,
    pagination: bookingsPagination,
    goToPage: goToBookingPage,
    refetch: refetchBookings,
  } = useBookings({ userId: DEMO_USER_ID, date: filterDate || undefined });

  return (
    <PageShell>
      <PageHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left – Room list */}
        <div className="lg:col-span-7">
          <SectionCard
            title="Available Rooms"
            description="Select a room to book a time slot."
          >
            {roomsError && (
              <FeedbackBanner variant="error" message={roomsError} />
            )}
            {roomsLoading ? (
              <LoadingSkeleton rows={4} />
            ) : rooms.length === 0 ? (
              <EmptyState message="No rooms available right now." />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      selected={selectedRoom?.id === room.id}
                      onSelect={setSelectedRoom}
                    />
                  ))}
                </div>
                {roomsPagination && (
                  <Paginator
                    pagination={roomsPagination}
                    onPageChange={goToRoomPage}
                  />
                )}
              </>
            )}
          </SectionCard>
        </div>

        {/* Right – Booking panel */}
        <div className="lg:col-span-5">
          <SectionCard
            title="Book a Room"
            description="Fill in the details below to reserve a slot."
          >
            <BookingForm
              selectedRoom={selectedRoom}
              userId={DEMO_USER_ID}
              onBookingCreated={refetchBookings}
            />
          </SectionCard>
        </div>

        {/* Bottom – My bookings */}
        <div className="lg:col-span-12">
          <SectionCard
            title="My Bookings"
            description="Your upcoming and past reservations."
            actions={
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500" htmlFor="filter-date">
                  Filter by date
                </label>
                <input
                  id="filter-date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {filterDate && (
                  <button
                    onClick={() => setFilterDate("")}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            }
          >
            {bookingsError && (
              <FeedbackBanner variant="error" message={bookingsError} />
            )}
            {bookingsLoading ? (
              <LoadingSkeleton rows={3} />
            ) : bookings.length === 0 ? (
              <EmptyState
                message={
                  filterDate
                    ? "No bookings found for the selected date."
                    : "You do not have any bookings yet."
                }
              />
            ) : (
              <>
                <div className="space-y-2">
                  {bookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      onCancel={cancelBooking}
                      cancelling={cancellingId === booking.id}
                    />
                  ))}
                </div>
                {bookingsPagination && (
                  <Paginator
                    pagination={bookingsPagination}
                    onPageChange={goToBookingPage}
                  />
                )}
              </>
            )}
          </SectionCard>
        </div>
      </div>
    </PageShell>
  );
}
