type Variant = "success" | "error" | "conflict" | "info";

interface Props {
  variant: Variant;
  message: string;
  detail?: string;
  onDismiss?: () => void;
}

const styles: Record<Variant, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  conflict: "bg-red-50 border-red-400 text-red-900",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const icons: Record<Variant, string> = {
  success: "✓",
  error: "!",
  conflict: "✕",
  info: "i",
};

export function FeedbackBanner({ variant, message, detail, onDismiss }: Props) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${styles[variant]}`}
      role="alert"
    >
      <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-current/10 mt-0.5">
        {icons[variant]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
        {detail && <p className="text-sm opacity-80 mt-0.5">{detail}</p>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-current opacity-40 hover:opacity-70 transition-opacity text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
