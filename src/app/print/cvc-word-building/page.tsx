"use client";


/**
 * Printable: CVC Word Building
 * 30 letter tiles (consonants + vowels) + 12 picture-word cards.
 * Designed to be printed on A4 / US Letter and cut out.
 */

const CONSONANTS = ["b","c","d","f","g","h","j","k","l","m","n","p","r","s","t","v","w","x","y","z"];
const VOWELS = ["a","e","i","o","u"];

// 12 simple CVC words with emoji cues
const WORDS = [
  { word: "cat", emoji: "🐱" },
  { word: "dog", emoji: "🐶" },
  { word: "pig", emoji: "🐷" },
  { word: "sun", emoji: "☀️" },
  { word: "hat", emoji: "🎩" },
  { word: "cup", emoji: "🥤" },
  { word: "bed", emoji: "🛏️" },
  { word: "fox", emoji: "🦊" },
  { word: "hen", emoji: "🐔" },
  { word: "bug", emoji: "🐛" },
  { word: "log", emoji: "🪵" },
  { word: "zip", emoji: "🤐" },
];

export default function CVCWordBuildingPage() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#111", background: "#fff" }}>
      <div className="no-print" style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", color: "#0369a1" }}>🖨️ Print this page — then cut out the tiles and cards below.</span>
        <button onClick={() => window.print()} style={{ padding: "0.4rem 1rem", background: "#0284c7", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Print</button>
      </div>

      <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>✂️ CVC Word Building Tiles</h1>
      <p style={{ fontSize: "13px", color: "#555", marginBottom: "1.5rem" }}>Cut out the letter tiles. Use the picture cards to build each word — one sound at a time.</p>

      {/* Letter tiles */}
      <h2 style={{ fontSize: "15px", borderBottom: "2px solid #e5e7eb", paddingBottom: "4px", marginBottom: "0.75rem" }}>Letter Tiles — cut out each square</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "2rem" }}>
        {[...CONSONANTS, ...CONSONANTS.slice(0, 10), ...VOWELS, ...VOWELS, ...VOWELS].map((l, i) => (
          <div key={i} style={{
            width: "52px", height: "52px", border: "2px solid #374151", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "26px", fontWeight: "bold",
            background: VOWELS.includes(l) ? "#fef9c3" : "#f0f4ff",
            color: VOWELS.includes(l) ? "#854d0e" : "#1e3a8a",
          }}>
            {l}
          </div>
        ))}
      </div>

      {/* Picture word cards */}
      <h2 style={{ fontSize: "15px", borderBottom: "2px solid #e5e7eb", paddingBottom: "4px", marginBottom: "0.75rem" }}>Picture Cards — look at the picture and build the word</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "1.5rem" }}>
        {WORDS.map(({ word, emoji }) => (
          <div key={word} style={{ border: "2px dashed #94a3b8", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "40px" }}>{emoji}</div>
            <div style={{ marginTop: "4px", fontSize: "13px", letterSpacing: "6px", fontWeight: "bold", color: "#111" }}>
              {word.split("").map((_, i) => <span key={i} style={{ display: "inline-block", width: "16px", borderBottom: "2px solid #374151", marginRight: "2px" }}>&nbsp;</span>)}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div style={{ marginTop: "1.5rem", borderTop: "1px solid #e5e7eb", paddingTop: "1rem", fontSize: "12px", color: "#555" }}>
        <strong>How to use:</strong> Choose a picture card. Say the word aloud slowly. Find the three letter tiles. Arrange them in order: beginning sound, middle vowel, ending sound. Say each sound, then blend them together. Yellow tiles = vowels (the middle sound).
      </div>

      <div style={{ marginTop: "0.75rem", fontSize: "11px", color: "#999" }}>AdaptiveMinds · Free learning for children · adaptiveminds.app</div>
    </div>
  );
}
