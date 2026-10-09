import { defineConfig } from "vitepress";

export default defineConfig({
  title: "colspec",
  description: "JSON contracts for TanStack Table, hydrated at runtime.",
  themeConfig: {
    nav: [{ text: "Guide", link: "/guide/getting-started" }],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting started", link: "/guide/getting-started" },
          { text: "The contract", link: "/guide/contract" },
          { text: "Registries", link: "/guide/registries" },
          { text: "Server SDK", link: "/guide/server" },
          { text: "Client and server modes", link: "/guide/modes" },
        ],
      },
    ],
  },
});
