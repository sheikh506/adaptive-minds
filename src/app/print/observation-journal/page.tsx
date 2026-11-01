"use client";


/**
 * Printable: Science Observation Journal
 * One observation page — what I see, what I wonder, what changed.
 * Parent prints several copies and uses for any observation activity.
 */

function Section({ label, emoji, height = 100 }: { label: string; emoji: string; height?: number }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <p style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>{emoji} {label}</p>
      <div style={{
        width: "100%", height, border: "2px dashed #16a34a",
        borderRadius: "8px", background: "#f9fafb",
      }} />
    </div>
  );
}

export default function ObservationJournalPage() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#111", background: "#fff" }}>
      <div className="no-print" style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "#f7fee7", borderRadius: "8px", border: "1px solid #bef264", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", color: "#365314" }}>🖨️ Print several copies — use one page per observation. Observe over several days.</span>
        <button onClick={() => window.print()} style={{ padding: "0.4rem 1rem", background: "#15803d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Print</button>
      </div>

      {/* Page 1 — main observation */}
      <div style={{ pageBreakAfter: "always" }}>
        <div style={{ border: "3px solid #16a34a", borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <div>
              <h1 style={{ fontSize: "22px", margin: "0 0 4px" }}>🔬 Science Observation Journal</h1>
              <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>A young scientist is curious and looks carefully.</p>
            </div>
            <div style={{ textAlign: "right", fontSize: "13px", color: "#6b7280" }}>
              <p style={{ margin: "2px 0" }}>Name: _____________________</p>
              <p style={{ margin: "2px 0" }}>Date: ______________________</p>
              <p style={{ margin: "2px 0" }}>I am observing: ____________</p>
            </div>
          </div>

          <Section label="What I see — draw and label your observation" emoji="👀" height={160} />
          <Section label="What I wonder — write or draw one question you have" emoji="🤔" height={80} />
          <Section label="What I notice — write one detail that surprised you" emoji="💡" height={80} />
          <Section label="What changed? — come back later and see what is different" emoji="🔄" height={80} />

          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "8px", marginTop: "0.5rem", fontSize: "12px", color: "#6b7280" }}>
            <strong>Look for:</strong> colour · shape · size · texture · smell · movement · living or non-living
          </div>
        </div>
      </div>

      {/* Page 2 — observation log (multiple days) */}
      <div>
        <h2 style={{ fontSize: "18px", marginBottom: "0.5rem" }}>📅 Observation Log — what is changing over time?</h2>
        <p style={{ fontSize: "13px", color: "#555", marginBottom: "1rem" }}>
          Use this page to record the same thing over several days. Is anything different?
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#dcfce7" }}>
              <th style={{ padding: "8px", border: "2px solid #16a34a", width: "90px", fontSize: "13px" }}>Day / Date</th>
              <th style={{ padding: "8px", border: "2px solid #16a34a", fontSize: "13px" }}>What I see (draw or write)</th>
              <th style={{ padding: "8px", border: "2px solid #16a34a", width: "160px", fontSize: "13px" }}>One thing that changed</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((day) => (
              <tr key={day}>
                <td style={{ border: "2px solid #16a34a", padding: "6px", height: "70px", fontWeight: "bold", textAlign: "center", fontSize: "14px" }}>Day {day}</td>
                <td style={{ border: "2px solid #16a34a", padding: "6px", height: "70px" }} />
                <td style={{ border: "2px solid #16a34a", padding: "6px", height: "70px" }} />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Science vocabulary bank */}
        <div style={{ marginTop: "1.5rem", borderTop: "2px solid #e5e7eb", paddingTop: "1rem" }}>
          <p style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>🌱 Science Vocabulary Bank — helpful words to use</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {["observe", "notice", "wonder", "predict", "measure", "compare", "describe", "record", "change", "pattern", "living", "growing", "rough", "smooth", "warm", "cool", "absorb", "float", "sink"].map((w) => (
              <span key={w} style={{
                padding: "3px 8px", background: "#dcfce7", border: "1px solid #16a34a",
                borderRadius: "20px", fontSize: "12px", color: "#14532d",
              }}>{w}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", fontSize: "12px", color: "#999" }}>AdaptiveMinds · Free learning for children · adaptiveminds.app</div>
    </div>
  );
}
