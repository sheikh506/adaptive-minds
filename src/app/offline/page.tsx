/**
 * Offline fallback page — shown by the service worker when the network
 * is unavailable and no cached version of the requested page exists.
 * This is a plain HTML page served as a static file so it works without JS.
 */

export const metadata = {
  title: "AdaptiveMinds — Offline",
};

// This page is intentionally rendered as a standalone HTML document
// (outside the dashboard layout) so the service worker can cache and
// serve it even when the app shell is unavailable.
export default function OfflinePage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "2rem",
      fontFamily: '"Segoe UI", Arial, sans-serif',
      background: "linear-gradient(135deg, #eef2ff 0%, #fdf4ff 100%)",
    }}>
      <div style={{
        maxWidth: 420, width: "100%", background: "#fff", borderRadius: 24,
        padding: "2.5rem", textAlign: "center",
        boxShadow: "0 4px 24px rgba(99,102,241,0.12)", border: "2px solid #e0e7ff",
      }}>
        <div style={{ fontSize: "4rem" }}>☁️</div>
        <h1 style={{ fontSize: "1.5rem", margin: "0.75rem 0 0.5rem", color: "#1f2937" }}>
          You are offline
        </h1>
        <p style={{ color: "#6b7280", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
          AdaptiveMinds needs an internet connection to load new learning content.
          Please check your Wi‑Fi or mobile data, then try again.
        </p>
        <a
          href="/dashboard"
          style={{
            display: "inline-block", padding: "0.75rem 2rem",
            fontSize: "1rem", fontWeight: "bold",
            background: "#6366f1", color: "#fff",
            borderRadius: 12, textDecoration: "none",
          }}
        >
          Try again
        </a>
      </div>
    </div>
  );
}
