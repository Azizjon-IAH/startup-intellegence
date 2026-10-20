import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  let body: { email?: string; company?: string; useCase?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ message: "Demo mode: request was validated but not saved. Configure Supabase to store leads." }, { status: 202 });
  }

  const supabase = createClient(url, key);
  const { error } = await supabase.from("leads").insert({
    email, company: String(body.company || "").slice(0, 120),
    use_case: String(body.useCase || "").slice(0, 1000)
  });
  if (error) return NextResponse.json({ error: "Could not save request. Check the database setup." }, { status: 500 });
  return NextResponse.json({ message: "Thanks — your request has been received." }, { status: 201 });
}
