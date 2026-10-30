/**
 * Printable: Story Retelling Mat
 * Beginning / Middle / End layout with draw + write spaces.
 */

const SENTENCE_STARTERS = {
  beginning: ["First, …", "At the start, …", "The story begins when …", "The main character is …"],
  middle: ["Then, …", "Next, …", "After that, …", "The problem was …"],
  end: ["Finally, …", "At the end, …", "The story ends when …", "The problem was solved because …"],
};

function Section({ title, emoji, colour, starters }: {
  title: string; emoji: string; colour: string; starters: string[];
}) {
  return (
    <div style={{
      border: `3px solid ${colour}`, borderRadius: "12px",
      padding: "12px", marginBottom: "1rem",
      pageBreakInside: "avoid",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "28px" }}>{emoji}</span>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}>{title}</h2>
      </div>

      {/* Draw box */}
      <p style={{ fontSize: "12px", fontWeight: "bold", color: "#6b7280", marginBottom: "4px" }}>Draw what happened:</p>
      <div style={{
        width: "100%", height: "130px", border: `2px dashed ${colour}`,
        borderRadius: "8px", background: "#fafafa", marginBottom: "8px",
      }} />

      {/* Write lines */}
      <p style={{ fontSize: "12px", fontWeight: "bold", color: "#6b7280", marginBottom: "4px" }}>Write or tell what happened:</p>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{
          height: "28px", borderBottom: "1.5px solid #d1d5db", marginBottom: "6px",
          fontSize: "13px", color: "#9ca3af",
        }}>
          {i === 0 ? starters[0] : ""}
        </div>
      ))}
    </div>
  );
}

export default function StoryRetellMatPage() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#111", background: "#fff" }}>
      <div className="no-print" style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "#fdf4ff", borderRadius: "8px", border: "1px solid #f0abfc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", color: "#86198f" }}>🖨️ Print — use after reading a story together. Draw and write in each section.</span>
        <button onClick={() => window.print()} style={{ padding: "0.4rem 1rem", background: "#a21caf", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Print</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <div>
          <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>📖 Story Retelling Mat</h1>
          <p style={{ fontSize: "13px", color: "#555" }}>After reading, retell the story in your own words — draw, write, or say it aloud.</p>
        </div>
        <div style={{ textAlign: "right", fontSize: "13px", color: "#6b7280" }}>
          <p style={{ margin: "2px 0" }}>Story title: _________________________</p>
          <p style={{ margin: "2px 0" }}>My name: ___________________________</p>
          <p style={{ margin: "2px 0" }}>Date: ______________________________</p>
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <Section
          title="Beginning"
          emoji="🌅"
          colour="#3b82f6"
          starters={SENTENCE_STARTERS.beginning}
        />
        <Section
          title="Middle"
          emoji="⚡"
          colour="#f59e0b"
          starters={SENTENCE_STARTERS.middle}
        />
        <Section
          title="End"
          emoji="🌟"
          colour="#10b981"
          starters={SENTENCE_STARTERS.end}
        />
      </div>

      {/* Retelling prompts */}
      <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "1rem", fontSize: "13px" }}>
        <strong>Talk about the story:</strong>
        <ul style={{ paddingLeft: "1.2rem", marginTop: "4px", lineHeight: 1.8 }}>
          <li>Who was in the story?</li>
          <li>Where did it happen?</li>
          <li>What was the problem?</li>
          <li>How was the problem solved?</li>
          <li>What was your favourite part?</li>
        </ul>
      </div>

      <div style={{ marginTop: "0.75rem", fontSize: "12px", color: "#999" }}>AdaptiveMinds · Free learning for children · adaptiveminds.app</div>
    </div>
  );
}
