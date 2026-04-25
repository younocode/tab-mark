import { memo } from "react";
import { Favicon } from "./Favicon";
import type { TopSite } from "../types";

interface TopSitesProps {
  sites: TopSite[];
  variant: "big" | "small" | "compact" | "hidden";
  onOpen: (url: string) => void;
}

export const TopSites = memo(function TopSites({
  sites,
  variant,
  onOpen,
}: TopSitesProps) {
  if (variant === "hidden") return null;

  if (variant === "compact") {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 22,
        }}
      >
        {sites.map((s) => (
          <button
            key={s.url}
            className="tm-topsite compact-row"
            onClick={() => onOpen(s.url)}
          >
            <Favicon url={s.url} size={14} />
            <span>{s.title}</span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === "big") {
    return (
      <div className="tm-topsites">
        {sites.map((s) => {
          const domain = new URL(s.url).hostname.replace(/^www\./, "");
          return (
            <button
              key={s.url}
              className="tm-topsite big"
              onClick={() => onOpen(s.url)}
            >
              <Favicon url={s.url} size={28} radius={6} />
              <div>
                <div>{s.title}</div>
                <div className="ts-domain">{domain}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="tm-topsites compact">
      {sites.map((s) => (
        <button
          key={s.url}
          className="tm-topsite"
          onClick={() => onOpen(s.url)}
        >
          <Favicon url={s.url} size={18} radius={4} />
          <span>{s.title}</span>
        </button>
      ))}
    </div>
  );
});
