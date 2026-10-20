"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Bookmark, CheckCircle2, Database, ExternalLink, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import type { Startup } from "@/lib/demo-data";

const categories = ["All categories", "AI", "Developer Tools", "Productivity", "Design", "No-code", "Marketing", "Fintech"];
const fmt = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n/1000)}K` : String(n);

export default function Home() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [minFollowers, setMinFollowers] = useState("10000");
  const [maxFollowers, setMaxFollowers] = useState("1000000");
  const [sort, setSort] = useState("followers");
  const [saved, setSaved] = useState<string[]>([]);
  const [selected, setSelected] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [useCase, setUseCase] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem("si-saved") || "[]")); } catch { setSaved([]); }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({ q: query, category, min: minFollowers, max: maxFollowers, sort });
    fetch(`/api/startups?${params.toString()}`, { signal: controller.signal })
      .then(r => r.json())
      .then(result => { setStartups(result.data || []); })
      .catch(err => { if (err.name !== "AbortError") setStartups([]); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [query, category, minFollowers, maxFollowers, sort]);

  const savedCount = saved.length;
  const toggleSaved = (id: string) => {
    setSaved(old => {
      const next = old.includes(id) ? old.filter(x => x !== id) : [...old, id];
      localStorage.setItem("si-saved", JSON.stringify(next));
      return next;
    });
  };

  const submitLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLeadLoading(true); setLeadMessage("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, useCase })
      });
      const data = await response.json();
      setLeadMessage(data.message || data.error || "Something went wrong.");
      if (response.ok && response.status !== 202) { setEmail(""); setCompany(""); setUseCase(""); }
    } catch { setLeadMessage("Network error. Please try again."); }
    finally { setLeadLoading(false); }
  };

  const exportCsv = () => {
    const rows = [["Name","X handle","Category","Followers","Growth","Founder","Website"],
      ...startups.map(s => [s.name,s.handle,s.category,String(s.followers),s.growth,s.founder,s.website])];
    const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = "startup-intelligence-export.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="topbar">
        <div className="shell" style={{display:"flex",alignItems:"center",width:"100%"}}>
          <a className="brand" href="#"><span className="brand-mark">SI</span> Startup Intelligence</a>
          <nav className="nav"><a href="#explore">Explore</a><a href="#insights">Insights</a><a href="#pricing">Pricing</a></nav>
          <div className="top-actions"><button className="btn" onClick={() => document.getElementById("request-access")?.scrollIntoView({behavior:"smooth"})}>Request access</button><button className="btn btn-primary" onClick={() => document.getElementById("explore")?.scrollIntoView({behavior:"smooth"})}>Explore startups <ArrowUpRight size={14} style={{display:"inline",verticalAlign:"middle"}} /></button></div>
        </div>
      </header>

      <main className="shell">
        <section className="hero">
          <div><div className="eyebrow"><Sparkles size={13} style={{display:"inline",verticalAlign:"middle"}} /> The startup discovery platform</div>
            <h1>Find the startups gaining momentum before everyone else.</h1>
            <p>Research emerging companies, discover founders, and explore audience signals in one searchable workspace. Built for investors, operators, researchers, and startup teams.</p>
          </div>
          <div className="hero-note"><strong>Signal over noise.</strong><span>Explore company profiles, founder information, audience size, growth signals, and source links — with data confidence made visible.</span></div>
        </section>

        <section className="stats" aria-label="Platform metrics">
          <div className="stat"><div className="number">10K–1M</div><div className="label">Target X audience range</div></div>
          <div className="stat"><div className="number">{startups.length || "—"}</div><div className="label">Profiles matching filters</div></div>
          <div className="stat"><div className="number">{savedCount}</div><div className="label">Profiles saved in this browser</div></div>
        </section>

        <section id="explore">
          <div style={{display:"flex",alignItems:"end",justifyContent:"space-between",gap:15,marginBottom:16}}>
            <div><div className="eyebrow">Discover</div><h2 style={{fontSize:27,letterSpacing:"-.04em",margin:"7px 0 0"}}>Startup directory</h2></div>
            <button className="btn" onClick={exportCsv}><Database size={14} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/> Export current results</button>
          </div>
          <div className="workspace">
            <aside className="panel">
              <div className="panel-head">Filters <span style={{color:"#849087",fontWeight:500}}>Refine list</span></div>
              <div className="filters">
                <label className="field-label" htmlFor="category">Industry</label>
                <select id="category" className="select" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select>
                <label className="field-label" htmlFor="min">Minimum followers</label>
                <select id="min" className="select" value={minFollowers} onChange={e=>setMinFollowers(e.target.value)}><option value="10000">10,000+</option><option value="25000">25,000+</option><option value="50000">50,000+</option><option value="100000">100,000+</option><option value="250000">250,000+</option></select>
                <label className="field-label" htmlFor="max">Maximum followers</label>
                <select id="max" className="select" value={maxFollowers} onChange={e=>setMaxFollowers(e.target.value)}><option value="100000">100,000</option><option value="250000">250,000</option><option value="500000">500,000</option><option value="1000000">1,000,000</option></select>
                <label className="field-label" htmlFor="sort">Sort by</label>
                <select id="sort" className="select" value={sort} onChange={e=>setSort(e.target.value)}><option value="followers">Audience size</option><option value="growth">Growth signal</option><option value="name">Company name</option></select>
                <p style={{fontSize:11,color:"#7b887f",lineHeight:1.6,marginTop:18}}>Profiles shown here use illustrative demo data until a verified data source is connected.</p>
              </div>
            </aside>

            <div>
              <div className="results-top">
                <div className="search-wrap"><Search size={15} className="search-symbol"/><input className="field" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search startups, founders, categories..." aria-label="Search startups"/></div>
                <span className="result-count">{loading ? "Loading…" : `${startups.length} results`}</span>
              </div>
              <div className="cards">
                {!loading && startups.length === 0 && <div className="empty"><Search size={22} style={{margin:"0 auto 10px"}}/><strong>No matching startups</strong><p>Try a broader search or adjust the filters.</p><button className="btn" onClick={()=>{setQuery("");setCategory("All categories");setMinFollowers("10000");setMaxFollowers("1000000");}}>Reset filters</button></div>}
                {startups.map(s=><article className="startup-card" key={s.id}>
                  <div className="card-top"><div className="logo">{s.name.slice(0,2).toUpperCase()}</div><div style={{minWidth:0}}><div className="company-name">{s.name}</div><div className="company-handle">{s.handle}</div></div><button className={`save ${saved.includes(s.id)?"active":""}`} title={saved.includes(s.id)?"Remove saved profile":"Save profile"} aria-label={saved.includes(s.id)?"Remove saved profile":"Save profile"} onClick={()=>toggleSaved(s.id)}><Bookmark size={15} fill={saved.includes(s.id)?"currentColor":"none"}/></button></div>
                  <p className="description">{s.description}</p>
                  <div className="tags"><span className="tag">{s.category}</span><span className="tag">{s.stage}</span>{s.verified&&<span className="tag verified"><CheckCircle2 size={10} style={{display:"inline",verticalAlign:"middle"}}/> Profile reviewed</span>}</div>
                  <div className="metrics"><div className="metric"><strong>{fmt(s.followers)}</strong><span>X followers*</span></div><div className="metric"><strong>{s.growth}</strong><span>Demo signal*</span></div><div className="metric"><strong>{s.founded}</strong><span>Founded</span></div></div>
                  <div className="card-bottom"><span className="signal"><Sparkles size={11} style={{display:"inline",verticalAlign:"middle"}}/> {s.signal}</span><button className="small-link" onClick={()=>setSelected(s)}>View profile <ArrowUpRight size={12} style={{display:"inline",verticalAlign:"middle"}}/></button></div>
                </article>)}
              </div>
              <p style={{fontSize:10,color:"#89948c",lineHeight:1.6,marginTop:14}}> *All audience and growth figures in this starter project are illustrative demo values, not live measurements.</p>
            </div>
          </div>
        </section>

        <section id="insights" className="section">
          <div className="eyebrow">Research workflow</div><h2>From discovery to decision.</h2><p className="section-intro">Build a shortlist, compare public signals, and inspect the source links behind each company profile. A future production data pipeline can replace the sample data.</p>
          <div className="stats" style={{marginTop:22}}>
            <div className="stat"><ShieldCheck size={20} color="#176b4d"/><div style={{fontWeight:800,marginTop:10}}>Source transparency</div><div className="label">Keep source URLs and last-checked timestamps with each record.</div></div>
            <div className="stat"><Bookmark size={20} color="#176b4d"/><div style={{fontWeight:800,marginTop:10}}>Shortlists</div><div className="label">Save interesting companies in this browser and export filtered results.</div></div>
            <div className="stat"><Database size={20} color="#176b4d"/><div style={{fontWeight:800,marginTop:10}}>Structured profiles</div><div className="label">Use consistent fields for founders, stage, category, and audience signals.</div></div>
          </div>
        </section>

        <section id="pricing" className="section">
          <div className="eyebrow">Plans</div><h2>Choose a research workflow.</h2><p className="section-intro">Pricing is a product placeholder. These plans are not connected to billing yet.</p>
          <div className="pricing">
            <div className="price-card"><h3>Explorer</h3><div className="price">$0 <small>/ month</small></div><p>For trying the directory and building an initial shortlist.</p><ul><li>Browse demo profiles</li><li>Basic filters and search</li><li>Local saved profiles</li></ul><button className="btn" style={{width:"100%"}} onClick={()=>document.getElementById("explore")?.scrollIntoView({behavior:"smooth"})}>Explore directory</button></div>
            <div className="price-card featured"><h3>Researcher</h3><div className="price">$29 <small>/ month</small></div><p>For independent researchers and startup operators.</p><ul><li>Planned advanced filters</li><li>Planned verified profile exports</li><li>Planned saved lists across devices</li></ul><button className="btn btn-primary" style={{width:"100%"}} onClick={()=>document.getElementById("request-access")?.scrollIntoView({behavior:"smooth"})}>Request early access</button></div>
            <div className="price-card"><h3>Team</h3><div className="price">$99 <small>/ month</small></div><p>For teams that share research and track markets.</p><ul><li>Planned shared workspaces</li><li>Planned team exports</li><li>Planned API access</li></ul><button className="btn" style={{width:"100%"}} onClick={()=>document.getElementById("request-access")?.scrollIntoView({behavior:"smooth"})}>Contact us</button></div>
          </div>
        </section>

        <section id="request-access" className="section">
          <div className="panel" style={{padding:24}}>
            <div className="eyebrow">Early access</div><h2 style={{marginTop:8}}>Help shape Startup Intelligence.</h2><p className="section-intro">Submit your email and research needs. Configure Supabase to save submissions; without it, the form runs in demo mode and does not persist data.</p>
            <form onSubmit={submitLead} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginTop:18}}>
              <input className="field" type="email" required placeholder="Work email" value={email} onChange={e=>setEmail(e.target.value)}/>
              <input className="field" placeholder="Company (optional)" value={company} onChange={e=>setCompany(e.target.value)}/>
              <input className="field" placeholder="What will you use it for? (optional)" value={useCase} onChange={e=>setUseCase(e.target.value)}/>
              <button className="btn btn-primary" disabled={leadLoading}>{leadLoading?"Submitting…":"Request access"}</button>
            </form>
            {leadMessage&&<p role="status" style={{fontSize:12,color:"#176b4d",marginTop:12}}>{leadMessage}</p>}
          </div>
        </section>
      </main>

      <footer className="footer"><div className="shell" style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><span>© 2026 Startup Intelligence</span><span>Research tool concept · Demo data is clearly labeled</span></div></footer>

      {selected&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div className="modal-head"><div className="logo" style={{width:54,height:54,fontSize:17}}>{selected.name.slice(0,2).toUpperCase()}</div><div><div className="eyebrow">{selected.category} · {selected.stage}</div><h2 id="profile-title" style={{marginTop:5}}>{selected.name}</h2><div style={{fontSize:12,color:"#77837b",marginTop:5}}>{selected.handle}</div></div><button className="modal-close" onClick={()=>setSelected(null)} aria-label="Close profile"><X size={17}/></button></div>
        <p style={{fontSize:13,color:"#66736a",lineHeight:1.7,marginTop:18}}>{selected.description}</p>
        <div className="modal-section"><h3>Company overview</h3><div className="detail-grid"><div className="detail"><span>X audience*</span><strong>{selected.followers.toLocaleString()}</strong></div><div className="detail"><span>Growth signal*</span><strong>{selected.growth}</strong></div><div className="detail"><span>Founder / team</span><strong>{selected.founder}</strong></div><div className="detail"><span>Founded</span><strong>{selected.founded}</strong></div><div className="detail"><span>Location</span><strong>{selected.location}</strong></div><div className="detail"><span>Last checked</span><strong>{selected.lastChecked}</strong></div></div></div>
        <div className="modal-section"><h3>Sources</h3><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{selected.sources.map(src=><a key={src} className="btn" href={src} target="_blank" rel="noreferrer">{new URL(src).hostname} <ExternalLink size={12} style={{display:"inline",verticalAlign:"middle"}}/></a>)}</div><div className="notice">Data confidence: this starter contains illustrative sample values. A “Profile reviewed” tag is a UI example, not a claim that the figures have been independently verified. Connect a permitted live data source and implement a review process before selling data.</div></div>
        <div style={{display:"flex",justifyContent:"space-between",gap:10,marginTop:20,flexWrap:"wrap"}}><button className="btn" onClick={()=>toggleSaved(selected.id)}>{saved.includes(selected.id)?"Remove from saved":"Save profile"}</button><a className="btn btn-primary" href={selected.website} target="_blank" rel="noreferrer">Visit company website <ArrowUpRight size={13} style={{display:"inline",verticalAlign:"middle"}}/></a></div>
      </section></div>}
    </>
  );
}
