import "server-only";
import sanitizeHtml from "sanitize-html";
import hljs from "highlight.js";
import { slugify } from "./utils";

export type TocItem = { id: string; text: string; level: 2 | 3 };

const decode = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

/** Sanitises admin-authored HTML, adds heading ids for the TOC and highlights code blocks. */
export function renderPost(html: string): { html: string; toc: TocItem[] } {
  const clean = sanitizeHtml(html || "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "iframe", "figure", "figcaption", "mark", "u", "s"]),
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "width", "height", "allowfullscreen", "frameborder", "allow"],
      code: ["class"],
      "*": ["style"],
    },
    allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
  });

  const toc: TocItem[] = [];
  const used = new Set<string>();
  let out = clean.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, lvl: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    let id = slugify(text) || "section";
    while (used.has(id)) id += "-x";
    used.add(id);
    toc.push({ id, text, level: Number(lvl) as 2 | 3 });
    return `<h${lvl} id="${id}">${inner}</h${lvl}>`;
  });

  out = out.replace(/<pre><code(?: class="language-([\w-]+)")?>([\s\S]*?)<\/code><\/pre>/g, (_m, lang: string | undefined, code: string) => {
    const raw = decode(code);
    try {
      const res = lang && hljs.getLanguage(lang) ? hljs.highlight(raw, { language: lang }) : hljs.highlightAuto(raw);
      return `<pre><code class="hljs${lang ? ` language-${lang}` : ""}">${res.value}</code></pre>`;
    } catch {
      return `<pre><code>${code}</code></pre>`;
    }
  });
  return { html: out, toc };
}
