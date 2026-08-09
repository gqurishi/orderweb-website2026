import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old /custom-website URL → /website */
export const Route = createFileRoute("/custom-website")({
  beforeLoad: () => {
    throw redirect({ to: "/website" });
  },
});
