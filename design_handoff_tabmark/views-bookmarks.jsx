// views-bookmarks.jsx — Bookmarks view

function flattenBookmarks(tree) {
  const out = [];
  const walk = (nodes, parentPath = "") => {
    nodes.forEach((n) => {
      if (n.type === "folder" && n.children) {
        const p = parentPath ? `${parentPath} / ${n.title}` : n.title;
        walk(n.children, p);
      } else if (n.type === "bookmark") {
        out.push(n);
      }
    });
  };
  walk(tree);
  return out;
}

function getFolderById(tree, id) {
  if (!id || id === "all") return null;
  const find = (nodes) => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const r = find(n.children);
        if (r) return r;
      }
    }
    return null;
  };
  return find(tree);
}

function FolderTree({ tree, current, onSelect, depth = 0 }) {
  return (
    <>
      {tree.map((node) => {
        if (node.type !== "folder") return null;
        return (
          <div key={node.id}>
            <button
              className={`tm-bm-folder ${current === node.id ? "active" : ""}`}
              style={{ paddingLeft: 8 + depth * 14 }}
              onClick={() => onSelect(node.id)}
            >
              <IconFolder size={12}/>
              <span>{node.title}</span>
              {node.count != null && <span className="count">{node.count}</span>}
            </button>
            {node.children && <FolderTree tree={node.children} current={current} onSelect={onSelect} depth={depth + 1}/>}
          </div>
        );
      })}
    </>
  );
}

function BookmarksView({ state, setState, t, tweaks }) {
  const { bookmarkTree, query, currentFolder, viewMode, selectedTags, selectedBookmarks } = state;
  const q = query.replace(/^@all\s*/i, "").trim();

  const allBookmarks = React.useMemo(() => flattenBookmarks(bookmarkTree), [bookmarkTree]);
  const folder = getFolderById(bookmarkTree, currentFolder);
  let pool = currentFolder === "all" || !folder ? allBookmarks
    : (folder.children || []).filter((n) => n.type === "bookmark");

  if (selectedTags.length > 0) {
    pool = pool.filter((b) => selectedTags.every((tag) => (b.tags || []).includes(tag)));
  }

  const filtered = !q ? pool : pool.filter((b) =>
    b.title.toLowerCase().includes(q.toLowerCase()) ||
    b.url.toLowerCase().includes(q.toLowerCase()) ||
    (b.path || "").toLowerCase().includes(q.toLowerCase()) ||
    (b.tags || []).some((tag) => tag.toLowerCase().includes(q.toLowerCase()))
  );

  const toggleSelect = (id) => setState((s) => ({
    ...s, selectedBookmarks: s.selectedBookmarks.includes(id)
      ? s.selectedBookmarks.filter((x) => x !== id)
      : [...s.selectedBookmarks, id],
  }));

  const toggleTag = (tag) => setState((s) => ({
    ...s, selectedTags: s.selectedTags.includes(tag)
      ? s.selectedTags.filter((x) => x !== tag) : [...s.selectedTags, tag],
  }));

  return (
    <div className="tm-content bookmarks">
      <aside className="tm-bm-side">
        <button className={`tm-bm-folder ${currentFolder === "all" ? "active" : ""}`}
          onClick={() => setState((s) => ({ ...s, currentFolder: "all" }))}>
          <IconBookmark size={12}/>
          <span>{t.bookmarks.all}</span>
          <span className="count">{allBookmarks.length}</span>
        </button>
        <h4>{t.bookmarks.folders}</h4>
        <FolderTree tree={bookmarkTree} current={currentFolder}
          onSelect={(id) => setState((s) => ({ ...s, currentFolder: id }))}/>
        <h4>{t.bookmarks.tags}</h4>
        <div className="tm-bm-tags">
          {ALL_TAGS.slice(0, 12).map((tag) => (
            <button key={tag}
              className={`tag-chip ${selectedTags.includes(tag) ? "active" : ""}`}
              onClick={() => toggleTag(tag)}>{tag}</button>
          ))}
        </div>
      </aside>
      <main className="tm-bm-main">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {currentFolder === "all" ? t.bookmarks.all : folder?.title}
          </h2>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--fg-3)" }}>
            {t.bookmarks.count(filtered.length)}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <div className="tm-segmented">
              <button className={viewMode === "list" ? "active" : ""}
                onClick={() => setState((s) => ({ ...s, viewMode: "list" }))}>{t.bookmarks.list}</button>
              <button className={viewMode === "grid" ? "active" : ""}
                onClick={() => setState((s) => ({ ...s, viewMode: "grid" }))}>{t.bookmarks.grid}</button>
            </div>
          </div>
        </div>

        {selectedBookmarks.length > 0 && (
          <div className="tm-batch">
            <span className="count">{t.bookmarks.selected(selectedBookmarks.length)}</span>
            <button className="tm-btn sm"><IconTag size={11}/> {t.bookmarks.addTag}</button>
            <button className="tm-btn sm"><IconFolder size={11}/> {t.bookmarks.move}</button>
            <button className="tm-btn sm danger"><IconClose size={11}/> {t.bookmarks.remove}</button>
            <button className="tm-btn ghost sm" style={{ marginLeft: "auto" }}
              onClick={() => setState((s) => ({ ...s, selectedBookmarks: [] }))}>{t.common.close}</button>
          </div>
        )}

        {viewMode === "list" ? (
          <div className="tm-bm-list">
            {filtered.map((b) => (
              <div key={b.id}
                className={`tm-bm-row ${selectedBookmarks.includes(b.id) ? "selected" : ""} ${b.dead ? "dead" : ""}`}
                onClick={() => toggleSelect(b.id)}>
                <span className={`tm-check ${selectedBookmarks.includes(b.id) ? "checked" : ""}`}>
                  <IconCheck size={9}/>
                </span>
                <Favicon name={b.favicon} domain={b.domain} size={14}/>
                <div style={{ minWidth: 0 }}>
                  <div className="b-title">{highlight(b.title, q)}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 2 }}>
                    <span className="b-domain">{b.domain}</span>
                    <span style={{ fontSize: 11, color: "var(--fg-4)" }}>{t.bookmarks.path} {b.path}</span>
                    <div className="b-tags">{(b.tags || []).map((tag) => <span key={tag} className="tm-pill tag">{tag}</span>)}</div>
                  </div>
                </div>
                <span className="b-meta">{b.added}</span>
                <div className="b-actions">
                  <button className="tm-btn ghost icon sm"><IconTag size={11}/></button>
                  <button className="tm-btn ghost icon sm"><IconExternal size={11}/></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tm-bm-grid">
            {filtered.map((b) => (
              <div key={b.id} className="tm-bm-card">
                <div className="top">
                  <Favicon name={b.favicon} domain={b.domain} size={16}/>
                  <span className="b-domain" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)" }}>{b.domain}</span>
                  <span className="b-meta" style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-4)" }}>{b.added}</span>
                </div>
                <div className="b-title">{highlight(b.title, q)}</div>
                <div className="b-tags" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(b.tags || []).map((tag) => <span key={tag} className="tm-pill tag">{tag}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--fg-3)" }}>
            {q ? t.search.noResults : t.empty.bookmarks}
          </div>
        )}
      </main>
    </div>
  );
}

Object.assign(window, { BookmarksView, flattenBookmarks });
