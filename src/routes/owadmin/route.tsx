import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/owadmin")({
  head: () => ({
    meta: [
      { title: "OrderWeb Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <Outlet />,
});
