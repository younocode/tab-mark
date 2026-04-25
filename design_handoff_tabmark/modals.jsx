// modals.jsx — Command palette, smart save, snapshots

function CommandPalette({ state, setState, t }) {
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const allBookmarks = React.useMemo(() => flattenBookmarks(state.bookmarkTree), [state.bookmarkTree]);

  const matches = (text) => !q || text.toLowerCase().includes(q.toLowerCase());

  const tabResults = state.tabs.filter((t) => matches(t.title) || matches(t.url) || matches(t.domain)).slice(0, 5);
  const bmResults = allBookmarks.filter((b) => matches(b.title) || matches(b.url) || matches(b.domain)).slice(0, 5);
  const rlResults = state.readingList.filter((r) => matches(r.title) || matches(r.domain)).slice(0, 3);
  const histResults = state.history.filter((h) => matches(h.title) || matches(h.domain)).slice(0, 3);

  const flat = [
    ...tabResults.map((x) => ({ ...x, _src: t.search.grpOpen, _kind: "tab" })),
    ...bmResults.map((x) => ({ ...x, _src: t.search.grpBookmarks, _kind: "bm" })),
    ...rlResults.map((x) => ({ ...x, _src: t.search.grpRead, _kind: "rl" })),
    ...histResults.map((x) => ({ ...x, _src: t.search.grpHistory, _kind: "hi" })),
  ];

  const close = () => setState((s) => ({ ...s, paletteOpen: false }));

  const onKey = (e) => {
    if (e.key === "Escape") { close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(flat.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === "Enter") {
      const it = flat[sel];
      if (it) { close(); setState((s) => ({ ...s, toast: { msg: `Opened ${it.title.slice(0, 40)}…` } })); }
    }
  };

  const groups = [
    [t.search.grpOpen, tabResults, "tab"],
    [t.search.grpBookmarks, bmResults, "bm"],
    [t.search.grpRead, rlResults, "rl"],
    [t.search.grpHistory, histResults, "hi"],
  ].filter(([_, arr]) => arr.length > 0);

  let runningIdx = 0;

  return (
    <div className="tm-overlay" onClick={close}>
      <div className="tm-cmd" onClick={(e) => e.stopPropagation()}>
        <div className="tm-cmd-input">
          <IconSearch size={16}/>
          <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={onKey} placeholder={t.search.placeholderAll}/>
          <span className="tm-kbd">esc</span>
        </div>
        <div className="tm-cmd-results">
          {flat.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "var(--fg-3)" }}>{t.search.noResults}</div>
          ) : groups.map(([label, arr, kind]) => (
            <div key={label}>
              <div className="tm-cmd-group">{label}</div>
              {arr.map((it) => {
                const idx = runningIdx++;
                return (
                  <div key={`${kind}-${it.id || it.url}`}
                    className={`tm-cmd-row ${idx === sel ? "sel" : ""}`}
                    onMouseEnter={() => setSel(idx)}
                    onClick={() => { close(); setState((s) => ({ ...s, toast: { msg: `Opened ${it.title.slice(0, 40)}…` } })); }}>
                    <Favicon name={it.favicon} domain={it.domain} size={14}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="tm-tab-title">{it.title}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>{it.domain}{it.path ? ` · ${it.path}` : ""}</div>
                    </div>
                    {kind === "tab" && <IconExternal size={11}/>}
                    {kind === "hi" && <IconClock size={11}/>}
                    <span className="src">{it._src}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="tm-cmd-foot">
          <span><span className="kbd">↑↓</span> navigate</span>
          <span><span className="kbd">↵</span> open</span>
          <span><span className="kbd">@all</span> {t.search.allHint.split("@all").pop()}</span>
        </div>
      </div>
    </div>
  );
}

function SnapshotsModal({ state, setState, t }) {
  const close = () => setState((s) => ({ ...s, snapshotsOpen: false }));
  const [name, setName] = React.useState("");
  return (
    <div className="tm-overlay" onClick={close}>
      <div className="tm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tm-modal-hd">
          <h3><IconCamera size={14} style={{ marginRight: 6, verticalAlign: -2 }}/>{t.snapshots.title}</h3>
          <div className="sub">{t.snapshots.subtitle}</div>
        </div>
        <div className="tm-modal-body">
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input className="tm-search" style={{ flex: 1, padding: "0 12px", height: 32 }}>
            </input>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t.snapshots.placeholder}
              style={{ flex: 1, height: 32, padding: "0 12px", borderRadius: 6, border: "1px solid var(--border)",
                background: "var(--bg-sub)", color: "var(--fg)", outline: "none", fontFamily: "inherit", fontSize: 13 }}/>
            <button className="tm-btn primary" onClick={() => {
              if (!name.trim()) return;
              setState((s) => ({ ...s, snapshots: [{
                id: `s${Date.now()}`, name, createdAt: "Just now", count: state.tabs.length,
                groups: [...new Set(state.tabs.map((tab) => tab.group))],
              }, ...s.snapshots], toast: { msg: `Saved snapshot "${name}"` } }));
              setName("");
            }}><IconPlus size={11}/>{t.snapshots.save}</button>
          </div>
          <div>
            {state.snapshots.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: "var(--fg-3)" }}>{t.snapshots.empty}</div>
            ) : state.snapshots.map((sn) => (
              <div key={sn.id} style={{ display: "flex", alignItems: "center", gap: 12,
                padding: 12, borderBottom: "1px solid var(--border)" }}>
                <IconCamera size={14}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{sn.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)", marginTop: 2 }}>
                    {sn.createdAt} · {t.snapshots.count(sn.count)} · {sn.groups.join(", ")}
                  </div>
                </div>
                <button className="tm-btn sm">{t.snapshots.restore}</button>
                <button className="tm-btn ghost sm danger" onClick={() => setState((s) => ({
                  ...s, snapshots: s.snapshots.filter((x) => x.id !== sn.id),
                }))}><IconClose size={11}/></button>
              </div>
            ))}
          </div>
        </div>
        <div className="tm-modal-foot">
          <button className="tm-btn" onClick={close}>{t.common.close}</button>
        </div>
      </div>
    </div>
  );
}

function SmartSaveModal({ state, setState, t }) {
  const close = () => setState((s) => ({ ...s, smartSaveOpen: false }));
  const [tags, setTags] = React.useState(["docs", "react"]);
  const [tagInput, setTagInput] = React.useState("");
  const [folder, setFolder] = React.useState("f-dev");
  const [readLater, setReadLater] = React.useState(false);

  const folders = [
    { id: "f-dev", label: "Bookmarks Bar / Development", suggested: true },
    { id: "f-read", label: "Bookmarks Bar / Reading" },
    { id: "f-design", label: "Bookmarks Bar / Design Inspiration" },
    { id: "f-tools", label: "Bookmarks Bar / Tools" },
  ];

  return (
    <div className="tm-overlay" onClick={close}>
      <div className="tm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tm-modal-hd">
          <h3>{t.smartSave.title}</h3>
        </div>
        <div className="tm-modal-body">
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px",
            background: "var(--bg-sub)", borderRadius: 6, marginBottom: 16 }}>
            <Favicon name="github" domain="github.com" size={16}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>App Router: nested layouts losing state on navigation #68421</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)" }}>github.com/vercel/next.js/issues/68421</div>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-3)", marginBottom: 6 }}>
              {t.smartSave.folder}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {folders.map((f) => (
                <button key={f.id}
                  className={`tm-bm-folder ${folder === f.id ? "active" : ""}`}
                  onClick={() => setFolder(f.id)}>
                  <IconFolder size={12}/>
                  <span>{f.label}</span>
                  {f.suggested && <span className="tm-pill" style={{ marginLeft: "auto", background: "var(--accent-bg)", color: "var(--accent-fg)" }}>{t.smartSave.suggested}</span>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-3)", marginBottom: 6 }}>
              {t.smartSave.tags}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 8,
              background: "var(--bg-sub)", borderRadius: 6, minHeight: 36 }}>
              {tags.map((tag) => (
                <span key={tag} className="tm-pill tag" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {tag}
                  <button onClick={() => setTags(tags.filter((x) => x !== tag))}
                    style={{ border: 0, background: "transparent", padding: 0, color: "var(--fg-3)" }}>
                    <IconClose size={9}/>
                  </button>
                </span>
              ))}
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    setTags([...tags, tagInput.trim()]); setTagInput("");
                  }
                }}
                placeholder={t.smartSave.addTag}
                style={{ flex: 1, minWidth: 120, border: 0, background: "transparent", outline: "none", color: "var(--fg)", fontSize: 12 }}/>
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--fg-2)" }}>
            <span className={`tm-check ${readLater ? "checked" : ""}`} onClick={() => setReadLater(!readLater)}>
              <IconCheck size={9}/>
            </span>
            {t.smartSave.readLater}
          </label>
        </div>
        <div className="tm-modal-foot">
          <button className="tm-btn" onClick={close}>{t.smartSave.cancel}</button>
          <button className="tm-btn primary" onClick={() => {
            close();
            setState((s) => ({ ...s, toast: { msg: readLater ? "Added to reading list" : `Saved to ${folders.find((f) => f.id === folder)?.label}` } }));
          }}>{t.smartSave.save}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CommandPalette, SnapshotsModal, SmartSaveModal });
