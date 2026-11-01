"use client";


/**
 * Printable: Place Value Mats — Tens and Ones
 * Columns for tens and ones. Child draws bundles of 10 sticks (tens) and single sticks (ones).
 * Numbers to practise: 13, 25, 34, 47, 50, and 6 free-choice rows.
 */

const PRACTICE = [13, 25, 34, 47, 50, 62, 18, 39];

function PlaceValueRow({ number, blank = false }: { number?: number; blank?: boolean }) {
  const tens = blank || number === undefined ? null : Math.floor(number / 10);
  const ones = blank || number === undefined ? null : number % 10;

  const cellBase: React.CSSProperties = {
    border: "2px solid #0f766e",
    padding: "8px",
    height: "80px",
    verticalAlign: "top",
    fontSize: "13px",
    color: "#374151",
  };

  function TensCell() {
    if (tens === null) return <td style={{ ...cellBase, width: "180px" }} />;
    return (
      <td style={{ ...cellBase, width: "180px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {Array.from({ length: tens }).map((_, i) => (
            // A bundle of 10 sticks: thin rectangle with count mark
            <div key={i} style={{
              display: "flex", flexDirection: "column", gap: "2px",
              border: "1px solid #0f766e", borderRadius: "3px", padding: "2px 4px",
            }}>
              {Array.from({ length: 10 }).map((_, j) => (
                <div key={j} style={{ width: "3px", height: "8px", background: "#0f766e", borderRadius: "1px" }} />
              ))}
            </div>
          ))}
        </div>
      </td>
    );
  }

  function OnesCell() {
    if (ones === null) return <td style={{ ...cellBase, width: "120px" }} />;
    return (
      <td style={{ ...cellBase, width: "120px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {Array.from({ length: ones }).map((_, i) => (
            <div key={i} style={{ width: "3px", height: "28px", background: "#0f766e", borderRadius: "1px" }} />
          ))}
        </div>
      </td>
    );
  }

  return (
    <tr>
      <td style={{ ...cellBase, width: "60px", fontWeight: "bold", fontSize: "18px", textAlign: "center" }}>
        {blank ? "" : number}
      </td>
      <TensCell />
      <OnesCell />
      <td style={{ ...cellBase, width: "80px" }}>
        {!blank && number !== undefined && (
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>
            {Math.floor(number / 10)} tens {number % 10} ones
          </span>
        )}
      </td>
    </tr>
  );
}

export default function PlaceValueMatsPage() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#111", background: "#fff" }}>
      <div className="no-print" style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "#f0fdfa", borderRadius: "8px", border: "1px solid #99f6e4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", color: "#0f766e" }}>🖨️ Print — look at each number and draw bundles of sticks in the correct column.</span>
        <button onClick={() => window.print()} style={{ padding: "0.4rem 1rem", background: "#0f766e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Print</button>
      </div>

      <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>📊 Place Value Mats — Tens and Ones</h1>
      <p style={{ fontSize: "13px", color: "#555", marginBottom: "0.5rem" }}>
        Look at each number. Draw <strong>bundles of 10 sticks</strong> in the <em>Tens</em> column and <strong>single sticks</strong> in the <em>Ones</em> column.
      </p>
      <p style={{ fontSize: "12px", background: "#ccfbf1", padding: "6px 10px", borderRadius: "6px", color: "#134e4a", marginBottom: "1.5rem" }}>
        <strong>Example:</strong> 23 → draw 2 bundles in Tens, 3 sticks in Ones.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid #0f766e" }}>
        <thead>
          <tr style={{ background: "#ccfbf1" }}>
            <th style={{ padding: "8px", border: "2px solid #0f766e", fontSize: "14px", fontWeight: "bold" }}>Number</th>
            <th style={{ padding: "8px", border: "2px solid #0f766e", fontSize: "14px", fontWeight: "bold" }}>Tens — draw bundles of 10</th>
            <th style={{ padding: "8px", border: "2px solid #0f766e", fontSize: "14px", fontWeight: "bold" }}>Ones — draw single sticks</th>
            <th style={{ padding: "8px", border: "2px solid #0f766e", fontSize: "14px", fontWeight: "bold" }}>Write: __ tens __ ones</th>
          </tr>
        </thead>
        <tbody>
          {/* Examples with sticks pre-drawn */}
          <PlaceValueRow number={13} />
          <PlaceValueRow number={25} />
          {/* Blank practice rows */}
          {[34, 47, 50, 62, 18, 39].map((n) => (
            <tr key={n}>
              <td style={{ border: "2px solid #0f766e", padding: "8px", fontWeight: "bold", fontSize: "18px", textAlign: "center", height: "80px" }}>{n}</td>
              <td style={{ border: "2px solid #0f766e", padding: "8px", height: "80px" }} />
              <td style={{ border: "2px solid #0f766e", padding: "8px", height: "80px" }} />
              <td style={{ border: "2px solid #0f766e", padding: "8px", fontSize: "14px", height: "80px" }}>
                ___ tens ___ ones
              </td>
            </tr>
          ))}
          {/* Free-choice rows */}
          {Array.from({ length: 4 }).map((_, i) => (
            <tr key={`blank-${i}`}>
              <td style={{ border: "2px solid #0f766e", padding: "8px", height: "80px" }}>
                <div style={{ height: "28px", borderBottom: "2px solid #374151", width: "40px" }} />
              </td>
              <td style={{ border: "2px solid #0f766e", padding: "8px", height: "80px" }} />
              <td style={{ border: "2px solid #0f766e", padding: "8px", height: "80px" }} />
              <td style={{ border: "2px solid #0f766e", padding: "8px", fontSize: "14px", height: "80px" }}>
                ___ tens ___ ones
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "1.5rem", fontSize: "12px", color: "#999" }}>AdaptiveMinds · Free learning for children · adaptiveminds.app</div>
    </div>
  );
}
