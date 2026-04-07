interface Props {
  message: string;
}

export function EmptyState({ message }: Props) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
