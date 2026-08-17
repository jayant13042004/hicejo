"use client";

import * as React from "react";
import Script from "next/script";
import posthog from "posthog-js";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  React.useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (posthogKey && posthogKey !== "placeholder-posthog-key" && !posthogKey.includes("XXXX")) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: "identified_only", // standard recommended config
        capture_pageview: true,
        loaded: (ph) => {
          if (process.env.NODE_ENV === "development") ph.debug();
        }
      });
    }
  }, []);

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      {/* Google Analytics Script (Only injected if key is set in production) */}
      {gaId && gaId !== "placeholder-ga-id" && !gaId.includes("XXXX") && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
      {children}
    </>
  );
}
