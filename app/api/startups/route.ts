import { NextResponse } from "next/server";
import { demoStartups } from "@/lib/demo-data";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const category = searchParams.get("category") || "All categories";
  const minFollowers = Number(searchParams.get("min") || 10000);
  const maxFollowers = Number(searchParams.get("max") || 1000000);
  const sort = searchParams.get("sort") || "followers";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let rows = demoStartups;

  if (url && key) {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from("startups").select("*").limit(1000);
    if (!error && data) rows = data as typeof demoStartups;
  }

  let filtered = rows.filter((s) =>
    [s.name, s.handle, s.description, s.category, s.founder].some((v) => String(v || "").toLowerCase().includes(q))
    && (category === "All categories" || s.category === category)
    && s.followers >= minFollowers && s.followers <= maxFollowers
  );
  if (sort === "followers") filtered = filtered.sort((a,b) => b.followers-a.followers);
  if (sort === "growth") filtered = filtered.sort((a,b) => parseFloat(b.growth)-parseFloat(a.growth));
  if (sort === "name") filtered = filtered.sort((a,b) => a.name.localeCompare(b.name));
  return NextResponse.json({ data: filtered, count: filtered.length, mode: url && key ? "database-or-demo-fallback" : "demo" });
}
