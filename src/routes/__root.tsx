import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AnalyticsInject } from "@/components/site/AnalyticsInject";
import { CookieConsent } from "@/components/site/CookieConsent";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import { getPublicAnalyticsFn } from "@/lib/cms/cms.functions";
import { resolveFooterBadges } from "@/lib/site/footerBadge";
import { resolveSocialLinks } from "@/lib/site/organization";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <div className="max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#0a1a4a] sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          That URL doesn’t exist — or it may have moved. Try one of these pages instead.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[#0a1a4a] px-4 py-2 text-sm font-semibold text-white"
          >
            Home
          </Link>
          <Link
            to="/restaurant-pos"
            className="inline-flex items-center justify-center rounded-full border border-[#61c3ec]/40 px-4 py-2 text-sm font-semibold text-[#0a1a4a]"
          >
            Restaurant POS
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center rounded-full border border-[#61c3ec]/40 px-4 py-2 text-sm font-semibold text-[#0a1a4a]"
          >
            Pricing
          </Link>
          <Link
            to="/contact"
            search={{}}
            className="inline-flex items-center justify-center rounded-full border border-[#61c3ec]/40 px-4 py-2 text-sm font-semibold text-[#0a1a4a]"
          >
            Contact
          </Link>
          <Link
            to="/faq"
            className="inline-flex items-center justify-center rounded-full border border-[#61c3ec]/40 px-4 py-2 text-sm font-semibold text-[#0a1a4a]"
          >
            FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: () => getPublicAnalyticsFn(),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "OrderWeb" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const analytics = Route.useLoaderData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname === "/owadmin" || pathname.startsWith("/owadmin/");

  return (
    <QueryClientProvider client={queryClient}>
      {!isAdmin ? (
        <AnalyticsInject
          gaMeasurementId={analytics?.analyticsGaMeasurementId ?? ""}
          gtmId={analytics?.analyticsGtmId ?? ""}
          metaPixelId={analytics?.analyticsMetaPixelId ?? ""}
          clarityId={analytics?.analyticsClarityId ?? ""}
          googleSiteVerification={analytics?.seoGoogleSiteVerification ?? ""}
          bingSiteVerification={analytics?.seoBingSiteVerification ?? ""}
          customHeadHtml={analytics?.analyticsCustomHeadHtml ?? ""}
        />
      ) : null}
      {!isAdmin && <SiteNav />}
      <main>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </main>
      {!isAdmin && (
        <SiteFooter
          socialLinks={resolveSocialLinks({
            facebook: analytics?.socialFacebook,
            instagram: analytics?.socialInstagram,
            youtube: analytics?.socialYoutube,
            x: analytics?.socialX,
          })}
          footerBadges={resolveFooterBadges(analytics)}
        />
      )}
      {!isAdmin ? <CookieConsent /> : null}
      <Toaster />
    </QueryClientProvider>
  );
}
