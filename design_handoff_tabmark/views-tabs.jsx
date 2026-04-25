// views-tabs.jsx — Tabs view (top sites, groups, recently closed)

function highlight(text, q) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

// Map a group name (Chrome group OR domain) to a colored dot
function GroupDot({ group, mode }) {
  if (mode === "domain") {
    // Hash domain to a hue
    let h = 0;
    for (let i = 0; i < group.length; i++) h = (h * 31 + group.charCodeAt(i)) % 360;
    return <span className="tm-group-dot" style={{ background: `oklch(0.68 0.13 ${h})` }}/>;
  }
  const map = { Development: "gd-dev", Research: "gd-research", Design: "gd-design", Docs: "gd-docs", Other: "gd-other" };
  return <span className={`tm-group-dot ${map[group] || "gd-other"}`}/>;
}

// Build groups by mode: "chrome" uses tab.group; "domain" aggregates by domain (every domain becomes a group)
function buildGroups(tabs, mode) {
  const groups = {};
  if (mode === "domain") {
    tabs.forEach((tab) => { (groups[tab.domain] = groups[tab.domain] || []).push(tab); });
    // sort by count desc
    return Object.fromEntries(Object.entries(groups).sort((a, b) => b[1].length - a[1].length));
  }
  tabs.forEach((tab) => { (groups[tab.group] = groups[tab.group] || []).push(tab); });
  return groups;
}

function TabCard({ tab, density, layout, dupSet, onClose, onOpen, q }) {
  const isDup = dupSet.has(tab.url);
  const cls = ["tm-tab-card", density, tab.hibernated ? "hibernated" : "", layout === "list" ? "list" : ""].filter(Boolean).join(" ");
  return (
    <div className={cls} onClick={() => onOpen(tab)}>
      <Favicon name={tab.favicon} domain={tab.domain} size={16}/>
      <span className="tm-tab-title">{highlight(tab.title, q)}</span>
      <span className="tm-tab-meta">{tab.domain}</span>
      {tab.hibernated && <span className="tm-pill hib">Zzz</span>}
      {isDup && <span className="tm-pill dup">dup</span>}
      <button className="tm-tab-close" onClick={(e) => { e.stopPropagation(); onClose(tab.id); }} aria-label="Close tab">
        <IconClose size={11}/>
      </button>
    </div>
  );
}

