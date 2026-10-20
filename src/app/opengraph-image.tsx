import { ImageResponse } from "next/og";

export const alt = "Hicejo — The Career Copilot for Ambitious Tech Professionals";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#080a0f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle grid accent */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "26px",
              fontWeight: 900,
            }}
          >
            H
          </div>
          <span
            style={{
              fontSize: "32px",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#ffffff",
            }}
          >
            Hicejo
          </span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              background: "rgba(37, 99, 235, 0.2)",
              color: "#60a5fa",
              padding: "4px 12px",
              borderRadius: "9999px",
              border: "1px solid rgba(59, 130, 246, 0.4)",
            }}
          >
            CAREER OS
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 900,
              color: "#f8fafc",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              maxWidth: "900px",
            }}
          >
            Engineered for candidates aiming for top-tier tech roles.
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            Single-page vector resume auto-fit, 8-pillar ATS audit, and realistic conversational mock interview studio. Zero hostage paywalls.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#60a5fa", fontSize: "16px", fontWeight: 700 }}>
            <span>• 1-Page Auto-Fit</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#34d399", fontSize: "16px", fontWeight: 700 }}>
            <span>• 8-Pillar ATS Diagnostic</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#a78bfa", fontSize: "16px", fontWeight: 700 }}>
            <span>• Voice & Text Mock Studio</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
