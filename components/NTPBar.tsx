import { useState, useCallback } from "react";
import { TabMarkDoodle } from "./TabMarkLogo";
import { IconSearch } from "./icons";
import type { Translations } from "../utils/i18n";

interface NTPBarProps {
  t: Translations;
  onSearch: (query: string) => void;
}

export function NTPBar({ t, onSearch }: NTPBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(searchQuery.trim());
    },
    [onSearch, searchQuery],
  );

  return (
    <div className="tm-ntp">
      <div className="tm-ntp-stage">
        <div className="tm-ntp-wordmark">
          <div className="mark">
            <TabMarkDoodle size={92} />
          </div>
          <span className="tagline">
            {t.ntp.tagline}
          </span>
        </div>
        <form className="tm-google" onSubmit={submit}>
          <span className="g-glyph">
            <IconSearch size={20} />
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            placeholder={t.ntp.googlePlaceholder}
          />
        </form>
      </div>
    </div>
  );
}
