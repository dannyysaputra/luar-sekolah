import type { Room } from "../types";

interface Props {
  room: Room;
  selected: boolean;
  onSelect: (room: Room) => void;
}

export function RoomCard({ room, selected, onSelect }: Props) {
  return (
    <div
      onClick={() => onSelect(room)}
      className={`
        relative rounded-2xl border p-5 cursor-pointer transition-all
        ${
          selected
            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
        }
      `}
    >
      {selected && (
        <span className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-lg bg-blue-600 text-white">
          Selected
        </span>
      )}

      <div className="flex items-start justify-between gap-2 pr-16">
        <h3 className="text-base font-medium text-slate-900">{room.name}</h3>
        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
          {room.capacity} seats
        </span>
      </div>

      {room.location && (
        <p className="text-sm text-slate-500 mt-1">{room.location}</p>
      )}
      {room.description && (
        <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
          {room.description}
        </p>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(room);
        }}
        className={`
          mt-4 w-full h-9 rounded-xl text-sm font-medium transition-colors
          ${
            selected
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "border border-slate-200 text-slate-700 hover:bg-slate-50"
          }
        `}
      >
        {selected ? "Room selected" : "Select room"}
      </button>
    </div>
  );
}
