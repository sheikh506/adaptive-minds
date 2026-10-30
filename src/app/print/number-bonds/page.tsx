/**
 * Printable: Number Bonds to 10
 * Blank part-whole bond diagrams for numbers 1–10.
 */

function BondDiagram({ whole, partA, partB, blank = false }: {
  whole?: number; partA?: number; partB?: number; blank?: boolean;
}) {
  const circleStyle = (filled: boolean): React.CSSProperties => ({
    width: "56px", height: "56px", borderRadius: "50%",
    border: "3px solid #6d28d9", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "20px", fontWeight: "bold",
    background: filled ? "#ede9fe" : "#fff",
    color: "#1f2937",
  });
  const lineStyle: React.CSSProperties = {
    width: "2px", height: "28px", background: "#6d28d9", margin: "0 auto",
  };
  const branchRow: React.CSSProperties = {
    display: "flex", justifyContent: "center", gap: "32px", alignItems: "flex-start", position: "relative",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      {/* Whole */}
      <div style={circleStyle(true)}>{blank ? "" : whole ?? ""}</div>
      {/* Stem */}
      <div style={lineStyle} />
      {/* Horizontal bar */}
      <div style={{ width: "80px", height: "2px", background: "#6d28d9" }} />
      {/* Branches */}
      <div style={branchRow}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={lineStyle} />
          <div style={circleStyle(false)}>{blank ? "" : partA ?? ""}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={lineStyle} />
          <div style={circleStyle(false)}>{blank ? "" : partB ?? ""}</div>
        </div>
      </div>
    </div>
  );
}

// Bonds for numbers 5–10, one pair each
const BONDS = [
  { whole: 5, bonds: [[2, 3], [1, 4], [0, 5]] },
  { whole: 6, bonds: [[2, 4], [3, 3], [1, 5]] },
  { whole: 7, bonds: [[3, 4], [2, 5], [1, 6]] },
  { whole: 8, bonds: [[4, 4], [3, 5], [2, 6]] },
  { whole: 9, bonds: [[4, 5], [3, 6], [2, 7]] },
  { whole: 10, bonds: [[5, 5], [4, 6], [3, 7]] },
] as const;

export default function NumberBondsPage() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#111", background: "#fff" }}>
      <div className="no-print" style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "#faf5ff", borderRadius: "8px", border: "1px solid #d8b4fe", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", color: "#6d28d9" }}>🖨️ Print — fill in the blank part circles to complete each bond.</span>
        <button onClick={() => window.print()} style={{ padding: "0.4rem 1rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Print</button>
      </div>

      <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>🔗 Number Bonds to 10</h1>
      <p style={{ fontSize: "13px", color: "#555", marginBottom: "1.5rem" }}>
        The <strong>top circle</strong> is the whole number. Fill in the two <strong>part circles</strong> below — what two numbers add up to make the whole?
      </p>

      {/* Pre-filled examples */}
      <h2 style={{ fontSize: "14px", borderBottom: "2px solid #e5e7eb", paddingBottom: "4px", marginBottom: "1rem" }}>Example — number bonds for 5</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginBottom: "2rem" }}>
        {BONDS[0].bonds.map(([a, b], i) => (
          <BondDiagram key={i} whole={BONDS[0].whole} partA={a} partB={b} />
        ))}
      </div>

      {/* Blank practice diagrams */}
      {BONDS.slice(1).map(({ whole, bonds }) => (
        <div key={whole} style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "14px", borderBottom: "2px solid #e5e7eb", paddingBottom: "4px", marginBottom: "1rem" }}>
            Number bonds for {whole}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
            {bonds.map(([a, b], i) => (
              <BondDiagram key={i} whole={whole} />
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: "1.5rem", fontSize: "12px", color: "#999" }}>AdaptiveMinds · Free learning for children · adaptiveminds.app</div>
    </div>
  );
}
