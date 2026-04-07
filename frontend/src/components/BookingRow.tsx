import { useState } from "react";
import type { Booking } from "../types";

interface Props {
  booking: Booking;
  onCancel: (id: number) => void;
  cancelling: boolean;
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, time };
}

export function BookingRow({ booking, onCancel, cancelling }: Props) {
  const [confirming, setConfirming] = useState(false);
  const isCancelled = booking.status === "cancelled";

  const start = formatDateTime(booking.start_time);
  const end = formatDateTime(booking.end_time);

  return (
    <div
      className={`rounded-xl border px-5 py-4 flex items-center justify-between gap-4 ${
        isCancelled
          ? "border-slate-100 bg-slate-50 opacity-60"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-slate-900 truncate">
            {booking.room.name}
          </p>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
              isCancelled
                ? "bg-slate-100 text-slate-500"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {booking.status}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          {start.date} &nbsp;·&nbsp; {start.time} – {end.time}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          by {booking.user.username}
        </p>
      </div>

      {!isCancelled && (
        <div className="shrink-0">
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Cancel booking?</span>
              <button
                onClick={() => {
                  setConfirming(false);
                  onCancel(booking.id);
                }}
                disabled={cancelling}
                className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
              >
                {cancelling ? "Cancelling..." : "Yes"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
