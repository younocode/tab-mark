import type { Translations } from "../utils/i18n";
import { getGroupColorClass, getDomainHue } from "../utils/grouping";
import { IconChevD, IconChevR, IconClose } from "./icons";

interface GroupHeaderProps {
  name: string;
  count: number;
  color?: string;
  mode: "chrome" | "domain";
  t: Translations;
  headerStyle: "row" | "card" | "pill";
  onCloseAll: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function GroupHeader({
  name,
  count,
  color,
  mode,
  t,
  headerStyle,
  onCloseAll,
  collapsed = false,
  onToggle,
}: GroupHeaderProps) {
  const dotStyle =
    mode === "domain"
      ? { background: `oklch(0.68 0.13 ${getDomainHue(name)})` }
      : undefined;

  const dotClass =
    mode === "domain" ? "tm-group-dot" : `tm-group-dot ${getGroupColorClass(color)}`;

  const inner = (
    <>
      {onToggle && (
        <button
          className="tm-btn ghost icon sm tm-group-toggle"
          onClick={onToggle}
          aria-label={collapsed ? t.tabs.expandGroup : t.tabs.collapseGroup}
          aria-expanded={!collapsed}
          title={collapsed ? t.tabs.expandGroup : t.tabs.collapseGroup}
        >
          {collapsed ? <IconChevR size={11} /> : <IconChevD size={11} />}
        </button>
      )}
      <div className="tm-group-name">
        <span className={dotClass} style={dotStyle} />
        <span
          style={
            mode === "domain"
              ? { fontFamily: "var(--font-mono)", fontWeight: 500 }
              : undefined
          }
        >
          {name}
        </span>
      </div>
      <div className="tm-group-count">{t.tabs.groupCount(count)}</div>
      <div className="tm-group-actions">
        <button className="tm-btn ghost icon sm danger" onClick={onCloseAll} title={t.tabs.closeAll}>
          <IconClose size={11} />
        </button>
      </div>
    </>
  );

  if (headerStyle === "card")
    return <div className="tm-group-hd-card">{inner}</div>;
  if (headerStyle === "pill")
    return <div className="tm-group-hd-pill">{inner}</div>;
  return <div className="tm-group-hd-row">{inner}</div>;
}
