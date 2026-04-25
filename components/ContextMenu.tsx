import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

export type ContextMenuItem =
  | {
      label: string;
      icon?: React.ReactNode;
      danger?: boolean;
      disabled?: boolean;
      onClick: () => void;
    }
  | { type: "separator" };

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const getMenuItems = useCallback(
    () =>
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not(:disabled)',
      ) ?? [],
    [],
  );

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pad = 8;
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth - pad)
      left = window.innerWidth - rect.width - pad;
    if (top + rect.height > window.innerHeight - pad)
      top = window.innerHeight - rect.height - pad;
    if (left < pad) left = pad;
    if (top < pad) top = pad;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;

    const items = getMenuItems();
    items[0]?.focus();
  }, [x, y, getMenuItems]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const btns = Array.from(getMenuItems());
        if (!btns.length) return;
        const cur = btns.indexOf(document.activeElement as HTMLButtonElement);
        const next =
          e.key === "ArrowDown"
            ? (cur + 1) % btns.length
            : (cur - 1 + btns.length) % btns.length;
        btns[next]?.focus();
      }
    };

    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        onClose();
    };

    const onScroll = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        onClose();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("blur", onClose);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose, getMenuItems]);

  return createPortal(
    <div
      ref={menuRef}
      className="tm-ctx-menu"
      role="menu"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => {
        if ("type" in item && item.type === "separator") {
          return <div key={i} className="tm-ctx-sep" />;
        }
        const mi = item as Exclude<ContextMenuItem, { type: "separator" }>;
        return (
          <button
            key={i}
            role="menuitem"
            className={`tm-ctx-item ${mi.danger ? "danger" : ""}`}
            disabled={mi.disabled}
            onClick={() => {
              mi.onClick();
              onClose();
            }}
          >
            {mi.icon}
            {mi.label}
          </button>
        );
      })}
    </div>,
    document.body,
  );
}
