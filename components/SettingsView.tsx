import { useState } from "react";
import { usePreferenceStore } from "../stores/preferenceStore";
import type { Translations } from "../utils/i18n";

export function SettingsView({ t }: { t: Translations }) {
  const theme = usePreferenceStore((s) => s.theme);
  const lang = usePreferenceStore((s) => s.lang);
  const defaultView = usePreferenceStore((s) => s.defaultView);
  const topSitesStyle = usePreferenceStore((s) => s.topSitesStyle);
  const topSitesCount = usePreferenceStore((s) => s.topSitesCount);
  const density = usePreferenceStore((s) => s.density);
  const tabsLayout = usePreferenceStore((s) => s.tabsLayout);
  const grouping = usePreferenceStore((s) => s.grouping);
  const groupHeader = usePreferenceStore((s) => s.groupHeader);
  const setPref = usePreferenceStore((s) => s.set);
  const [ruleInput, setRuleInput] = useState({ name: "", patterns: "" });

  const [rules, setRules] = useState<{ id: string; name: string; patterns: string[] }[]>(() => {
    const saved = localStorage.getItem("tabmark_grouping_rules");
    return saved ? JSON.parse(saved) : [];
  });

  const saveRules = (updated: typeof rules) => {
    setRules(updated);
    localStorage.setItem("tabmark_grouping_rules", JSON.stringify(updated));
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="tm-section">
        <div className="tm-section-hd">
          <h2>{t.settings.appearance}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SettingRow label={t.settings.theme}>
            <div className="tm-segmented">
              {(["system", "light", "dark"] as const).map((v) => (
                <button
                  key={v}
                  className={theme === v ? "active" : ""}
                  onClick={() => setPref("theme", v)}
                >
                  {v === "system" ? t.settings.themeSystem : v === "light" ? t.settings.themeLight : t.settings.themeDark}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label={t.settings.language}>
            <div className="tm-segmented">
              {(["en", "zh"] as const).map((v) => (
                <button
                  key={v}
                  className={lang === v ? "active" : ""}
                  onClick={() => setPref("lang", v)}
                >
                  {v === "en" ? "English" : "中文"}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label={t.settings.defaultView}>
            <div className="tm-segmented">
              {(["home", "bookmarks"] as const).map((v) => (
                <button
                  key={v}
                  className={defaultView === v ? "active" : ""}
                  onClick={() => setPref("defaultView", v)}
                >
                  {v === "home" ? t.nav.home : t.nav.bookmarks}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label={t.settings.topSites}>
            <div className="tm-segmented">
              {(["big", "small", "compact", "hidden"] as const).map((v) => (
                <button
                  key={v}
                  className={topSitesStyle === v ? "active" : ""}
                  onClick={() => setPref("topSitesStyle", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label={t.settings.topSitesCount}>
            <div className="tm-segmented">
              {([4, 6, 8] as const).map((v) => (
                <button
                  key={v}
                  className={topSitesCount === v ? "active" : ""}
                  onClick={() => setPref("topSitesCount", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Density">
            <div className="tm-segmented">
              {(["compact", "comfortable", "spacious"] as const).map((v) => (
                <button
                  key={v}
                  className={density === v ? "active" : ""}
                  onClick={() => setPref("density", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Layout">
            <div className="tm-segmented">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  className={tabsLayout === v ? "active" : ""}
                  onClick={() => setPref("tabsLayout", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Grouping">
            <div className="tm-segmented">
              {(["chrome", "domain"] as const).map((v) => (
                <button
                  key={v}
                  className={grouping === v ? "active" : ""}
                  onClick={() => setPref("grouping", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Group Header">
            <div className="tm-segmented">
              {(["row", "card", "pill"] as const).map((v) => (
                <button
                  key={v}
                  className={groupHeader === v ? "active" : ""}
                  onClick={() => setPref("groupHeader", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>
      </div>

      <div className="tm-section" style={{ marginTop: 24 }}>
        <div className="tm-section-hd">
          <h2>{t.settings.groupingRules}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rules.map((rule) => (
            <div
              key={rule.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontWeight: 500, fontSize: 13 }}>{rule.name}</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--fg-3)",
                }}
              >
                {rule.patterns.join(", ")}
              </span>
              <button
                className="tm-btn ghost sm danger"
                style={{ marginLeft: "auto" }}
                onClick={() => saveRules(rules.filter((r) => r.id !== rule.id))}
              >
                {t.bookmarks.remove}
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={ruleInput.name}
              onChange={(e) =>
                setRuleInput((r) => ({ ...r, name: e.target.value }))
              }
              placeholder={t.settings.groupNamePlaceholder}
              style={{
                width: 120,
                height: 28,
                padding: "0 8px",
                border: "1px solid var(--border)",
                borderRadius: 4,
                background: "var(--bg-sub)",
                color: "var(--fg)",
                fontSize: 12,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <input
              value={ruleInput.patterns}
              onChange={(e) =>
                setRuleInput((r) => ({ ...r, patterns: e.target.value }))
              }
              placeholder={t.settings.domainPatternsPlaceholder}
              style={{
                flex: 1,
                height: 28,
                padding: "0 8px",
                border: "1px solid var(--border)",
                borderRadius: 4,
                background: "var(--bg-sub)",
                color: "var(--fg)",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
            <button
              className="tm-btn sm primary"
              onClick={() => {
                if (!ruleInput.name.trim() || !ruleInput.patterns.trim()) return;
                saveRules([
                  ...rules,
                  {
                    id: `rule-${Date.now()}`,
                    name: ruleInput.name.trim(),
                    patterns: ruleInput.patterns
                      .split(",")
                      .map((p) => p.trim())
                      .filter(Boolean),
                  },
                ]);
                setRuleInput({ name: "", patterns: "" });
              }}
            >
              {t.settings.addRule}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  );
}
