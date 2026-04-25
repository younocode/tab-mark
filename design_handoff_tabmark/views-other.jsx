// views-other.jsx — Read Later, Health Check, Settings

function ReadLaterView({ state, setState, t }) {
  const { readingList, rlTab } = state;
  const items = readingList.filter((x) => rlTab === "unread" ? !x.read : x.read);

  const toggle = (id) => setState((s) => ({
    ...s, readingList: s.readingList.map((x) => x.id === id ? { ...x, read: !x.read } : x),
  }));
  const remove = (id) => setState((s) => ({
    ...s, readingList: s.readingList.filter((x) => x.id !== id),
    toast: { msg: "Removed from reading list", undoable: true },
  }));

  return (
    <div className="tm-content">
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{t.nav.readLater}</h2>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--fg-3)" }}>
          {readingList.filter((x) => !x.read).length} {t.readlater.unread.toLowerCase()} · {readingList.filter((x) => x.read).length} {t.readlater.read.toLowerCase()}
        </span>
      </div>
      <div className="tm-rl-tabs">
        <button className={rlTab === "unread" ? "active" : ""}
          onClick={() => setState((s) => ({ ...s, rlTab: "unread" }))}>{t.readlater.unread}</button>
        <button className={rlTab === "read" ? "active" : ""}
          onClick={() => setState((s) => ({ ...s, rlTab: "read" }))}>{t.readlater.read}</button>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--fg-3)" }}>{t.readlater.empty}</div>
      ) : items.map((item) => (
        <div key={item.id} className={`tm-rl-item ${item.read ? "read" : ""}`}>
          <span className="read-marker"/>
          <Favicon name={item.favicon} domain={item.domain} size={16}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="tm-tab-title">{item.title}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>
              {item.domain} · {item.added}d ago
            </div>
          </div>
          <button className="tm-btn ghost sm" onClick={() => toggle(item.id)}>
            <IconCheck size={11}/> {item.read ? t.readlater.markUnread : t.readlater.markRead}
          </button>
          <button className="tm-btn ghost sm"><IconBookmark size={11}/> {t.readlater.saveBookmark}</button>
          <button className="tm-btn ghost sm danger" onClick={() => remove(item.id)}><IconClose size={11}/></button>
        </div>
      ))}
    </div>
  );
}

