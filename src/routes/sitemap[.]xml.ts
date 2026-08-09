import { createFileRoute } from "@tanstack/react-router";
import { sitemapResponse } from "@/lib/site/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => sitemapResponse(),
    },
  },
});
