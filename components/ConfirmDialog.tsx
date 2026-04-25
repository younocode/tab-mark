import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="tm-overlay" onClick={onCancel}>
      <div
        className="tm-confirm"
        onClick={(e) => e.stopPropagation()}
        style={{ marginTop: "20vh" }}
      >
        <h4>{title}</h4>
        <p>{message}</p>
        <div className="actions">
          <button ref={cancelRef} className="tm-btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`tm-btn ${danger ? "danger" : "primary"}`}
            onClick={onConfirm}
            style={
              danger
                ? {
                    background: "var(--danger)",
                    color: "#fff",
                    borderColor: "var(--danger)",
                  }
                : undefined
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