function HealthView({ state, setState, t }) {
  const { health, healthTab, scanProgress, scanning } = state;

  const startScan = () => {
    setState((s) => ({ ...s, scanning: true, scanProgress: 0 }));
    let p = 0;
    const tick = () => {
      p += Math.random() * 12 + 5;
      if (p >= 100) {
        setState((s) => ({ ...s, scanning: false, scanProgress: 100 }));
      } else {
        setState((s) => ({ ...s, scanProgress: Math.min(99, Math.round(p)) }));
        setTimeout(tick, 180);
      }
    };
    setTimeout(tick, 200);
  };

  const total = health.dead.length + 247;

  return (
    <div className="tm-content">
      <div className="tm-health-card">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{t.health.title}</h2>
            <p style={{ margin: "4px 0 0", color: "var(--fg-3)", fontSize: 12.5 }}>{t.health.subtitle}</p>
          </div>
          <button className="tm-btn primary" onClick={startScan} disabled={scanning}>
            {scanning ? t.health.scanning : t.health.start}
          </button>
        </div>
        {(scanning || scanProgress > 0) && (
          <>
            <div className="tm-progress"><div style={{ width: `${scanProgress}%` }}/></div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)" }}>
              {t.health.checked(Math.round(total * scanProgress / 100), total)}
            </div>
          </>
        )}
      </div>

      <div className="tm-rl-tabs">
        <button className={healthTab === "dead" ? "active" : ""}
          onClick={() => setState((s) => ({ ...s, healthTab: "dead" }))}>
          {t.health.dead} <span style={{ marginLeft: 6, fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>{health.dead.length}</span>
        </button>
        <button className={healthTab === "duplicates" ? "active" : ""}
          onClick={() => setState((s) => ({ ...s, healthTab: "duplicates" }))}>
          {t.health.duplicates} <span style={{ marginLeft: 6, fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>{health.duplicates.length}</span>
        </button>
      </div>

      {healthTab === "dead" ? (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button className="tm-btn sm danger">{t.health.deleteAll}</button>
          </div>
          {health.dead.map((d) => (
            <div key={d.id} className="tm-rl-item">
              <Favicon name={d.favicon} domain={d.domain} size={14}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tm-tab-title">{d.title}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)" }}>{d.domain} · {d.path}</div>
              </div>
              <span className="tm-pill" style={{ background: "oklch(from var(--danger) l c h / 0.15)", color: "var(--danger)" }}>
                {d.status}
              </span>
              <button className="tm-btn ghost sm danger"><IconClose size={11}/></button>
            </div>
          ))}
        </>
      ) : (
        <>
          {health.duplicates.map((dup, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--bg-sub)", borderRadius: 6 }}>
                <Favicon name={dup.favicon} domain={dup.domain} size={14}/>
                <span style={{ fontWeight: 500 }}>{dup.title}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>{dup.url}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--fg-3)" }}>{t.health.group(dup.copies.length)}</span>
              </div>
              {dup.copies.map((c, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 22px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)", flex: 1 }}>{c.path}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-4)" }}>{c.added}</span>
                  {c.keep
                    ? <span className="tm-pill" style={{ background: "oklch(from var(--success) l c h / 0.18)", color: "var(--success)" }}>{t.health.keep}</span>
                    : <button className="tm-btn ghost sm danger"><IconClose size={11}/> {t.health.remove}</button>}
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function SettingsView({ state, setState, t, tweaks, setTweak }) {
  return (
    <div className="tm-content">
      <div className="tm-settings">
        <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>{t.nav.settings}</h2>

        <div className="tm-set-section">
          <h3>{t.settings.appearance}</h3>
          <div className="tm-set-row">
            <div>
              <div className="label">{t.settings.theme}</div>
              <div className="desc">Follows your browser setting.</div>
            </div>
            <div className="control">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)" }}>SYSTEM</span>
            </div>
          </div>
          <div className="tm-set-row">
            <div>
              <div className="label">{t.settings.language}</div>
            </div>
            <div className="control">
              <div className="tm-segmented">
                {[["en", "English"], ["zh", "中文"]].map(([v, l]) => (
                  <button key={v} className={state.lang === v ? "active" : ""}
                    onClick={() => setState((s) => ({ ...s, lang: v }))}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="tm-set-section">
          <h3>{t.settings.topSites}</h3>
          <div className="tm-set-row">
            <div>
              <div className="label">{t.settings.showTopSites}</div>
              <div className="desc">Display the frequently-visited sites at the top of the Tabs view.</div>
            </div>
            <div className="control">
              <div className="tm-segmented">
                {[["big", "Big"], ["small", "Small"], ["compact", "Compact"], ["hidden", "Off"]].map(([v, l]) => (
                  <button key={v} className={tweaks.topSites === v ? "active" : ""}
                    onClick={() => setTweak("topSites", v)}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="tm-set-section">
          <h3>{t.settings.hibernation}</h3>
          <div className="tm-set-row">
            <div>
              <div className="label">{t.settings.hibEnabled}</div>
              <div className="desc">Releases memory after the threshold; click to wake.</div>
            </div>
            <div className="control">
              <button className={`tm-btn sm ${state.hibEnabled ? "primary" : ""}`}
                onClick={() => setState((s) => ({ ...s, hibEnabled: !s.hibEnabled }))}>
                {state.hibEnabled ? "On" : "Off"}
              </button>
            </div>
          </div>
          <div className="tm-set-row">
            <div>
              <div className="label">{t.settings.hibIdle}</div>
            </div>
            <div className="control" style={{ fontFamily: "var(--font-mono)" }}>
              30 min
            </div>
          </div>
        </div>

        <div className="tm-set-section">
          <h3>{t.settings.grouping}</h3>
          <div className="tm-set-row">
            <div>
              <div className="label">github.com → Development</div>
              <div className="desc">Auto-rule</div>
            </div>
            <div className="control">
              <button className="tm-btn ghost sm"><IconClose size={11}/></button>
            </div>
          </div>
          <div className="tm-set-row">
            <div>
              <div className="label">arxiv.org, scholar.google.com → Research</div>
              <div className="desc">Auto-rule</div>
            </div>
            <div className="control">
              <button className="tm-btn ghost sm"><IconClose size={11}/></button>
            </div>
          </div>
          <div className="tm-set-row">
            <button className="tm-btn"><IconPlus size={11}/> {t.settings.addRule}</button>
          </div>
        </div>

        <div className="tm-set-section">
          <h3>{t.settings.data}</h3>
          <div className="tm-set-row">
            <div className="label">{t.settings.exportTags}</div>
            <div className="control"><button className="tm-btn sm">Export JSON</button></div>
          </div>
          <div className="tm-set-row">
            <div className="label">{t.settings.clearTags}</div>
            <div className="control"><button className="tm-btn sm danger">Clear</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReadLaterView, HealthView, SettingsView });
