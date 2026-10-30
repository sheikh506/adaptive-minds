/**
 * Printable: Word Sort — Short Vowels
 * 30 word cards (6 per vowel: a, e, i, o, u) + 5 sorting header cards.
 * Child cuts out cards and sorts by middle vowel sound.
 */

const WORDS_BY_VOWEL: Record<string, string[]> = {
  a: ["cat", "map", "bag", "ran", "hat", "van"],
  e: ["bed", "hen", "net", "red", "leg", "ten"],
  i: ["pig", "dip", "fin", "kit", "mix", "lid"],
  o: ["fox", "hop", "pot", "log", "sob", "nod"],
  u: ["bug", "cup", "mud", "run", "hug", "bus"],
};

const VOWEL_COLOURS: Record<string, { bg: string; border: string; label: string }> = {
  a: { bg: "#fef2f2", border: "#ef4444", label: "/a/ as in cat" },
  e: { bg: "#fff7ed", border: "#f97316", label: "/e/ as in bed" },
  i: { bg: "#fefce8", border: "#eab308", label: "/i/ as in pig" },
  o: { bg: "#f0fdf4", border: "#22c55e", label: "/o/ as in fox" },
  u: { bg: "#eff6ff", border: "#3b82f6", label: "/u/ as in bug" },
};

export default function WordSortVowelsPage() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#111", background: "#fff" }}>
      <div className="no-print" style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "#fff1f2", borderRadius: "8px", border: "1px solid #fecdd3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", color: "#be123c" }}>🖨️ Print — cut out all cards, mix them up, then sort by vowel sound.</span>
        <button onClick={() => window.print()} style={{ padding: "0.4rem 1rem", background: "#be123c", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Print</button>
      </div>

      <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>🃏 Word Sort: Short Vowels</h1>
      <p style={{ fontSize: "13px", color: "#555", marginBottom: "1.5rem" }}>
        Say each word aloud. Listen for the vowel sound in the <strong>middle</strong>. Sort the cards into five piles — one for each vowel sound.
      </p>

      {/* Sorting header cards */}
      <h2 style={{ fontSize: "14px", borderBottom: "2px solid #e5e7eb", paddingBottom: "4px", marginBottom: "0.75rem" }}>Sorting Headers — one card per pile</h2>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {Object.entries(VOWEL_COLOURS).map(([v, { bg, border, label }]) => (
          <div key={v} style={{
            width: "110px", height: "70px", border: `3px solid ${border}`,
            borderRadius: "10px", background: bg,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "28px", fontWeight: "bold" }}>{v}</span>
            <span style={{ fontSize: "11px", color: "#374151" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Word cards — mixed */}
      <h2 style={{ fontSize: "14px", borderBottom: "2px solid #e5e7eb", paddingBottom: "4px", marginBottom: "0.75rem" }}>Word Cards — cut out and sort</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {/* Interleaved so they need to be sorted */}
        {Object.entries(WORDS_BY_VOWEL).flatMap(([v, words]) =>
          words.map((word) => ({ word, v }))
        ).sort((a, b) => a.word.localeCompare(b.word)).map(({ word }) => (
          <div key={word} style={{
            width: "90px", height: "50px", border: "2px solid #94a3b8",
            borderRadius: "8px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "18px", fontWeight: "bold",
            background: "#fff",
          }}>
            {word}
          </div>
        ))}
      </div>

      {/* Answer key — on second page */}
      <div style={{ marginTop: "2rem", pageBreakBefore: "always" }}>
        <h2 style={{ fontSize: "16px", marginBottom: "1rem" }}>Answer Key — for parents/carers</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {Object.entries(WORDS_BY_VOWEL).map(([v, words]) => {
            const { bg, border, label } = VOWEL_COLOURS[v];
            return (
              <div key={v} style={{ border: `2px solid ${border}`, borderRadius: "10px", padding: "10px", minWidth: "120px", background: bg }}>
                <p style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "6px" }}>/{v}/ — {label.replace(`/${v}/ as in `, "")}</p>
                {words.map((w) => <p key={w} style={{ margin: "2px 0", fontSize: "14px" }}>{w}</p>)}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", fontSize: "12px", color: "#999" }}>AdaptiveMinds · Free learning for children · adaptiveminds.app</div>
    </div>
  );
}
