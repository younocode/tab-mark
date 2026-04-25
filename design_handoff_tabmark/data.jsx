// data.jsx — mock data for TabMark prototype

const MOCK_TABS = [
  // Development group
  { id: 1, group: "Development", url: "https://github.com/vercel/next.js/issues/68421", title: "App Router: nested layouts losing state on navigation #68421", domain: "github.com", favicon: "github" },
  { id: 2, group: "Development", url: "https://github.com/vercel/next.js/pull/68455", title: "fix: preserve scroll position in parallel routes", domain: "github.com", favicon: "github" },
  { id: 3, group: "Development", url: "https://stackoverflow.com/questions/78912334/typescript-conditional-types-with-mapped-keys", title: "TypeScript conditional types with mapped keys", domain: "stackoverflow.com", favicon: "stackoverflow" },
  { id: 4, group: "Development", url: "https://github.com/anthropics/claude-code", title: "anthropics/claude-code: Claude Code CLI", domain: "github.com", favicon: "github" },
  { id: 5, group: "Development", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/container-queries", title: "CSS Container Queries — MDN Web Docs", domain: "developer.mozilla.org", favicon: "mdn", hibernated: true },

  // Research group
  { id: 6, group: "Research", url: "https://arxiv.org/abs/2403.05530", title: "Gemini 1.5: Unlocking multimodal understanding across millions of tokens", domain: "arxiv.org", favicon: "arxiv" },
  { id: 7, group: "Research", url: "https://arxiv.org/abs/2401.04088", title: "Mixtral of Experts", domain: "arxiv.org", favicon: "arxiv" },
  { id: 8, group: "Research", url: "https://scholar.google.com/scholar?q=retrieval+augmented+generation", title: "retrieval augmented generation - Google Scholar", domain: "scholar.google.com", favicon: "scholar", hibernated: true },

  // Design group
  { id: 9, group: "Design", url: "https://www.figma.com/file/abc123/TabMark-Wireframes", title: "TabMark Wireframes – Figma", domain: "figma.com", favicon: "figma" },
  { id: 10, group: "Design", url: "https://www.figma.com/file/xyz789/Design-System-v3", title: "Design System v3 – Figma", domain: "figma.com", favicon: "figma" },
  { id: 11, group: "Design", url: "https://dribbble.com/shots/popular/web-design", title: "Popular Web Design Shots — Dribbble", domain: "dribbble.com", favicon: "dribbble" },

  // Docs group
  { id: 12, group: "Docs", url: "https://docs.google.com/document/d/1abc/edit", title: "Q2 Roadmap — Engineering", domain: "docs.google.com", favicon: "gdocs" },
  { id: 13, group: "Docs", url: "https://www.notion.so/team/TabMark-PRD-fb8c", title: "TabMark PRD — Product Wiki", domain: "notion.so", favicon: "notion" },
  { id: 14, group: "Docs", url: "https://linear.app/tabmark/issue/TM-142", title: "TM-142: Smart grouping rule engine — Linear", domain: "linear.app", favicon: "linear" },

  // Other (auto-grouped)
  { id: 15, group: "Other", url: "https://news.ycombinator.com/", title: "Hacker News", domain: "news.ycombinator.com", favicon: "hn" },
  { id: 16, group: "Other", url: "https://twitter.com/home", title: "Home / X", domain: "twitter.com", favicon: "twitter" },
  { id: 17, group: "Other", url: "https://mail.google.com/mail/u/0/#inbox", title: "Inbox (47) — your.name@gmail.com", domain: "mail.google.com", favicon: "gmail" },
];

const MOCK_TOP_SITES = [
  { url: "https://github.com", title: "GitHub", domain: "github.com", favicon: "github" },
  { url: "https://figma.com", title: "Figma", domain: "figma.com", favicon: "figma" },
  { url: "https://linear.app", title: "Linear", domain: "linear.app", favicon: "linear" },
  { url: "https://notion.so", title: "Notion", domain: "notion.so", favicon: "notion" },
  { url: "https://news.ycombinator.com", title: "HN", domain: "news.ycombinator.com", favicon: "hn" },
  { url: "https://arxiv.org", title: "arXiv", domain: "arxiv.org", favicon: "arxiv" },
  { url: "https://docs.google.com", title: "Docs", domain: "docs.google.com", favicon: "gdocs" },
  { url: "https://twitter.com", title: "X", domain: "twitter.com", favicon: "twitter" },
];

const MOCK_RECENTLY_CLOSED = [
  { id: "r1", url: "https://web.dev/articles/view-transitions", title: "View Transitions API — web.dev", domain: "web.dev", favicon: "webdev", closedAt: 2 },
  { id: "r2", url: "https://docs.google.com/spreadsheets/d/1xyz/edit", title: "Q2 OKRs — Spreadsheet", domain: "docs.google.com", favicon: "gsheets", closedAt: 14 },
  { id: "r3", url: "https://excalidraw.com/#room=abcd", title: "Architecture sketch — Excalidraw", domain: "excalidraw.com", favicon: "excalidraw", closedAt: 38 },
  { id: "r4", url: "https://news.ycombinator.com/item?id=39912334", title: "Show HN: A new way to manage tabs | Hacker News", domain: "news.ycombinator.com", favicon: "hn", closedAt: 52 },
  { id: "r5", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Tutorial: Building a Chrome extension with WXT", domain: "youtube.com", favicon: "youtube", closedAt: 84 },
];

const MOCK_BOOKMARK_TREE = [
  { id: "bb", title: "Bookmarks Bar", type: "folder", children: [
    { id: "f-dev", title: "Development", type: "folder", count: 24, children: [
      { id: "b1", type: "bookmark", title: "React Documentation", url: "https://react.dev", domain: "react.dev", favicon: "react", path: "Bookmarks Bar / Development", added: "2 weeks ago", tags: ["docs", "react"] },
      { id: "b2", type: "bookmark", title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", domain: "typescriptlang.org", favicon: "ts", path: "Bookmarks Bar / Development", added: "1 month ago", tags: ["docs", "typescript"] },
      { id: "b3", type: "bookmark", title: "Tailwind CSS — Rapidly build modern websites", url: "https://tailwindcss.com", domain: "tailwindcss.com", favicon: "tailwind", path: "Bookmarks Bar / Development", added: "3 weeks ago", tags: ["css"] },
      { id: "b4", type: "bookmark", title: "vercel/next.js: The React Framework", url: "https://github.com/vercel/next.js", domain: "github.com", favicon: "github", path: "Bookmarks Bar / Development", added: "5 days ago", tags: ["react", "framework"] },
      { id: "b5", type: "bookmark", title: "Chrome Extensions / Manifest V3", url: "https://developer.chrome.com/docs/extensions/mv3", domain: "developer.chrome.com", favicon: "chrome", path: "Bookmarks Bar / Development", added: "1 week ago", tags: ["chrome", "docs"] },
    ]},
    { id: "f-read", title: "Reading", type: "folder", count: 18, children: [
      { id: "b6", type: "bookmark", title: "The Grug Brained Developer", url: "https://grugbrain.dev", domain: "grugbrain.dev", favicon: "grug", path: "Bookmarks Bar / Reading", added: "2 months ago", tags: ["essay"] },
      { id: "b7", type: "bookmark", title: "How to Build Good Software — Li Hongyi", url: "https://www.csc.gov.sg/articles/how-to-build-good-software", domain: "csc.gov.sg", favicon: "generic", path: "Bookmarks Bar / Reading", added: "6 weeks ago", tags: ["essay", "engineering"] },
      { id: "b8", type: "bookmark", title: "Worse is Better — Richard P. Gabriel", url: "https://www.dreamsongs.com/RiseOfWorseIsBetter.html", domain: "dreamsongs.com", favicon: "generic", path: "Bookmarks Bar / Reading", added: "3 months ago", tags: ["essay"] },
    ]},
    { id: "f-design", title: "Design Inspiration", type: "folder", count: 31, children: [
      { id: "b9", type: "bookmark", title: "Linear — A better way to build products", url: "https://linear.app", domain: "linear.app", favicon: "linear", path: "Bookmarks Bar / Design Inspiration", added: "1 week ago", tags: ["inspiration", "saas"] },
      { id: "b10", type: "bookmark", title: "Raycast — The command bar for productivity", url: "https://raycast.com", domain: "raycast.com", favicon: "raycast", path: "Bookmarks Bar / Design Inspiration", added: "4 days ago", tags: ["inspiration", "tools"] },
      { id: "b11", type: "bookmark", title: "Vercel Geist Design System", url: "https://vercel.com/geist", domain: "vercel.com", favicon: "vercel", path: "Bookmarks Bar / Design Inspiration", added: "2 weeks ago", tags: ["design-system"] },
    ]},
    { id: "f-tools", title: "Tools", type: "folder", count: 12, children: [
      { id: "b12", type: "bookmark", title: "Figma", url: "https://figma.com", domain: "figma.com", favicon: "figma", path: "Bookmarks Bar / Tools", added: "6 months ago", tags: ["design"] },
      { id: "b13", type: "bookmark", title: "Excalidraw", url: "https://excalidraw.com", domain: "excalidraw.com", favicon: "excalidraw", path: "Bookmarks Bar / Tools", added: "4 months ago", tags: ["design"] },
      { id: "b14", type: "bookmark", title: "404 — This page no longer exists", url: "https://oldsite.example.com/blog/post-1", domain: "oldsite.example.com", favicon: "generic", path: "Bookmarks Bar / Tools", added: "2 years ago", tags: [], dead: true },
    ]},
  ]},
  { id: "other", title: "Other Bookmarks", type: "folder", count: 8, children: [
    { id: "b15", type: "bookmark", title: "Recipe: Sourdough", url: "https://example.com/recipe", domain: "example.com", favicon: "generic", path: "Other Bookmarks", added: "8 months ago", tags: ["personal"] },
  ]},
];

const MOCK_READING_LIST = [
  { id: "rl1", url: "https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/", title: "The Law of Leaky Abstractions", domain: "joelonsoftware.com", favicon: "generic", added: 3, read: false },
  { id: "rl2", url: "https://overreacted.io/things-i-dont-know-as-of-2018/", title: "Things I Don't Know as of 2018", domain: "overreacted.io", favicon: "overreacted", added: 5, read: false },
  { id: "rl3", url: "https://martinfowler.com/articles/feature-toggles.html", title: "Feature Toggles (aka Feature Flags) — Martin Fowler", domain: "martinfowler.com", favicon: "generic", added: 12, read: false },
  { id: "rl4", url: "https://blog.bytebytego.com/p/system-design-newsletter", title: "System Design Newsletter — ByteByteGo", domain: "bytebytego.com", favicon: "generic", added: 1, read: false },
  { id: "rl5", url: "https://danluu.com/programming-blogs/", title: "Programming blogs — Dan Luu", domain: "danluu.com", favicon: "generic", added: 18, read: true },
  { id: "rl6", url: "https://www.paulgraham.com/users.html", title: "The 18 Mistakes That Kill Startups", domain: "paulgraham.com", favicon: "generic", added: 25, read: true },
];

const MOCK_HISTORY = [
  { url: "https://chat.openai.com/", title: "ChatGPT", domain: "chat.openai.com", favicon: "openai", visited: "2 hours ago" },
  { url: "https://claude.ai/", title: "Claude", domain: "claude.ai", favicon: "claude", visited: "yesterday" },
  { url: "https://www.cursor.com/", title: "Cursor — The AI Code Editor", domain: "cursor.com", favicon: "cursor", visited: "yesterday" },
  { url: "https://posthog.com/blog/we-shipped-tabmark", title: "How we shipped TabMark in 6 weeks", domain: "posthog.com", favicon: "posthog", visited: "2 days ago" },
];

const MOCK_HEALTH = {
  dead: [
    { id: "h1", title: "404 — This page no longer exists", url: "https://oldsite.example.com/blog/post-1", domain: "oldsite.example.com", favicon: "generic", status: 404, path: "Bookmarks Bar / Tools" },
    { id: "h2", title: "Server Error", url: "https://defunct-startup.io/docs", domain: "defunct-startup.io", favicon: "generic", status: 500, path: "Bookmarks Bar / Reading" },
    { id: "h3", title: "Connection timeout", url: "https://verylongdomainname-thatdied.com/article", domain: "verylongdomainname-thatdied.com", favicon: "generic", status: "timeout", path: "Other Bookmarks" },
  ],
  duplicates: [
    { url: "https://react.dev", title: "React Documentation", domain: "react.dev", favicon: "react",
      copies: [
        { path: "Bookmarks Bar / Development", added: "2 weeks ago", keep: true },
        { path: "Bookmarks Bar / Reading", added: "8 months ago", keep: false },
        { path: "Other Bookmarks", added: "1 year ago", keep: false },
      ]},
    { url: "https://figma.com", title: "Figma", domain: "figma.com", favicon: "figma",
      copies: [
        { path: "Bookmarks Bar / Tools", added: "6 months ago", keep: true },
        { path: "Bookmarks Bar / Design Inspiration", added: "1 year ago", keep: false },
      ]},
  ],
};

const MOCK_SNAPSHOTS = [
  { id: "s1", name: "Monday morning — TabMark sprint", createdAt: "Apr 22, 9:14 AM", count: 17, groups: ["Development", "Design", "Docs"] },
  { id: "s2", name: "Paper reading session", createdAt: "Apr 18, 8:02 PM", count: 11, groups: ["Research"] },
  { id: "s3", name: "Friday wind-down", createdAt: "Apr 11, 5:48 PM", count: 9, groups: ["Other"] },
];

const ALL_TAGS = ["docs", "react", "typescript", "css", "chrome", "essay", "engineering", "inspiration", "saas", "tools", "design-system", "design", "framework", "personal"];

Object.assign(window, {
  MOCK_TABS, MOCK_TOP_SITES, MOCK_RECENTLY_CLOSED,
  MOCK_BOOKMARK_TREE, MOCK_READING_LIST, MOCK_HISTORY,
  MOCK_HEALTH, MOCK_SNAPSHOTS, ALL_TAGS,
});
