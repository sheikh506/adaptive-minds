// End-to-end smoke test. Usage: node scripts/e2e.mjs [baseUrl]
// Registers throwaway users, logs in, and walks the main pages and API edge cases.
const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const stamp = Date.now();
let pass = 0;
let fail = 0;

function check(name, ok, extra = "") {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`);
}

class Client {
  jar = new Map();
  absorb(res) {
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const i = pair.indexOf("=");
      const k = pair.slice(0, i);
      const v = pair.slice(i + 1);
      if (!v || /expires=Thu, 01 Jan 1970/i.test(c)) this.jar.delete(k);
      else this.jar.set(k, v);
    }
  }
  cookie() {
    return [...this.jar].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  async req(path, init = {}) {
    const res = await fetch(BASE + path, {
      redirect: "manual",
      ...init,
      headers: { ...(init.headers || {}), cookie: this.cookie() },
    });
    this.absorb(res);
    return res;
  }
  async login(email, password) {
    const csrf = await (await this.req("/api/auth/csrf")).json();
    const res = await this.req("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken: csrf.csrfToken, email, password, json: "true" }),
    });
    const session = await (await this.req("/api/auth/session")).json();
    return { status: res.status, session };
  }
}

async function register(body) {
  const res = await fetch(BASE + "/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  let json = {};
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json };
}

const pw = "Sunny-Day-42";

// 1. Public pages
for (const p of ["/", "/login", "/register"]) {
  const r = await new Client().req(p);
  check(`GET ${p} is 200`, r.status === 200, String(r.status));
}
const guard = await new Client().req("/dashboard");
check("GET /dashboard without session redirects to /login", [302, 307].includes(guard.status));

// 2. Registration validation
const email = `e2e.kid${stamp}@example.com`;
let r = await register({ name: "Kid Tester", email, password: pw, role: "STUDENT", grade: "G3", consent: true });
check("register valid student -> 201", r.status === 201, JSON.stringify(r));
r = await register({ name: "Kid Tester", email, password: pw, role: "STUDENT", grade: "G3", consent: true });
check("duplicate email -> 409", r.status === 409, JSON.stringify(r));
r = await register({ name: "Kid Tester", email: email.toUpperCase(), password: pw, role: "STUDENT", grade: "G3", consent: true });
check("duplicate email, different case -> 409", r.status === 409, JSON.stringify(r));
r = await register({ name: "Evil", email: `e2e.admin${stamp}@example.com`, password: pw, role: "ADMIN", consent: true });
check("role ADMIN rejected -> 400", r.status === 400, JSON.stringify(r));
r = await register({ name: "Bad Grade", email: `e2e.bg${stamp}@example.com`, password: pw, role: "STUDENT", grade: "ZZZ", consent: true });
check("invalid grade -> 400 (not 500)", r.status === 400, JSON.stringify(r));
r = await register({ name: "Short", email: `e2e.sp${stamp}@example.com`, password: "123", role: "STUDENT", grade: "G3", consent: true });
check("short password -> 400", r.status === 400, JSON.stringify(r));
r = await register({ name: "   ", email: `e2e.ws${stamp}@example.com`, password: pw, role: "PARENT" });
check("blank name -> 400", r.status === 400, JSON.stringify(r));
r = await register({ name: "Weak", email: `e2e.wk${stamp}@example.com`, password: "password", role: "PARENT" });
check("common password rejected -> 400", r.status === 400, JSON.stringify(r));
r = await register({ name: "<script>alert(1)</script>", email: `e2e.xss${stamp}@example.com`, password: pw, role: "PARENT" });
check("HTML in name rejected -> 400", r.status === 400, JSON.stringify(r));
r = await register({ name: "No Grade", email: `e2e.ng${stamp}@example.com`, password: pw, role: "STUDENT" });
check("student without grade rejected -> 400", r.status === 400, JSON.stringify(r));

r = await register({ name: "No Consent", email: `e2e.nc${stamp}@example.com`, password: pw, role: "STUDENT", grade: "G3" });
check("student without parental consent rejected -> 400", r.status === 400 && r.json.field === "consent", JSON.stringify(r));
r = await register({ name: "Bad Avatar", email: `e2e.av${stamp}@example.com`, password: pw, role: "STUDENT", grade: "G3", consent: true, avatar: "http://evil.example/x.png" });
check("avatar outside allow-list rejected -> 400", r.status === 400, JSON.stringify(r));
r = await register({ name: "Parent Ok", email: `e2e.pa${stamp}@example.com`, password: pw, role: "PARENT" });
check("valid parent -> 201 (no grade/consent needed)", r.status === 201, JSON.stringify(r));

// 3. Login
const c = new Client();
let l = await c.login(email, "wrong-password");
check("wrong password does not create session", !l.session?.user, JSON.stringify(l.session));
l = await c.login(email.toUpperCase(), pw);
check("login works with different email case", !!l.session?.user, JSON.stringify(l.session));

// 4. Authenticated pages (student)
const studentPages = ["/dashboard", "/dashboard/play", "/dashboard/progress", "/dashboard/rewards", "/dashboard/settings"];
for (const p of studentPages) {
  const res = await c.req(p);
  check(`student GET ${p} is 200`, res.status === 200, String(res.status));
}
const demo = new Client();
l = await demo.login("student@demo.com", "password123");
check("demo student login", !!l.session?.user, JSON.stringify(l.session));
const html = await (await demo.req("/dashboard/learn/math")).text();
const topicLinks = [...html.matchAll(/href="(\/dashboard\/learn\/[a-z0-9]{20,})"/g)].map((m) => m[1]);
if (topicLinks[0]) {
  const t = await demo.req(topicLinks[0]);
  check("topic exercise page is 200", t.status === 200, String(t.status));
}

// 5. Cron endpoint must not be public
const cron = await new Client().req("/api/cron/weekly-reports");
check("cron endpoint not publicly runnable", [401, 403, 404, 405].includes(cron.status), String(cron.status));

// 6. Security headers
const home = await new Client().req("/");
check("X-Content-Type-Options header set", home.headers.get("x-content-type-options") === "nosniff");
check("X-Frame-Options / frame-ancestors set", !!home.headers.get("x-frame-options") || /frame-ancestors/.test(home.headers.get("content-security-policy") || ""));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
