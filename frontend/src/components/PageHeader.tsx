export function PageHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
          Meeting Room Booking
        </h1>
        <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
          Demo
        </span>
      </div>
      <p className="text-sm text-slate-500">
        Browse rooms, reserve a time slot, and manage your bookings.
      </p>
    </div>
  );
}
