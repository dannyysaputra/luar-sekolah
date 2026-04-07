import type { Pagination } from "../types";

interface Props {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export function Paginator({ pagination, onPageChange }: Props) {
  const {
    page,
    total_pages,
    has_previous,
    has_next,
    total_items,
    page_size,
  } = pagination;

  if (total_pages <= 1) return null;

  const start = (page - 1) * page_size + 1;
  const end = Math.min(page * page_size, total_items);

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
      <p className="text-xs text-slate-400">
        {start}–{end} of {total_items}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!has_previous}
          className="h-8 px-3 rounded-lg text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        <span className="px-3 h-8 flex items-center text-xs text-slate-500">
          {page} / {total_pages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
          className="h-8 px-3 rounded-lg text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
