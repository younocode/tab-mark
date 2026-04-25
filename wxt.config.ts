import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "TabMark",
    description:
      "Unify tabs, bookmarks, and reading list into one beautiful new tab page",
    icons: {
      16: "icon/16.svg",
      48: "icon/48.svg",
      128: "icon/128.svg",
    },
    permissions: [
      "bookmarks",
      "tabs",
      "tabGroups",
      "favicon",
      "storage",
      "sessions",
      "topSites",
    ],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
