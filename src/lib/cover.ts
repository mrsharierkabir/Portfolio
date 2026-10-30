/**
 * Generates a stylised UI mock-up (SVG string) for a project when no screenshot
 * has been uploaded yet. Used on case-study pages and as 3D textures.
 */
type CoverInput = { title: string; category?: string | null; device?: string | null; accent?: string | null; summary?: string | null; live_url?: string | null };
const hostFor = (p: CoverInput) => { try { return p.live_url ? new URL(p.live_url).host.replace(/^www\./, "") : ""; } catch { return ""; } };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const F = "Helvetica Neue, Helvetica, Arial, sans-serif";

function tint(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const HEAD = [["Everything you need,", "delivered fast."], ["New season.", "New shapes."], ["Shop smarter,", "pay less."], ["Fresh picks,", "every day."]];
const hash = (s: string) => s.split("").reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

function shop(p: CoverInput, ac: string) {
  const W = 1600, H = 1000;
  const [h1, h2] = /fashion/i.test(p.category || "") ? HEAD[1] : HEAD[hash(p.title) % HEAD.length];
  const cards = Array.from({ length: 4 }).map((_, i) => {
    const x = 96 + i * 362;
    return `<g>
      <rect x="${x}" y="560" width="330" height="330" rx="18" fill="${i % 2 ? "#EFEDE8" : tint(ac, 0.1)}"/>
      <circle cx="${x + 165}" cy="${700}" r="${70 + (i % 2) * 14}" fill="${i % 2 ? tint(ac, 0.25) : "#fff"}"/>
      <rect x="${x}" y="904" width="${180 - i * 14}" height="16" rx="8" fill="#1C1C1F"/>
      <rect x="${x}" y="932" width="90" height="14" rx="7" fill="${ac}"/>
    </g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#FAFAF8"/>
    <rect width="${W}" height="56" fill="#ECEAE6"/>
    <circle cx="36" cy="28" r="9" fill="#FF5F57"/><circle cx="64" cy="28" r="9" fill="#FEBC2E"/><circle cx="92" cy="28" r="9" fill="#28C840"/>
    <rect x="520" y="14" width="560" height="28" rx="14" fill="#fff"/>
    <text x="800" y="34" text-anchor="middle" font-family="${F}" font-size="16" fill="#8A877F">${esc(hostFor(p) || p.title.toLowerCase().replace(/\s+/g, "") + ".com")}</text>
    <text x="96" y="128" font-family="${F}" font-size="34" font-weight="700" fill="#111" letter-spacing="-1">${esc(p.title)}</text>
    ${["Shop", "New in", "Categories", "Deals"].map((t, i) => `<text x="${760 + i * 150}" y="124" font-family="${F}" font-size="20" fill="#55524C">${t}</text>`).join("")}
    <rect x="1420" y="96" width="84" height="40" rx="20" fill="#111"/>
    <rect x="96" y="170" width="1408" height="350" rx="24" fill="${ac}"/>
    <circle cx="1260" cy="345" r="210" fill="#fff" opacity=".12"/>
    <circle cx="1330" cy="300" r="120" fill="#fff" opacity=".14"/>
    <text x="150" y="300" font-family="${F}" font-size="68" font-weight="700" fill="#fff" letter-spacing="-2">${h1}</text>
    <text x="150" y="378" font-family="${F}" font-size="68" font-weight="700" fill="#fff" letter-spacing="-2" opacity=".75">${h2}</text>
    <rect x="150" y="420" width="200" height="56" rx="28" fill="#fff"/>
    <text x="250" y="456" text-anchor="middle" font-family="${F}" font-size="20" font-weight="600" fill="${ac}">Shop now</text>
    ${cards}
  </svg>`;
}

function chat(p: CoverInput, ac: string) {
  const W = 800, H = 1600;
  const msgs = [
    [0, "Hey! Are we still on for the demo today?", 2],
    [1, "Yes — 5pm works. I'll send the location.", 1],
    [0, "Perfect, see you then", 1],
    [1, "Shared a location", 1],
    [0, "Got it. On my way!", 1],
    [1, "Great, thanks!", 1],
  ] as const;
  let y = 330;
  const bubbles = msgs.map(([me, t, lines]) => {
    const h = 40 + lines * 34;
    const w = Math.min(560, 70 + t.length * 15);
    const x = me ? W - 48 - w : 48;
    const words = t.split(" ");
    const l1: string[] = [];
    while (words.length && (l1.join(" ") + " " + words[0]).trim().length <= 30) l1.push(words.shift()!);
    const first = l1.join(" "), second = words.join(" ");
    const g = `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30" fill="${me ? ac : "#fff"}"/>
      <text x="${x + 28}" y="${y + 50}" font-family="${F}" font-size="26" fill="${me ? "#fff" : "#1C1C1F"}">${esc(lines > 1 ? first : t)}</text>
      ${lines > 1 ? `<text x="${x + 28}" y="${y + 84}" font-family="${F}" font-size="26" fill="${me ? "#fff" : "#1C1C1F"}">${esc(second)}</text>` : ""}
    </g>`;
    y += h + 26;
    return g;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#EEF2EF"/>
    <rect width="${W}" height="250" fill="${ac}"/>
    <text x="48" y="80" font-family="${F}" font-size="26" font-weight="600" fill="#fff">9:41</text>
    <circle cx="96" cy="176" r="44" fill="#fff" opacity=".9"/>
    <text x="96" y="190" text-anchor="middle" font-family="${F}" font-size="36" font-weight="700" fill="${ac}">R</text>
    <text x="162" y="168" font-family="${F}" font-size="34" font-weight="700" fill="#fff">Rafi</text>
    <text x="162" y="206" font-family="${F}" font-size="24" fill="#fff" opacity=".8">online</text>
    <text x="${W - 48}" y="190" text-anchor="end" font-family="${F}" font-size="30" fill="#fff">${esc(p.title)}</text>
    <text x="${W / 2}" y="300" text-anchor="middle" font-family="${F}" font-size="22" fill="#8A938E">TODAY</text>
    ${bubbles}
    <rect x="32" y="${H - 150}" width="${W - 170}" height="84" rx="42" fill="#fff"/>
    <text x="80" y="${H - 98}" font-family="${F}" font-size="26" fill="#9AA29D">Message</text>
    <circle cx="${W - 86}" cy="${H - 108}" r="42" fill="${ac}"/>
    <path d="M${W - 100} ${H - 124} L${W - 66} ${H - 108} L${W - 100} ${H - 92} Z" fill="#fff"/>
  </svg>`;
}

function app(p: CoverInput, ac: string) {
  const W = 1600, H = 1000;
  const bars = Array.from({ length: 12 }).map((_, i) => {
    const h = 80 + ((i * 53) % 220);
    return `<rect x="${560 + i * 72}" y="${820 - h}" width="40" height="${h}" rx="8" fill="${i === 8 ? ac : tint(ac, 0.25)}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#F7F7F5"/>
    <rect width="${W}" height="56" fill="#ECEAE6"/>
    <circle cx="36" cy="28" r="9" fill="#FF5F57"/><circle cx="64" cy="28" r="9" fill="#FEBC2E"/><circle cx="92" cy="28" r="9" fill="#28C840"/>
    <rect x="0" y="56" width="420" height="944" fill="#111214"/>
    <text x="56" y="140" font-family="${F}" font-size="34" font-weight="700" fill="#fff">${esc(p.title)}</text>
    ${["Overview", "Explore", "Library", "Settings"].map((t, i) => `<rect x="40" y="${200 + i * 72}" width="340" height="52" rx="12" fill="${i === 0 ? tint(ac, 0.25) : "transparent"}"/><text x="72" y="${234 + i * 72}" font-family="${F}" font-size="22" fill="${i === 0 ? "#fff" : "#8A8C93"}">${t}</text>`).join("")}
    <text x="500" y="160" font-family="${F}" font-size="48" font-weight="700" fill="#111" letter-spacing="-1.5">${esc((p.category || "Dashboard").split("·")[0].trim())}</text>
    ${[0, 1, 2].map((i) => `<rect x="${500 + i * 340}" y="210" width="310" height="150" rx="18" fill="#fff" stroke="#E5E3DE"/><rect x="${530 + i * 340}" y="246" width="120" height="14" rx="7" fill="#C9C6BF"/><text x="${530 + i * 340}" y="320" font-family="${F}" font-size="44" font-weight="700" fill="${i === 0 ? ac : "#111"}">${[128, 64, 99][i]}${i === 2 ? "%" : ""}</text>`).join("")}
    <rect x="500" y="400" width="1000" height="460" rx="18" fill="#fff" stroke="#E5E3DE"/>
    ${bars}
  </svg>`;
}

export function coverSvg(p: CoverInput): string {
  const ac = p.accent || "#2F45FF";
  if (p.device === "mobile") return chat(p, ac);
  if (/commerce|shop|store|fashion/i.test(p.category || "")) return shop(p, ac);
  return app(p, ac);
}

export const coverDataUrl = (p: CoverInput) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(coverSvg(p))}`;
