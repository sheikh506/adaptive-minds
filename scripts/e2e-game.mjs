// Game-flow integration test. Runs the real quest logic against the database (the one in .env).
// Usage: node scripts/e2e-game.mjs [baseUrl]
// 1) Registers a throwaway student over HTTP, 2) loads the map and a quest page as that student,
// 3) checks the page never leaks answers, 4) cleans up the throwaway user.
import { PrismaClient } from "@prisma/client";

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const prisma = new PrismaClient();
const stamp = Date.now();
const email = `e2e.game${stamp}@example.com`;
const pw = "Sunny-Day-42";
let pass = 0;
let fail = 0;
const check = (name, ok, extra = "") => {
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`);
};

const jar = new Map();
const absorb = (res) => {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    jar.set(pair.slice(0, i), pair.slice(i + 1));
  }
};
const cookie = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
const req = async (path, init = {}) => {
  const res = await fetch(BASE + path, { redirect: "manual", ...init, headers: { ...(init.headers || {}), cookie: cookie() } });
  absorb(res);
  return res;
};

try {
  const reg = await fetch(BASE + "/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Game Tester", email, password: pw, role: "STUDENT", grade: "G3", consent: true, avatar: "🐼" }),
  });
  check("register throwaway student", reg.status === 201, String(reg.status));

  const csrf = await (await req("/api/auth/csrf")).json();
  await req("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken: csrf.csrfToken, email, password: pw, json: "true" }),
  });
  const session = await (await req("/api/auth/session")).json();
  check("student signed in", session?.user?.role === "STUDENT");

  const home = await req("/dashboard");
  const homeHtml = await home.text();
  check("student home shows buddy egg + daily quest", home.status === 200 && homeHtml.includes("Mystery Egg") && homeHtml.includes("Today"), String(home.status));

  const mathRedirect = await req("/dashboard/learn/math");
  check("old topic list redirects students to the map", [302, 307].includes(mathRedirect.status) && (mathRedirect.headers.get("location") || "").includes("/dashboard/play"));

  const map = await req("/dashboard/play");
  const mapHtml = await map.text();
  check("adventure map is 200", map.status === 200, String(map.status));
  for (const w of ["Candy Kingdom", "Penguin Peaks", "Rocket Galaxy", "Treasure Cove", "Pizza Planet", "Sound Safari", "Word Woods", "Story Castle"]) {
    check(`map lists world: ${w}`, mapHtml.includes(w));
  }

  const links = [...new Set([...mapHtml.matchAll(/href="(\/dashboard\/learn\/[A-Za-z0-9_-]+)"/g)].map((m) => m[1]))];
  check("map links to 8 worlds", links.length === 8, String(links.length));

  if (links[0]) {
    const quest = await req(links[0]);
    const html = await quest.text();
    check("quest page is 200 and shows world, guide and practice-time bar", quest.status === 200 && html.includes("Practice time today") && html.includes("Candy Kingdom") && html.includes("Gummy"), String(quest.status));
    check("quest page shows Hint, Lock it in and Done for today", html.includes("Hint") && html.includes("Lock it in") && html.includes("Done for today"));
    check("quest page shows a drawn SVG guide (not an emoji)", /<svg[^>]*viewBox="0 0 100 100"/.test(html) && !html.includes("🐻"));
    check("quest question is a story, not a bare sum", /Gummy|Candy Kingdom|candy|jar|cupcake|marshmallow|jelly|lollipop|gumdrop/i.test(html) && !/\d+ \+ \d+ = \?/.test(html));

    check("quest page does not leak 'answer' or 'explanation' fields", !/\\?"answer\\?"\s*:/.test(html) && !/\\?"explanation\\?"\s*:/.test(html));
  }

  const kids = await req("/dashboard/children");
  check("students are bounced from the parent page", [302, 307].includes(kids.status), String(kids.status));
  check("map shows daily minutes, not question counts", /min today|Rest today|Today&#x27;s time done|Today&#39;s time done/.test(mapHtml) && !/Each quest is/.test(mapHtml));

} finally {
  await prisma.user.deleteMany({ where: { email } }).catch(() => {});
  await prisma.$disconnect();
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
