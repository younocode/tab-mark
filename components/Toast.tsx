import { useEffect } from "react";
import { IconClose } from "./icons";

export interface ToastData {
  msg: string;
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
  return (
    <div className="tm-toast">
      <span>{toast.msg}</span>
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
