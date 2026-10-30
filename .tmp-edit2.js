const fs = require("fs");
function edit(f, pairs) {
  let t = fs.readFileSync(f, "utf8");
  for (const [a, b] of pairs) {
    if (!t.includes(a)) throw new Error(`missing in ${f}: ${a}`);
    t = t.replace(a, () => b);
  }
  fs.writeFileSync(f, t);
}
const d = "src/components/fun/";

edit(d + "FunGames.tsx", [
  ['import { playNote } from "./audio";', 'import { playSfx } from "./sfx";'],
  ["    const next = [...open, i];\n    setOpen(next);\n", '    const next = [...open, i];\n    setOpen(next);\n    playSfx("flip");\n'],
  ["        playNote(76, { dur: 0.4 });\n", '        playSfx("correct");\n'],
  ['    if (won) awardSticker("game:memory");', '    if (won) {\n      awardSticker("game:memory");\n      playSfx("win");\n    }'],
  ["    playNote(72 + (b.id % 5) * 2, { dur: 0.25, gain: 0.7 });\n", '    playSfx("pop", (b.id % 5) * 2);\n'],
]);

edit(d + "ColouringBook.tsx", [
  ['import { awardSticker } from "@/lib/stickers";\n', 'import { awardSticker } from "@/lib/stickers";\nimport { playSfx } from "./sfx";\n'],
  ["  function paint(regionId: string) {\n", '  function paint(regionId: string) {\n    playSfx("paint", PALETTE.indexOf(color) % 8);\n'],
]);

edit(d + "DrawingStudio.tsx", [
  ['import { awardSticker } from "@/lib/stickers";\n', 'import { awardSticker } from "@/lib/stickers";\nimport { playSfx } from "./sfx";\n'],
  ["      c.fillText(stamp, p.x, p.y);\n      return;\n", '      c.fillText(stamp, p.x, p.y);\n      playSfx("stamp");\n      return;\n'],
  ['    awardSticker("art:first-drawing");\n', '    awardSticker("art:first-drawing");\n    playSfx("save");\n'],
]);

edit(d + "CraftGuide.tsx", [
  ['import { awardSticker } from "@/lib/stickers";\n', 'import { awardSticker } from "@/lib/stickers";\nimport { playSfx } from "./sfx";\n'],
  ['    awardSticker("art:craft");\n', '    awardSticker("art:craft");\n    playSfx("win");\n'],
]);
console.log("ok");
