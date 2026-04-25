import type { Translations } from "../utils/i18n";
import { getGroupColorClass, getDomainHue } from "../utils/grouping";
import { IconHibernate, IconBookmark, IconClose } from "./icons";

interface GroupHeaderProps {
  name: string;
  count: number;
  color?: string;
  mode: "chrome" | "domain";
  t: Translations;
  headerStyle: "row" | "card" | "pill";
  onCloseAll: () => void;
}

export function GroupHeader({
  name,
  count,
  color,
  mode,
  t,
  headerStyle,
  onCloseAll,
}: GroupHeaderProps) {
  const dotStyle =
    mode === "domain"
      ? { background: `oklch(0.68 0.13 ${getDomainHue(name)})` }
      : undefined;

  const dotClass =
    mode === "domain" ? "tm-group-dot" : `tm-group-dot ${getGroupColorClass(color)}`;

  const inner = (
    <>
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
        <button className="tm-btn ghost sm danger" onClick={onCloseAll}>
          <IconClose size={11} /> {t.tabs.closeAll}
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
