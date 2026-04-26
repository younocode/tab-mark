import { useEffect, useRef } from "react";
import { IconClose } from "./icons";

interface PanelModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function PanelModal({ title, onClose, children }: PanelModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousActive = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    (focusable ?? panelRef.current)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

      if (items.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActive?.focus();
    };
  }, [onClose]);

  return (
    <div className="tm-overlay" onClick={onClose}>
      <div
        ref={panelRef}
        className="tm-panel-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tm-panel-title"
        tabIndex={-1}
      >
        <div className="tm-panel-modal-hd">
          <h2 id="tm-panel-title">{title}</h2>
          <button
            className="tm-btn ghost icon sm"
            onClick={onClose}
            aria-label="Close panel"
          >
            <IconClose size={14} />
          </button>
        </div>
        <div className="tm-panel-modal-body">{children}</div>
      </div>
    </div>
  );
}
