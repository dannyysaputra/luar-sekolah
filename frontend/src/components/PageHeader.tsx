import type { DemoUser } from "../types";

interface Props {
  activeUser: DemoUser | null;
  users: DemoUser[];
  onUserChange: (user: DemoUser) => void;
}

export function PageHeader({ activeUser, users, onUserChange }: Props) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
      <div>
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

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-slate-500">Viewing as</span>
        <select
          value={activeUser?.id ?? ""}
          onChange={(e) => {
            const u = users.find((u) => u.id === Number(e.target.value));
            if (u) onUserChange(u);
          }}
          className="h-9 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          {users.length === 0 && <option value="">Loading...</option>}
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
