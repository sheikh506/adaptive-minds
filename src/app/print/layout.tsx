/**
 * Print layout — no sidebar, no header, no music.
 * Pages in this layout open in a new tab and are designed to be printed.
 */
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AdaptiveMinds — Printable Activity</title>
        <style>{`
          @page { margin: 1.5cm; }
          * { box-sizing: border-box; }
          body { font-family: "Segoe UI", Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #111; }
          @media screen {
            body { padding: 1rem; max-width: 760px; margin: 0 auto; }
            .print-only { display: block; }
          }
          @media print {
            .no-print { display: none !important; }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
