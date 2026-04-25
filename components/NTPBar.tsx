import { useState, useEffect, useRef, useCallback } from "react";
import { TabMarkDoodle } from "./TabMarkLogo";
import { IconSearch } from "./icons";
import type { Translations } from "../utils/i18n";

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

interface NTPBarProps {
  lang: string;
}

export function NTPBar({ lang }: NTPBarProps) {
  const [gQuery, setGQuery] = useState("");
  const [condensed, setCondensed] = useState(false);
  const ntpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let scroller: Element | null = null;
    let raf = 0;
    const tryAttach = () => {
      const main = ntpRef.current?.closest(".tm-main");
      scroller = main?.querySelector(".tm-content") ?? null;
      if (!scroller) {
        raf = requestAnimationFrame(tryAttach);
        return;
      }
      const onScroll = () =>
        setCondensed(scroller!.scrollTop > 24);
      scroller.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      (scroller as any).__tmOnScroll = onScroll;
    };
    tryAttach();
    return () => {
      cancelAnimationFrame(raf);
      if (scroller && (scroller as any).__tmOnScroll) {
        scroller.removeEventListener("scroll", (scroller as any).__tmOnScroll);
      }
    };
  }, []);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!gQuery.trim()) return;
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(gQuery)}`,
        "_blank",
        "noopener",
      );
    },
    [gQuery],
  );

  return (
    <div
      ref={ntpRef}
      className={`tm-ntp ${condensed ? "is-condensed" : ""}`}
    >
      <div className="tm-ntp-stage">
        <div className="tm-ntp-wordmark">
          <div className="mark">
            <TabMarkDoodle size={92} />
          </div>
          <span className="tagline">
            {lang === "en"
              ? "Tabs · Bookmarks · One home"
              : "标签 · 书签 · 同一主页"}
          </span>
        </div>
        <form className="tm-google" onSubmit={submit}>
          <span className="g-glyph">
            <GoogleGlyph />
          </span>
          <input
            value={gQuery}
            onChange={(e) => setGQuery(e.target.value)}
            autoComplete="off"
            placeholder={
              lang === "en"
                ? "Search Google or type a URL"
                : "搜索 Google 或输入网址"
            }
          />
          <div className="g-actions">
            <span className="g-divider" />
            <button
              type="submit"
              className="g-icon"
              title="Google search"
              aria-label="Search"
            >
              <IconSearch size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
