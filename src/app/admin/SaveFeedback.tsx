interface SaveFeedbackProps {
  message: string | null;
  ok?: boolean;
}

export function SaveFeedback({ message, ok }: SaveFeedbackProps) {
  if (!message) return null;

  return (
    <span
      className={`text-sm ${ok ? "font-medium text-emerald-700" : "text-red-600"}`}
      role="status"
    >
      {message}
    </span>
  );
}
