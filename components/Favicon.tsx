import { memo } from "react";

export const Favicon = memo(function Favicon({
  url,
  size = 16,
  radius = 4,
}: {
  url?: string;
  size?: number;
  radius?: number;
}) {
  const domain = url ? new URL(url).hostname.replace(/^www\./, "") : "";
  const letter = domain[0]?.toUpperCase() || "?";

  const faviconUrl = url
    ? `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`
    : undefined;

  if (!faviconUrl) {
    return <LetterTile letter={letter} size={size} radius={radius} />;
  }

  return (
    <img
      src={faviconUrl}
      width={size}
      height={size}
      style={{ borderRadius: radius, flexShrink: 0 }}
      loading="lazy"
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = "none";
        const fallback = target.nextElementSibling;
        if (fallback) (fallback as HTMLElement).style.display = "inline-flex";
      }}
      alt=""
    />
  );
});

function LetterTile({
  letter,
  size,
  radius,
}: {
  letter: string;
  size: number;
  radius: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "oklch(0.78 0.04 60)",
        color: "oklch(0.35 0.02 60)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.58),
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        letterSpacing: "-0.02em",
      }}
    >
      {letter}
    </div>
  );
}
