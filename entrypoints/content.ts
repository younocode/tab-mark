export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  main() {
    let overlayRoot: HTMLDivElement | null = null;
    let shadowRoot: ShadowRoot | null = null;

    function createOverlay() {
      if (overlayRoot) return;
      overlayRoot = document.createElement("div");
      overlayRoot.id = "tabmark-root";
      shadowRoot = overlayRoot.attachShadow({ mode: "closed" });
      document.body.appendChild(overlayRoot);
    }

    function showSearch() {
      createOverlay();
      if (!shadowRoot) return;
      shadowRoot.innerHTML = `
        <style>
          .tm-cs-overlay { position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;font-family:-apple-system,system-ui,sans-serif;font-size:14px;color:#222; }
          .tm-cs-box { width:560px;max-width:90vw;background:#fff;border-radius:12px;box-shadow:0 24px 60px rgba(0,0,0,0.25);overflow:hidden; }
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
          @media(prefers-color-scheme:dark){
            .tm-cs-overlay{background:rgba(0,0,0,0.6)}
            .tm-cs-box{background:#1e1e1e;color:#e5e5e5;box-shadow:0 24px 60px rgba(0,0,0,0.5)}
            .tm-cs-input{border-bottom-color:#333}
            .tm-cs-input input{color:#e5e5e5}
            .tm-cs-input input::placeholder{color:#666}
            .tm-cs-row:hover,.tm-cs-row.sel{background:#2a2a2a}
            .tm-cs-src{background:#333;color:#888}
          }
        </style>
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

      input.addEventListener("input", async () => {
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
                <span class="tm-cs-title">${escapeHtml(r.title)}</span>
                <span class="tm-cs-domain">${escapeHtml(getDomain(r.url))}</span>
                <span class="tm-cs-src">${escapeHtml(r.source)}</span>
              </div>`,
          )
          .join("");
        resultsEl.querySelectorAll(".tm-cs-row").forEach((row) => {
          row.addEventListener("click", () => {
            const idx = parseInt((row as HTMLElement).dataset.idx || "0");
            if (results[idx]) {
              chrome.runtime.sendMessage({
                type: "OPEN_URL",
                url: results[idx].url,
              });
              close();
            }
          });
        });
      }

      function close() {
        if (overlayRoot) {
          overlayRoot.remove();
          overlayRoot = null;
          shadowRoot = null;
        }
      }
    }

    function getDomain(url: string): string {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    }

    function escapeHtml(s: string): string {
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
    });
  },
});
