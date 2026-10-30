import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicSupabase, getServiceSupabase } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  purpose: z.string().trim().max(80).optional().default(""),
  company: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(10).max(5000),
  website: z.string().optional().default(""), // honeypot
  elapsed: z.number().optional().default(0),
});

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Couldn't read the form." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Some fields need another look." }, { status: 422 });
  const d = parsed.data;

  // Bots: filled the hidden field or submitted inhumanly fast → pretend success.
  if (d.website || d.elapsed < 2500) return NextResponse.json({ ok: true });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const service = getServiceSupabase();

  // Rate limit: 5 messages per IP per hour (needs service key to read).
  if (service) {
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await service.from("messages").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", since);
    if ((count ?? 0) >= 5) return NextResponse.json({ error: "That's a lot of messages in an hour — please try again later." }, { status: 429 });
  }

  const db = service ?? getPublicSupabase();
  const row = { name: d.name, email: d.email, purpose: d.purpose || null, company: d.company || null, message: d.message, ip };
  if (db) {
    const { error } = await db.from("messages").insert(row);
    if (error) {
      console.error("[contact] insert failed", error.message);
      return NextResponse.json({ error: "I couldn't save your message just now." }, { status: 500 });
    }
  } else {
    console.info("[contact] (no database configured)", row);
  }

  // Optional email notification via Resend
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (key && to) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: d.email,
        subject: `New message — ${d.purpose || "Portfolio"} — ${d.name}`,
        html: `<p><b>${esc(d.name)}</b> &lt;${esc(d.email)}&gt;${d.company ? ` · ${esc(d.company)}` : ""}</p><p><i>${esc(d.purpose)}</i></p><p style="white-space:pre-wrap">${esc(d.message)}</p>`,
      }),
    }).catch((e) => console.error("[contact] email failed", e));
  }

  return NextResponse.json({ ok: true });
}
