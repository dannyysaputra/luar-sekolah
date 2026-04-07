import { useState, useCallback, useEffect, useRef } from "react";
import type { Room } from "../types";
import type { ApiError } from "../types";
import { bookingsApi } from "../api/bookings";
import { roomsApi } from "../api/rooms";
import { FeedbackBanner } from "./FeedbackBanner";

interface Props {
  selectedRoom: Room | null;
  userId: number;
  onBookingCreated: () => void;
}

interface FormState {
  date: string;
  start_time: string;
  end_time: string;
}

const INITIAL_FORM: FormState = { date: "", start_time: "", end_time: "" };

function toISOUTC(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

type FeedbackState =
  | { type: "conflict"; message: string }
  | { type: "success" }
  | { type: "error"; message: string }
  | null;

type AvailabilityStatus = "idle" | "checking" | "available" | "conflict";

export function BookingForm({ selectedRoom, userId, onBookingCreated }: Props) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [availability, setAvailability] = useState<AvailabilityStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!selectedRoom || !form.date || !form.start_time || !form.end_time) {
      setAvailability("idle");
      return;
    }
    const start = new Date(`${form.date}T${form.start_time}`);
    const end = new Date(`${form.date}T${form.end_time}`);
    if (end <= start || start <= new Date()) {
      setAvailability("idle");
      return;
    }
    setAvailability("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await roomsApi.checkAvailability(
          selectedRoom.id,
          toISOUTC(form.date, form.start_time),
          toISOUTC(form.date, form.end_time),
        );
        setAvailability(res.data.is_available ? "available" : "conflict");
      } catch {
        setAvailability("idle");
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedRoom, form.date, form.start_time, form.end_time]);

  const validate = useCallback((): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.date) errs.date = "Date is required.";
    if (!form.start_time) errs.start_time = "Start time is required.";
    if (!form.end_time) errs.end_time = "End time is required.";
    if (form.date && form.start_time && form.end_time) {
      const start = new Date(`${form.date}T${form.start_time}`);
      const end = new Date(`${form.date}T${form.end_time}`);
      const now = new Date();
      if (start <= now) errs.start_time = "Booking cannot be made in the past.";
      else if (end <= start)
        errs.end_time = "End time must be later than start time.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    if (!validate()) return;

    setLoading(true);
    setFeedback(null);

    try {
      await bookingsApi.create({
        user_id: userId,
        room_id: selectedRoom.id,
        start_time: toISOUTC(form.date, form.start_time),
        end_time: toISOUTC(form.date, form.end_time),
      });
      setForm(INITIAL_FORM);
      setAvailability("idle");
      setFeedback({ type: "success" });
      onBookingCreated();
    } catch (err) {
      const e = err as { status?: number; apiError?: ApiError };
      if (e.status === 409) {
        setFeedback({
          type: "conflict",
          message:
            e.apiError?.errors?.time_range?.[0] ??
            "This room is already booked for the selected time range.",
        });
      } else if (e.status === 400 && e.apiError?.errors) {
        const apiErrs = e.apiError.errors;
        setErrors({
          start_time: apiErrs.start_time?.[0],
          end_time: apiErrs.end_time?.[0],
        });
      } else {
        setFeedback({
          type: "error",
          message:
            e.apiError?.message ?? "Something went wrong. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Selected room summary */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        {selectedRoom ? (
          <>
            <p className="text-xs text-slate-500">Selected room</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5">
              {selectedRoom.name}
            </p>
            <p className="text-xs text-slate-400">
              {selectedRoom.location} · {selectedRoom.capacity} seats
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-400">
            No room selected. Choose a room from the list.
          </p>
        )}
      </div>

      {/* Feedback banners */}
      {feedback?.type === "conflict" && (
        <FeedbackBanner
          variant="conflict"
          message="Booking conflict"
          detail={`${feedback.message} Please choose a different time slot.`}
          onDismiss={() => setFeedback(null)}
        />
      )}
      {feedback?.type === "success" && (
        <FeedbackBanner
          variant="success"
          message="Booking created successfully."
          onDismiss={() => setFeedback(null)}
        />
      )}
      {feedback?.type === "error" && (
        <FeedbackBanner
          variant="error"
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Date */}
      <div>
        <label
          className="block text-sm font-medium text-slate-700 mb-1"
          htmlFor="date"
        >
          Date
        </label>
        <input
          id="date"
          type="date"
          value={form.date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          className={`w-full h-11 rounded-xl border px-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            errors.date ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.date && (
          <p className="mt-1 text-xs text-red-600">{errors.date}</p>
        )}
      </div>

      {/* Start + End time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className="block text-sm font-medium text-slate-700 mb-1"
            htmlFor="start_time"
          >
            Start time
          </label>
          <input
            id="start_time"
            type="time"
            value={form.start_time}
            onChange={(e) =>
              setForm((f) => ({ ...f, start_time: e.target.value }))
            }
            className={`w-full h-11 rounded-xl border px-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.start_time ? "border-red-400" : "border-slate-200"
            }`}
          />
          {errors.start_time && (
            <p className="mt-1 text-xs text-red-600">{errors.start_time}</p>
          )}
        </div>
        <div>
          <label
            className="block text-sm font-medium text-slate-700 mb-1"
            htmlFor="end_time"
          >
            End time
          </label>
          <input
            id="end_time"
            type="time"
            value={form.end_time}
            onChange={(e) =>
              setForm((f) => ({ ...f, end_time: e.target.value }))
            }
            className={`w-full h-11 rounded-xl border px-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.end_time ? "border-red-400" : "border-slate-200"
            }`}
          />
          {errors.end_time && (
            <p className="mt-1 text-xs text-red-600">{errors.end_time}</p>
          )}
        </div>
      </div>

      {/* Real-time availability badge */}
      {availability === "checking" && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg
            className="animate-spin h-3.5 w-3.5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          Checking availability…
        </div>
      )}
      {availability === "available" && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          This room is available for the selected time slot.
        </div>
      )}
      {availability === "conflict" && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          This room is already booked. Please choose a different time slot.
        </div>
      )}
      {availability === "idle" && (
        <p className="text-xs text-slate-400">
          End time must be later than start time.
        </p>
      )}

      <button
        type="submit"
        disabled={
          !selectedRoom ||
          loading ||
          userId === 0 ||
          availability === "conflict" ||
          availability === "checking"
        }
        className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Creating..." : "Create Booking"}
      </button>
    </form>
  );
}
