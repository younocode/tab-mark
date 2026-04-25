export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  main() {
    let overlayRoot: HTMLDivElement | null = null;
    let shadowRoot: ShadowRoot | null = null;

    function createOverlay() {
      if (overlayRoot) {
        overlayRoot.remove();
        overlayRoot = null;
        shadowRoot = null;
      }
      overlayRoot = document.createElement("div");
      overlayRoot.id = "tabmark-root";
      shadowRoot = overlayRoot.attachShadow({ mode: "closed" });
      document.body.appendChild(overlayRoot);
    }

    function close() {
      if (overlayRoot) {
        overlayRoot.remove();
        overlayRoot = null;
        shadowRoot = null;
      }
    }

    const SHARED_STYLES = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .tm-cs-overlay { position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;font-family:-apple-system,system-ui,sans-serif;font-size:14px;color:#222; }
      .tm-cs-box { width:560px;max-width:90vw;background:#fff;border-radius:12px;box-shadow:0 24px 60px rgba(0,0,0,0.25);overflow:hidden; }
      .tm-cs-header { padding:14px 18px;border-bottom:1px solid #e5e5e5; }
      .tm-cs-header h3 { font-size:14px;font-weight:600; }
      .tm-cs-header .sub { font-size:11.5px;color:#888;margin-top:2px; }
      .tm-cs-body { padding:18px; }
      .tm-cs-footer { display:flex;gap:8px;justify-content:flex-end;padding:12px 18px;border-top:1px solid #e5e5e5;background:#f9f9f9;border-radius:0 0 12px 12px; }
      .tm-cs-input { display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #e5e5e5; }
      .tm-cs-input input { flex:1;border:0;background:transparent;outline:none;font-size:15px;color:#222; }
      .tm-cs-input input::placeholder { color:#999; }
      .tm-cs-results { max-height:400px;overflow-y:auto;padding:6px; }
      .tm-cs-row { display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:6px;cursor:pointer; }
      .tm-cs-row:hover,.tm-cs-row.sel { background:#f0f0f0; }
      .tm-cs-title { flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px; }
      .tm-cs-domain { font-family:monospace;font-size:11px;color:#888; }
      .tm-cs-src { font-family:monospace;font-size:10px;padding:1px 6px;border-radius:3px;background:#f5f5f5;color:#888; }
      .tm-cs-empty { padding:30px;text-align:center;color:#999; }
      .tm-cs-btn { display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border:1px solid #ddd;background:#fff;color:#555;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit; }
      .tm-cs-btn:hover { background:#f5f5f5;border-color:#ccc; }
      .tm-cs-btn.primary { background:#d49a3a;color:#fff;border-color:#c08830; }
      .tm-cs-btn.primary:hover { background:#c08830; }
      .tm-cs-folder { display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:5px;font-size:12.5px;color:#555;border:0;background:transparent;width:100%;text-align:left;cursor:pointer; }
      .tm-cs-folder:hover { background:#f0f0f0; }
      .tm-cs-folder.active { background:#eee;color:#222;font-weight:500; }
      .tm-cs-label { font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin-bottom:6px; }
      .tm-cs-preview { display:flex;gap:10px;align-items:center;padding:10px 12px;background:#f5f5f5;border-radius:6px;margin-bottom:16px; }
      .tm-cs-preview .title { font-size:13px;font-weight:500; }
      .tm-cs-preview .url { font-family:monospace;font-size:11px;color:#888; }
      @media(prefers-color-scheme:dark){
        .tm-cs-overlay{background:rgba(0,0,0,0.6)}
        .tm-cs-box{background:#1e1e1e;color:#e5e5e5;box-shadow:0 24px 60px rgba(0,0,0,0.5)}
        .tm-cs-header{border-bottom-color:#333}
        .tm-cs-input{border-bottom-color:#333}
        .tm-cs-input input{color:#e5e5e5}
        .tm-cs-input input::placeholder{color:#666}
        .tm-cs-row:hover,.tm-cs-row.sel{background:#2a2a2a}
        .tm-cs-src{background:#333;color:#888}
        .tm-cs-footer{background:#161616;border-top-color:#333}
        .tm-cs-btn{background:#2a2a2a;color:#ccc;border-color:#444}
        .tm-cs-btn:hover{background:#333}
        .tm-cs-btn.primary{background:#d49a3a;color:#fff;border-color:#c08830}
        .tm-cs-folder:hover{background:#2a2a2a}
        .tm-cs-folder.active{background:#333;color:#e5e5e5}
        .tm-cs-preview{background:#2a2a2a}
      }
    `;

    function showSearch() {
      createOverlay();
      if (!shadowRoot) return;
      shadowRoot.innerHTML = `
        <style>${SHARED_STYLES}</style>
        <div class="tm-cs-overlay" id="cs-overlay">
          <div class="tm-cs-box">
            <div class="tm-cs-input">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M14 14l-3.7-3.7"/></svg>
              <input id="cs-input" placeholder="Search tabs, bookmarks…" autocomplete="off"/>
            </div>
            <div class="tm-cs-results" id="cs-results">
              <div class="tm-cs-empty">Type to search</div>
            </div>
          </div>
        </div>
      `;

      const input = shadowRoot.getElementById("cs-input") as HTMLInputElement;
      const resultsEl = shadowRoot.getElementById("cs-results")!;
      const overlay = shadowRoot.getElementById("cs-overlay")!;

      input.focus();

      let sel = 0;
      let results: { title: string; url: string; source: string }[] = [];

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
      });

      let debounceTimer: ReturnType<typeof setTimeout>;
      input.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          const q = input.value.trim();
          if (!q) {
            resultsEl.innerHTML = '<div class="tm-cs-empty">Type to search</div>';
            results = [];
            return;
          }
          const resp = await chrome.runtime.sendMessage({
            type: "SEARCH",
            query: q,
          });
          results = resp || [];
          sel = 0;
          renderResults();
        }, 150);
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          close();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          sel = Math.min(results.length - 1, sel + 1);
          renderResults();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          sel = Math.max(0, sel - 1);
          renderResults();
        } else if (e.key === "Enter" && results[sel]) {
          chrome.runtime.sendMessage({
            type: "OPEN_URL",
            url: results[sel].url,
          });
          close();
        }
      });

      function renderResults() {
        if (results.length === 0) {
          resultsEl.innerHTML = '<div class="tm-cs-empty">No results</div>';
          return;
        }
        resultsEl.innerHTML = results
          .map(
            (r, i) =>
              `<div class="tm-cs-row${i === sel ? " sel" : ""}" data-idx="${i}">
                <span class="tm-cs-title">${esc(r.title)}</span>
                <span class="tm-cs-domain">${esc(getDomain(r.url))}</span>
                <span class="tm-cs-src">${esc(r.source)}</span>
              </div>`,
          )
          .join("");
        resultsEl.querySelectorAll(".tm-cs-row").forEach((row) => {
          row.addEventListener("click", () => {
            const idx = parseInt((row as HTMLElement).dataset.idx || "0");
            if (results[idx]) {
              chrome.runtime.sendMessage({ type: "OPEN_URL", url: results[idx].url });
              close();
            }
          });
        });
      }
    }

    async function showSmartSave() {
      createOverlay();
      if (!shadowRoot) return;

      const pageTitle = document.title;
      const pageUrl = location.href;
      const domain = getDomain(pageUrl);

      const folders: { id: string; title: string }[] =
        await chrome.runtime.sendMessage({ type: "GET_FOLDERS" });

      let selectedFolder = folders[0]?.id || "";

      shadowRoot.innerHTML = `
        <style>${SHARED_STYLES}</style>
        <div class="tm-cs-overlay" id="ss-overlay">
          <div class="tm-cs-box">
            <div class="tm-cs-header">
              <h3>Save bookmark</h3>
            </div>
            <div class="tm-cs-body">
              <div class="tm-cs-preview">
                <div style="flex:1;min-width:0">
                  <div class="title">${esc(pageTitle)}</div>
                  <div class="url">${esc(domain)} — ${esc(pageUrl.slice(0, 60))}</div>
                </div>
              </div>
              <div class="tm-cs-label">Folder</div>
              <div id="ss-folders" style="max-height:200px;overflow-y:auto;margin-bottom:16px">
                ${folders
                  .map(
                    (f) =>
                      `<button class="tm-cs-folder${f.id === selectedFolder ? " active" : ""}" data-id="${esc(f.id)}">📁 ${esc(f.title)}</button>`,
                  )
                  .join("")}
              </div>
            </div>
            <div class="tm-cs-footer">
              <button class="tm-cs-btn" id="ss-cancel">Cancel</button>
              <button class="tm-cs-btn primary" id="ss-save">Save</button>
            </div>
          </div>
        </div>
      `;

      const overlay = shadowRoot.getElementById("ss-overlay")!;
      const foldersEl = shadowRoot.getElementById("ss-folders")!;
      const cancelBtn = shadowRoot.getElementById("ss-cancel")!;
      const saveBtn = shadowRoot.getElementById("ss-save")!;

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
      });
      cancelBtn.addEventListener("click", close);

      foldersEl.querySelectorAll(".tm-cs-folder").forEach((btn) => {
        btn.addEventListener("click", () => {
          selectedFolder = (btn as HTMLElement).dataset.id || "";
          foldersEl.querySelectorAll(".tm-cs-folder").forEach((b) =>
            b.classList.remove("active"),
          );
          btn.classList.add("active");
        });
      });

      saveBtn.addEventListener("click", async () => {
        await chrome.runtime.sendMessage({
          type: "SAVE_BOOKMARK",
          title: pageTitle,
          url: pageUrl,
          parentId: selectedFolder,
        });
        close();
      });
    }

    function getDomain(url: string): string {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    }

    function esc(s: string): string {
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    document.addEventListener("keydown", (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        showSearch();
      }
      if (meta && !e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        showSmartSave();
      }
    });
  },
});
