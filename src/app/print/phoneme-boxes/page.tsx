"use client";


/**
 * Printable: Phoneme Counting Boxes
 * Rows of 5 segmentation boxes. Child moves a counter into each box for each sound.
 */

const PRACTICE_WORDS = [
  { word: "cat", phonemes: 3 },
  { word: "ship", phonemes: 3 },
  { word: "frog", phonemes: 4 },
  { word: "nest", phonemes: 4 },
  { word: "spill", phonemes: 5 },
  { word: "drip", phonemes: 4 },
  { word: "box", phonemes: 4 },  // /b/ /ɒ/ /k/ /s/
  { word: "chin", phonemes: 3 },
  { word: "thin", phonemes: 3 },
  { word: "clap", phonemes: 4 },
  { word: "string", phonemes: 6 },
  { word: "lamp", phonemes: 4 },
];

function BoxRow({ phonemes }: { phonemes: number }) {
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {Array.from({ length: phonemes }).map((_, i) => (
        <div key={i} style={{
          width: "44px", height: "44px", border: "2px solid #374151", borderRadius: "8px",
          background: "#fafafa",
        }} />
      ))}
      {/* Empty extra boxes grayed out */}
      {Array.from({ length: Math.max(0, 5 - phonemes) }).map((_, i) => (
        <div key={i} style={{
          width: "44px", height: "44px", border: "2px dashed #d1d5db", borderRadius: "8px",
          background: "#f9fafb", opacity: 0.4,
        }} />
      ))}
    </div>
  );
}

export default function PhonemeBoxesPage() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#111", background: "#fff" }}>
      <div className="no-print" style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "#fff7ed", borderRadius: "8px", border: "1px solid #fed7aa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", color: "#c2410c" }}>🖨️ Print — then use counters (coins, raisins, buttons) with each row.</span>
        <button onClick={() => window.print()} style={{ padding: "0.4rem 1rem", background: "#ea580c", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Print</button>
      </div>

      <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>📦 Phoneme Counting Boxes</h1>
      <p style={{ fontSize: "13px", color: "#555", marginBottom: "0.5rem" }}>
        Say each word aloud slowly. Move one counter into a box for each sound you hear. Count the filled boxes — that is how many phonemes!
      </p>
      <p style={{ fontSize: "12px", background: "#fef3c7", padding: "6px 10px", borderRadius: "6px", color: "#78350f", marginBottom: "1.5rem" }}>
        <strong>Remember:</strong> Count sounds, not letters. &quot;Ship&quot; has 4 letters but 3 sounds: /ʃ/ /ɪ/ /p/.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={{ textAlign: "left", padding: "6px 10px", fontSize: "13px", fontWeight: "bold", width: "120px", borderBottom: "2px solid #e5e7eb" }}>Word</th>
            <th style={{ textAlign: "left", padding: "6px 10px", fontSize: "13px", fontWeight: "bold", borderBottom: "2px solid #e5e7eb" }}>Move one counter per sound</th>
          </tr>
        </thead>
        <tbody>
          {PRACTICE_WORDS.map(({ word, phonemes }, i) => (
            <tr key={word} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={{ padding: "10px 10px", fontWeight: "bold", fontSize: "16px", borderBottom: "1px solid #e5e7eb" }}>{word}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #e5e7eb" }}>
                <BoxRow phonemes={phonemes} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Blank rows for own words */}
      <h2 style={{ fontSize: "15px", marginTop: "1.5rem", marginBottom: "0.5rem" }}>Make your own — write a word and count its sounds</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={{ width: "120px", padding: "10px 10px", borderBottom: "1px solid #e5e7eb" }}>
                <div style={{ height: "28px", borderBottom: "2px solid #374151", width: "90px" }} />
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #e5e7eb" }}>
                <BoxRow phonemes={5} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "1.5rem", fontSize: "12px", color: "#999" }}>AdaptiveMinds · Free learning for children · adaptiveminds.app</div>
    </div>
  );
}
