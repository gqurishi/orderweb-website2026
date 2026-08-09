import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old /services URL → Software page */
export const Route = createFileRoute("/services")({
  beforeLoad: () => {
    throw redirect({ to: "/software" });
  },
});
