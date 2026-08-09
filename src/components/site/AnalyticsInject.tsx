import { useEffect, useSyncExternalStore } from "react";
import {
  getCookieConsentServerSnapshot,
  getCookieConsentSnapshot,
  subscribeCookieConsent,
} from "@/lib/site/cookieConsent";

function isGaId(id: string) {
  return /^G-[A-Z0-9]+$/i.test(id.trim());
}

function isGtmId(id: string) {
  return /^GTM-[A-Z0-9]+$/i.test(id.trim());
}

function appendMeta(name: string, content: string, added: Node[]) {
  if (!content.trim()) return;
  const meta = document.createElement("meta");
  meta.setAttribute("name", name);
  meta.setAttribute("content", content.trim());
  document.head.appendChild(meta);
  added.push(meta);
}

function appendScript(src: string | null, text: string | null, added: Node[]) {
  const script = document.createElement("script");
  if (src) {
    script.async = true;
    script.src = src;
  }
  if (text) script.text = text;
  document.head.appendChild(script);
  added.push(script);
}

/** Injects SEO verification always; analytics/marketing only after cookie consent. */
export function AnalyticsInject({
  gaMeasurementId,
  gtmId,
  metaPixelId,
  clarityId,
  googleSiteVerification,
  bingSiteVerification,
  customHeadHtml,
}: {
  gaMeasurementId: string;
  gtmId: string;
  metaPixelId: string;
  clarityId: string;
  googleSiteVerification: string;
  bingSiteVerification: string;
  customHeadHtml: string;
}) {
  const consent = useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsentSnapshot,
    getCookieConsentServerSnapshot,
  );
  const allowAnalytics = Boolean(consent?.analytics);
  const allowMarketing = Boolean(consent?.marketing);

  useEffect(() => {
    const added: Node[] = [];

    // Search-engine verification is not a tracking cookie — keep ungated.
    appendMeta("google-site-verification", googleSiteVerification, added);
    appendMeta("msvalidate.01", bingSiteVerification, added);

    if (allowAnalytics) {
      const gtm = gtmId.trim();
      if (gtm && isGtmId(gtm)) {
        appendScript(
          null,
          `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`,
          added,
        );
        const noscript = document.createElement("noscript");
        noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtm}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.prepend(noscript);
        added.push(noscript);
      }

      const gaId = gaMeasurementId.trim();
      if (gaId && isGaId(gaId)) {
        appendScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, null, added);
        appendScript(
          null,
          `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
          added,
        );
      }

      const clarity = clarityId.trim();
      if (clarity && /^[a-z0-9]+$/i.test(clarity)) {
        appendScript(
          null,
          `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`,
          added,
        );
      }

      const html = customHeadHtml.trim();
      if (html) {
        const holder = document.createElement("div");
        holder.innerHTML = html;
        for (const node of [...holder.childNodes]) {
          if (node.nodeName === "SCRIPT") {
            const source = node as HTMLScriptElement;
            const script = document.createElement("script");
            for (const attr of source.attributes) {
              script.setAttribute(attr.name, attr.value);
            }
            script.text = source.textContent ?? "";
            document.head.appendChild(script);
            added.push(script);
          } else {
            document.head.appendChild(node);
            added.push(node);
          }
        }
      }
    }

    if (allowMarketing) {
      const pixel = metaPixelId.trim();
      if (pixel && /^\d+$/.test(pixel)) {
        appendScript(
          null,
          `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`,
          added,
        );
      }
    }

    return () => {
      for (const node of added) {
        node.parentNode?.removeChild(node);
      }
    };
  }, [
    allowAnalytics,
    allowMarketing,
    gaMeasurementId,
    gtmId,
    metaPixelId,
    clarityId,
    googleSiteVerification,
    bingSiteVerification,
    customHeadHtml,
  ]);

  return null;
}
