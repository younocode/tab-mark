import { useEffect } from "react";
import { IconClose, IconCheck } from "./icons";

export interface ToastData {
  msg: string;
  type?: "default" | "success" | "error";
  undoable?: boolean;
  onUndo?: () => void;
}

interface ToastProps {
  toast: ToastData | null;
  dismiss: () => void;
}

export function Toast({ toast, dismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(dismiss, 4000);
    return () => clearTimeout(id);
  }, [toast, dismiss]);

  if (!toast) return null;

  const variant = toast.type || "default";

  return (
    <div className={`tm-toast ${variant}`}>
      {variant === "success" && (
        <span className="toast-icon">
          <IconCheck size={12} />
        </span>
      )}
      {variant === "error" && (
        <span className="toast-icon">
          <IconClose size={12} />
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>{toast.msg}</span>
      {toast.undoable && (
        <button
          className="undo"
          onClick={() => {
            toast.onUndo?.();
            dismiss();
          }}
        >
          Undo
        </button>
      )}
      <button className="tm-btn ghost icon sm" onClick={dismiss}>
        <IconClose size={10} />
      </button>
    </div>
  );
}
