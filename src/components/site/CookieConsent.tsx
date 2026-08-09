import { useEffect, useState, useSyncExternalStore } from "react";
import {
  COOKIE_SETTINGS_EVENT,
  acceptAllCookieConsent,
  getCookieConsentServerSnapshot,
  getCookieConsentSnapshot,
  rejectNonEssentialCookieConsent,
  subscribeCookieConsent,
  writeCookieConsent,
} from "@/lib/site/cookieConsent";

export function CookieConsent() {
  const consent = useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsentSnapshot,
    getCookieConsentServerSnapshot,
  );
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onOpen = () => {
      const current = getCookieConsentSnapshot();
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setSettingsOpen(true);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (settingsOpen) {
      setAnalytics(consent?.analytics ?? false);
      setMarketing(consent?.marketing ?? false);
    }
  }, [settingsOpen, consent]);

  if (!mounted) return null;

  const showBanner = !consent && !settingsOpen;

  return (
    <>
      {showBanner ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[90] border-t border-[#61c3ec]/30 bg-white/95 px-4 py-4 shadow-[0_-16px_40px_-28px_rgba(10,26,74,0.45)] backdrop-blur-md sm:px-6 sm:py-5"
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-[family-name:var(--font-display)] text-xl text-[#0a1a4a] sm:text-2xl">
                Cookies on this site
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#243447]">
                We use strictly necessary cookies to run the site. Optional analytics and marketing
                cookies are off until you choose. Read our{" "}
                <a
                  href="https://orderweb.co.uk/cookies"
                  className="font-medium text-[#2f6fb8] underline-offset-2 hover:underline"
                >
                  Cookie Policy
                </a>{" "}
                for details.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                className="h-11 rounded-full border border-[#61c3ec]/40 bg-white px-5 text-sm font-semibold text-[#0a1a4a] transition hover:border-[#2f6fb8]"
                onClick={() => setSettingsOpen(true)}
              >
                Cookie settings
              </button>
              <button
                type="button"
                className="h-11 rounded-full border border-[#61c3ec]/40 bg-white px-5 text-sm font-semibold text-[#0a1a4a] transition hover:border-[#2f6fb8]"
                onClick={() => rejectNonEssentialCookieConsent()}
              >
                Reject non-essential
              </button>
              <button
                type="button"
                className="btn-brand-gradient h-11 rounded-full px-5 text-sm font-semibold text-white"
                onClick={() => acceptAllCookieConsent()}
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0a1a4a]/40 p-4 sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSettingsOpen(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#61c3ec]/30 bg-white p-5 shadow-[0_24px_60px_-28px_rgba(10,26,74,0.55)] sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="cookie-settings-title"
                  className="font-[family-name:var(--font-display)] text-2xl text-[#0a1a4a]"
                >
                  Cookie settings
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#243447]">
                  Choose which optional cookies we may use. Strictly necessary cookies stay on so
                  the site works. See the{" "}
                  <a
                    href="https://orderweb.co.uk/cookies"
                    className="font-medium text-[#2f6fb8] underline-offset-2 hover:underline"
                    onClick={() => setSettingsOpen(false)}
                  >
                    Cookie Policy
                  </a>
                  .
                </p>
              </div>
              <button
                type="button"
                className="rounded-full px-2 py-1 text-sm font-semibold text-[#5b6b7c] hover:bg-[#f3f9fc]"
                aria-label="Close cookie settings"
                onClick={() => setSettingsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <CategoryRow
                title="Strictly necessary"
                description="Security, basic site function, and remembering your cookie choice."
                alwaysOn
                enabled
              />
              <CategoryRow
                title="Analytics"
                description="Helps us understand site use and performance (for example Google Analytics or Clarity)."
                enabled={analytics}
                onChange={setAnalytics}
              />
              <CategoryRow
                title="Marketing"
                description="Used for advertising measurement or similar tools (for example Meta Pixel) when enabled."
                enabled={marketing}
                onChange={setMarketing}
              />
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="h-11 rounded-full border border-[#61c3ec]/40 bg-white px-5 text-sm font-semibold text-[#0a1a4a]"
                onClick={() => {
                  rejectNonEssentialCookieConsent();
                  setSettingsOpen(false);
                }}
              >
                Reject non-essential
              </button>
              <button
                type="button"
                className="btn-brand-gradient h-11 rounded-full px-5 text-sm font-semibold text-white"
                onClick={() => {
                  writeCookieConsent({ analytics, marketing });
                  setSettingsOpen(false);
                }}
              >
                Save choices
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CategoryRow({
  title,
  description,
  enabled,
  alwaysOn,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  alwaysOn?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-[#61c3ec]/25 bg-[#f8fbfd] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#0a1a4a]">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#5b6b7c]">{description}</p>
        </div>
        {alwaysOn ? (
          <span className="shrink-0 rounded-full bg-[#e8f2fb] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#2f6fb8]">
            Always on
          </span>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={`${title} cookies`}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
              enabled ? "bg-[#2f6fb8]" : "bg-[#c5d3e0]"
            }`}
            onClick={() => onChange?.(!enabled)}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                enabled ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