function TopSites({ sites, variant, t, onOpen }) {
  if (variant === "hidden") return null;
  if (variant === "compact") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 22 }}>
        {sites.map((s) => (
          <button key={s.url} className="tm-topsite compact-row" onClick={() => onOpen(s)}>
            <Favicon name={s.favicon} domain={s.domain} size={14}/>
            <span>{s.title}</span>
          </button>
        ))}
      </div>
    );
  }
  if (variant === "big") {
    return (
      <div className="tm-topsites">
        {sites.map((s) => (
          <button key={s.url} className="tm-topsite big" onClick={() => onOpen(s)}>
            <Favicon name={s.favicon} domain={s.domain} size={28} radius={6}/>
            <div>
              <div>{s.title}</div>
              <div className="ts-domain">{s.domain}</div>
            </div>
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="tm-topsites compact">
      {sites.map((s) => (
        <button key={s.url} className="tm-topsite" onClick={() => onOpen(s)}>
          <Favicon name={s.favicon} domain={s.domain} size={18} radius={4}/>
          <span>{s.title}</span>
        </button>
      ))}
    </div>
  );
}

function GroupHeader({ name, count, mode, t, headerStyle, onHibernate, onSaveAll, onCloseAll }) {
  const inner = (
    <>
      <div className="tm-group-name">
        <GroupDot group={name} mode={mode}/>
        <span style={mode === "domain" ? { fontFamily: "var(--font-mono)", fontWeight: 500 } : null}>{name}</span>
        {mode === "domain" && <span className="tm-pill" style={{ background: "var(--bg-sub)", color: "var(--fg-3)" }}>auto</span>}
      </div>
      <div className="tm-group-count">{t.tabs.groupCount(count)}</div>
      <div className="tm-group-actions">
        <button className="tm-btn ghost sm" onClick={onHibernate}><IconHibernate size={11}/> {t.tabs.hibernate}</button>
        <button className="tm-btn ghost sm" onClick={onSaveAll}><IconBookmark size={11}/> {t.tabs.saveAll}</button>
        <button className="tm-btn ghost sm danger" onClick={onCloseAll}><IconClose size={11}/> {t.tabs.closeAll}</button>
      </div>
    </>
  );
  if (headerStyle === "card") return <div className="tm-group-hd-card">{inner}</div>;
  if (headerStyle === "pill") return <div className="tm-group-hd-pill">{inner}</div>;
  return <div className="tm-group-hd-row">{inner}</div>;
}

function TabsView({ state, setState, t, tweaks }) {
  const { tabs, query } = state;
  const q = query.replace(/^@all\s*/i, "").trim();
  const filtered = !q ? tabs : tabs.filter((tab) =>
    tab.title.toLowerCase().includes(q.toLowerCase()) ||
    tab.url.toLowerCase().includes(q.toLowerCase()) ||
    tab.domain.toLowerCase().includes(q.toLowerCase())
  );

  const mode = tweaks.grouping || "chrome";
  const groups = buildGroups(filtered, mode);
  const groupOrder = mode === "domain"
    ? Object.keys(groups)
    : ["Development", "Research", "Design", "Docs", "Other"];

  // Detect duplicates by URL
  const urlCount = {};
  tabs.forEach((tab) => { urlCount[tab.url] = (urlCount[tab.url] || 0) + 1; });
  const dupSet = new Set(Object.keys(urlCount).filter((u) => urlCount[u] > 1));

  const cardCols = tweaks.tabsLayout === "list" ? "list" : (tweaks.density === "spacious" ? "cols-3" : "cols-4");

  const onClose = (id) => setState((s) => ({ ...s, tabs: s.tabs.filter((tab) => tab.id !== id), recentlyClosed: [
    { id: `rc-${Date.now()}`, ...tabs.find((tab) => tab.id === id), closedAt: 0 },
    ...s.recentlyClosed.slice(0, 19),
  ] }));
  const onOpen = (tab) => setState((s) => ({ ...s, toast: { msg: `Switched to ${tab.title.slice(0, 40)}…` } }));
  const onCloseGroup = (g) => setState((s) => ({ ...s, tabs: s.tabs.filter((tab) => tab.group !== g),
    toast: { msg: `Closed ${groups[g].length} tabs in ${g}`, undoable: true } }));
  const onSaveGroup = (g) => setState((s) => ({ ...s, toast: { msg: `Saved ${groups[g].length} tabs to bookmark folder “${g}”`, undoable: true } }));
  const onHibernateGroup = (g) => setState((s) => ({ ...s,
    tabs: s.tabs.map((tab) => tab.group === g ? { ...tab, hibernated: true } : tab),
    toast: { msg: `Hibernated ${groups[g].length} tabs` } }));
  const onRestore = (rc) => setState((s) => ({ ...s,
    tabs: [...s.tabs, { ...rc, id: Date.now(), group: rc.group || "Other", hibernated: false }],
    recentlyClosed: s.recentlyClosed.filter((x) => x.id !== rc.id),
    toast: { msg: `Restored ${rc.title.slice(0, 40)}…` } }));

  return (
    <div className="tm-content">
      <TopSites sites={state.topSites} variant={tweaks.topSites} t={t} onOpen={onOpen}/>

      {groupOrder.map((g) => groups[g] && (
        <div key={g} className="tm-section">
          <GroupHeader name={g} count={groups[g].length} mode={mode} t={t} headerStyle={tweaks.groupHeader}
            onCloseAll={() => onCloseGroup(g)} onSaveAll={() => onSaveGroup(g)} onHibernate={() => onHibernateGroup(g)}/>
          <div className={`tm-tab-grid ${cardCols}`}>
            {groups[g].map((tab) => (
              <TabCard key={tab.id} tab={tab} density={tweaks.density} layout={tweaks.tabsLayout}
                dupSet={dupSet} onClose={onClose} onOpen={onOpen} q={q}/>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--fg-3)" }}>
          {q ? t.search.noResults : t.empty.tabs}
        </div>
      )}

      {state.recentlyClosed.length > 0 && (
        <div className="tm-section" style={{ marginTop: 32 }}>
          <div className="tm-section-hd">
            <h2>{t.tabs.recentlyClosed}</h2>
            <span className="meta">{state.recentlyClosed.length}</span>
          </div>
          <div className="tm-rc-list">
            {state.recentlyClosed.slice(0, state.rcExpanded ? 20 : 5).map((rc) => (
              <div key={rc.id} className="tm-rc-item">
                <Favicon name={rc.favicon} domain={rc.domain} size={14}/>
                <span className="tm-tab-title">{rc.title}</span>
                <span className="tm-tab-meta">{rc.domain}</span>
                <span className="tm-rc-time">{rc.closedAt < 1 ? t.common.just : `${rc.closedAt}${t.common.min[0] === "m" ? "m" : "分"}`}</span>
                <button className="tm-btn sm tm-rc-restore" onClick={() => onRestore(rc)}>
                  <IconRestore size={11}/> {t.tabs.restore}
                </button>
              </div>
            ))}
          </div>
          {state.recentlyClosed.length > 5 && (
            <button className="tm-btn ghost sm" style={{ marginTop: 6 }}
              onClick={() => setState((s) => ({ ...s, rcExpanded: !s.rcExpanded }))}>
              {state.rcExpanded ? t.tabs.showLess : t.tabs.showMore}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TabsView, highlight });
