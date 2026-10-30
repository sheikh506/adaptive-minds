/**
 * Printable: Ten Frame Activity
 * Multiple ten-frames + counter circles. Child uses small objects as counters.
 */

function TenFrame({ label }: { label?: string }) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      {label && <p style={{ fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "4px" }}>{label}</p>}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 48px)",
        gridTemplateRows: "repeat(2, 48px)",
        gap: "4px",
        width: "fit-content",
        padding: "8px",
        border: "3px solid #1d4ed8",
        borderRadius: "10px",
        background: "#eff6ff",
      }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            width: "48px", height: "48px", border: "2px solid #93c5fd",
            borderRadius: "50%", background: "#fff",
          }} />
        ))}
      </div>
    </div>
  );
}

const ACTIVITIES = [
  "Show 7 — place 7 counters from left to right. How many empty boxes?",
  "Show addition: place 4 red counters, then add 3 blue. What is 4 + 3?",
  "Show 10 — fill every space. Now take away 2. How many are left?",
  "Show the number 5 two different ways.",
  "Make 8. How many more would make 10?",
  "Show 3 + 4. Then show 4 + 3. Are they the same total?",
];

export default function TenFramePage() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#111", background: "#fff" }}>
      <div className="no-print" style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", color: "#166534" }}>🖨️ Print — then use coins, buttons or stickers as counters.</span>
        <button onClick={() => window.print()} style={{ padding: "0.4rem 1rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Print</button>
      </div>

      <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>🔲 Ten Frame Activities</h1>
      <p style={{ fontSize: "13px", color: "#555", marginBottom: "1.5rem" }}>
        Use small objects (pennies, buttons, raisins) as counters. Fill the frames from <strong>left to right, top row first</strong>.
      </p>

      {/* 6 ten-frames with activity prompts */}
      {ACTIVITIES.map((activity, i) => (
        <div key={i} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", marginBottom: "1.5rem", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "10px" }}>
          <TenFrame />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "12px", fontWeight: "bold", color: "#6b7280", marginBottom: "4px" }}>Activity {i + 1}</p>
            <p style={{ fontSize: "14px", color: "#111", lineHeight: 1.5 }}>{activity}</p>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>Write your answer: ___</p>
          </div>
        </div>
      ))}

      {/* Counter strip */}
      <h2 style={{ fontSize: "15px", borderBottom: "2px solid #e5e7eb", paddingBottom: "4px", marginTop: "1.5rem", marginBottom: "0.75rem" }}>Counter Dots — cut out and use if you don't have small objects</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: i % 2 === 0 ? "#dc2626" : "#2563eb",
            border: "1px solid #1f2937",
          }} />
        ))}
      </div>

      <div style={{ marginTop: "1.5rem", fontSize: "12px", color: "#999" }}>AdaptiveMinds · Free learning for children · adaptiveminds.app</div>
    </div>
  );
}
