import { useMemo, useState } from "react";
import {
  Clapperboard, Image as ImageIcon, Smartphone, Library, Music2, BookOpen,
  CalendarRange, MonitorPlay, Palette, Settings, Home, Plus, Search, Star,
  LayoutGrid, List, Play, Pause, SkipForward, SkipBack, Square, ChevronUp,
  ChevronDown, Trash2, Scissors, Volume2, Type, Download, Crop, RotateCw,
  SunMedium, Contrast, Sparkles, FileImage, Check, FolderOpen,
} from "lucide-react";
import { books, kjv, phoneFiles, songs, themes } from "./data";
import { payloadFor, useStore } from "./store";
import type { MediaKind, ServiceItem, ServiceKind } from "./types";
import { Btn, Modal, Slide } from "./ui";

export function HomeScreen() {
  const s = useStore();
  const recent = s.media.slice(0, 4);
  return (
    <div className="h-full overflow-auto p-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="text-xs tracking-[0.22em] uppercase text-gold-400">Sunday desk</div>
          <h1 className="text-2xl font-semibold">Good morning, Blessing</h1>
          <p className="text-sm text-slate-400">Grace Chapel · next service in the planner · prototype walkthrough ready</p>
        </div>
        <Btn kind="gold" onClick={() => { s.setScreen("live"); s.pushToast("Presentation ready", "Preview is staged. Send it live when you are."); }}>Go to Live Projection</Btn>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          ["Start New Service", "Blank running order", () => { s.setService([]); s.setScreen("planner"); }],
          ["Continue Recent Service", "Sunday Celebration · 18 items", () => s.setScreen("planner")],
          ["Import from iPhone", "Blessing’s iPhone connected", () => s.setScreen("iphone")],
          ["Edit Video", "Open Sunday welcome clip", () => s.setScreen("video")],
          ["Batch Edit Photos", "Crop, grade, watermark", () => s.setScreen("photo")],
          ["Open Media Library", `${s.media.length} assets`, () => s.setScreen("library")],
          ["Songs & Lyrics", "5 titles staged", () => s.setScreen("songs")],
          ["Bible", "John 3 ready", () => s.setScreen("bible")],
        ].map(([label, sub, fn]) => (
          <button key={String(label)} onClick={fn as () => void} className="rounded-xl border border-white/10 bg-ink-850 p-4 text-left hover:border-gold-500/40 hover:bg-ink-800 transition">
            <div className="font-medium">{label as string}</div>
            <div className="mt-1 text-xs text-slate-400">{sub as string}</div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 rounded-xl border border-white/10 bg-ink-850 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-medium">Upcoming service</div>
            <Btn onClick={() => s.setScreen("planner")}>Open planner</Btn>
          </div>
          <div className="rounded-lg border border-gold-500/30 bg-gold-500/10 p-4">
            <div className="text-lg font-semibold">Sunday Celebration Service</div>
            <div className="text-sm text-slate-300">Sunday 10:00 AM · {s.service.length} service items · {s.service.reduce((a, b) => a + b.minutes, 0)} min planned</div>
          </div>
          <div className="mt-3 space-y-1">
            {s.service.slice(0, 6).map((item, i) => (
              <div key={item.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-white/5">
                <span className="text-slate-400 w-6">{i + 1}</span>
                <span className="flex-1">{item.title}</span>
                <span className="text-slate-500">{item.minutes}m</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2 rounded-xl border border-white/10 bg-ink-850 p-4">
          <div className="mb-3 font-medium">Recently imported media</div>
          <div className="grid grid-cols-2 gap-2">
            {recent.map((m) => (
              <button key={m.id} onClick={() => s.setScreen("library")} className="overflow-hidden rounded-lg border border-white/10 text-left">
                <div className="thumb h-20" style={{ ["--h" as string]: m.hue }} />
                <div className="px-2 py-1.5 text-xs">{m.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VideoStudio() {
  const s = useStore();
  const clips = s.media.filter((m) => m.kind === "video");
  const [order, setOrder] = useState<string[]>(() => clips.slice(0, 3).map((c) => c.id));
  const [sel, setSel] = useState(order[0] ?? clips[0]?.id ?? "");
  const [volume, setVolume] = useState(80);
  const [fade, setFade] = useState(12);
  const [text, setText] = useState("Welcome to Grace Chapel");
  const [showText, setShowText] = useState(true);
  const [transition, setTransition] = useState("Cross dissolve");
  const [playhead, setPlayhead] = useState(34);
  const [playing, setPlaying] = useState(false);
  const [trim, setTrim] = useState(8);

  const active = s.media.find((m) => m.id === sel) ?? clips[0];

  const split = () => {
    if (!sel) return;
    const id = sel + "-b";
    setOrder((o) => {
      const i = o.indexOf(sel);
      if (i < 0) return o;
      return [...o.slice(0, i + 1), id, ...o.slice(i + 1)];
    });
    s.pushToast("Clip split", "Playhead cut applied on the timeline.");
  };
  const remove = () => setOrder((o) => o.filter((id) => id !== sel));
  const move = (dir: number) => {
    setOrder((o) => {
      const i = o.indexOf(sel);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= o.length) return o;
      const n = [...o];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  };

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-64 shrink-0 border-r border-white/10 p-3 overflow-auto">
        <div className="mb-2 text-xs tracking-widest uppercase text-slate-400">Import</div>
        <Btn kind="blue" onClick={() => s.setScreen("iphone")}>Import media</Btn>
        <div className="mt-4 space-y-2">
          {clips.map((c) => (
            <button key={c.id} onClick={() => { setSel(c.id); if (!order.includes(c.id)) setOrder((o) => [...o, c.id]); }} className={`flex w-full gap-2 rounded-md border p-2 text-left ${sel === c.id ? "border-gold-500/50 bg-white/5" : "border-white/10"}`}>
              <div className="thumb h-10 w-14 rounded" style={{ ["--h" as string]: c.hue }} />
              <div>
                <div className="text-sm">{c.name}</div>
                <div className="text-[11px] text-slate-400">{c.duration} · {c.size}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative m-4 min-h-[240px] flex-1 overflow-hidden rounded-xl border border-white/10">
          <div className="thumb absolute inset-0" style={{ ["--h" as string]: active?.hue ?? 30 }} />
          <div className="absolute inset-0 bg-black/30" />
          {showText && <div className="absolute bottom-10 left-0 right-0 text-center font-display text-3xl text-white drop-shadow">{text}</div>}
          <div className="absolute left-3 top-3 rounded bg-black/50 px-2 py-1 text-xs">{playing ? "Playing" : "Paused"} · {transition}</div>
        </div>
        <div className="mx-4 mb-2 flex flex-wrap items-center gap-2">
          <Btn tip="Play / pause" onClick={() => setPlaying((p) => !p)}>{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : "Play"}</Btn>
          <Btn tip="Trim in-point" onClick={() => { setTrim((t) => t + 4); s.pushToast("Trim updated", "In-point moved on selected clip."); }}><Scissors size={14} /> Trim</Btn>
          <Btn tip="Split at playhead" onClick={split}><Scissors size={14} /> Split</Btn>
          <Btn tip="Delete clip" kind="danger" onClick={remove}><Trash2 size={14} /> Delete</Btn>
          <Btn tip="Move earlier" onClick={() => move(-1)}>Reorder left</Btn>
          <Btn tip="Move later" onClick={() => move(1)}>Reorder right</Btn>
          <Btn tip="Add bed music" onClick={() => s.pushToast("Music added", "Soft Piano Bed placed on audio track.")}><Music2 size={14} /> Add music</Btn>
          <Btn kind="gold" tip="Export timeline" onClick={() => s.pushToast("Export queued", "1080p · H.264 · Sunday_Welcome_edit.mp4")}><Download size={14} /> Export</Btn>
        </div>
        <div className="mx-4 mb-4 grid grid-cols-3 gap-3 text-xs text-slate-300">
          <label className="flex items-center gap-2">Volume <Volume2 size={12} /> <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(+e.target.value)} className="flex-1" /> {volume}</label>
          <label className="flex items-center gap-2">Fade <input type="range" value={fade} onChange={(e) => setFade(+e.target.value)} className="flex-1" /> {fade / 10}s</label>
          <label className="flex items-center gap-2">Text <Type size={12} /> <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded bg-black/30 px-2 py-1" /></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} /> Overlay</label>
          <label>Transition
            <select value={transition} onChange={(e) => setTransition(e.target.value)} className="ml-2 rounded bg-black/30 px-2 py-1">
              {["Cut", "Cross dissolve", "Fade to black", "Dip to logo"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <div className="border-t border-white/10 bg-black/30 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Timeline · trim {trim}f · playhead {playhead}%</span>
            <input type="range" value={playhead} onChange={(e) => setPlayhead(+e.target.value)} className="w-48" />
          </div>
          <div className="relative h-24 rounded-md bg-ink-950 p-2">
            <div className="absolute top-0 bottom-0 w-px bg-gold-400" style={{ left: `${playhead}%` }} />
            <div className="mb-1 flex h-8 gap-1">
              {order.map((id) => {
                const c = s.media.find((m) => m.id === id) ?? clips.find((m) => id.startsWith(m.id));
                return (
                  <button key={id} onClick={() => setSel(id)} className={`h-8 min-w-[90px] rounded px-2 text-left text-[11px] ${sel === id ? "ring-1 ring-gold-400" : ""}`} style={{ background: `hsl(${c?.hue ?? 30} 40% 32%)` }}>
                    {c?.name ?? "Split"} {id.endsWith("-b") ? "· B" : ""}
                  </button>
                );
              })}
            </div>
            <div className="flex h-6 items-center rounded bg-emerald-900/50 px-2 text-[11px] text-emerald-100">Audio · Soft Piano Bed · vol {volume}</div>
            <div className="mt-1 flex h-6 items-center rounded bg-sky-900/40 px-2 text-[11px] text-sky-100">Text · {showText ? text : "hidden"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PhotoStudio() {
  const s = useStore();
  const photos = s.media.filter((m) => m.kind === "photo" || m.kind === "background" || m.kind === "graphic");
  const [picked, setPicked] = useState<string[]>(photos.slice(0, 3).map((p) => p.id));
  const [active, setActive] = useState(photos[0]?.id ?? "");
  const [bright, setBright] = useState(105);
  const [contrast, setContrast] = useState(110);
  const [sharp, setSharp] = useState(20);
  const [rotate, setRotate] = useState(0);
  const [crop, setCrop] = useState("16:9");
  const [format, setFormat] = useState("JPG");
  const [logo, setLogo] = useState(true);
  const [rename, setRename] = useState("GraceChapel_");
  const [before, setBefore] = useState(false);
  const photo = photos.find((p) => p.id === active) ?? photos[0];
  const filter = before ? "none" : `brightness(${bright}%) contrast(${contrast}%)`;

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-72 shrink-0 overflow-auto border-r border-white/10 p-3">
        <div className="mb-2 text-xs uppercase tracking-widest text-slate-400">Batch select</div>
        <div className="grid grid-cols-2 gap-2">
          {photos.map((p) => {
            const on = picked.includes(p.id);
            return (
              <button key={p.id} onClick={() => { setActive(p.id); setPicked((ids) => on ? ids.filter((i) => i !== p.id) : [...ids, p.id]); }} className={`overflow-hidden rounded-md border text-left ${on ? "border-gold-400" : "border-white/10"}`}>
                <div className="thumb h-16" style={{ ["--h" as string]: p.hue, filter }} />
                <div className="flex items-center justify-between px-1.5 py-1 text-[11px]">
                  <span className="truncate">{p.name}</span>{on && <Check size={12} />}
                </div>
              </button>
            );
          })}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="font-medium">{photo?.name}</div>
            <div className="text-xs text-slate-400">{picked.length} selected · {before ? "Before" : "After"}</div>
          </div>
          <div className="flex gap-2">
            <Btn onClick={() => setBefore((b) => !b)}>{before ? "Show after" : "Show before"}</Btn>
            <Btn kind="gold" onClick={() => s.pushToast("Export selected", `${picked.length} files · ${format} · ${rename}`)}><Download size={14} /> Export selected</Btn>
            <Btn onClick={() => s.pushToast("Export all", `${photos.length} files written to Media Library`)}>Export all</Btn>
          </div>
        </div>
        <div className="relative mb-4 min-h-[260px] flex-1 overflow-hidden rounded-xl border border-white/10 bg-black">
          <div className="thumb absolute inset-8" style={{ ["--h" as string]: photo?.hue ?? 40, filter, transform: `rotate(${rotate}deg)`, outline: crop === "1:1" ? "2px solid rgba(201,164,74,.7)" : undefined }} />
          {logo && !before && <div className="absolute bottom-6 right-8 rounded bg-black/50 px-2 py-1 text-xs tracking-widest text-gold-300">GRACE CHAPEL</div>}
        </div>
        <div className="grid grid-cols-4 gap-3 text-sm">
          <label className="flex items-center gap-2"><Crop size={14} /> Crop
            <select value={crop} onChange={(e) => setCrop(e.target.value)} className="ml-auto rounded bg-black/40 px-2 py-1">{["16:9", "4:3", "1:1", "Original"].map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="flex items-center gap-2"><ImageIcon size={14} /> Resize <span className="ml-auto text-slate-400">1920×1080</span></label>
          <label className="flex items-center gap-2"><RotateCw size={14} /> Rotate <input type="range" min={-15} max={15} value={rotate} onChange={(e) => setRotate(+e.target.value)} /></label>
          <label className="flex items-center gap-2"><SunMedium size={14} /> Brightness <input type="range" min={70} max={140} value={bright} onChange={(e) => setBright(+e.target.value)} /></label>
          <label className="flex items-center gap-2"><Contrast size={14} /> Contrast <input type="range" min={80} max={150} value={contrast} onChange={(e) => setContrast(+e.target.value)} /></label>
          <label className="flex items-center gap-2"><Sparkles size={14} /> Sharpen <input type="range" value={sharp} onChange={(e) => setSharp(+e.target.value)} /></label>
          <label className="flex items-center gap-2">Compression <input type="range" defaultValue={78} /></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={logo} onChange={(e) => setLogo(e.target.checked)} /> Church logo</label>
          <label className="flex items-center gap-2">Rename <input value={rename} onChange={(e) => setRename(e.target.value)} className="w-32 rounded bg-black/40 px-2 py-1" /></label>
          <label className="flex items-center gap-2"><FileImage size={14} />
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="rounded bg-black/40 px-2 py-1">{["JPG", "PNG", "WebP"].map((f) => <option key={f}>{f}</option>)}</select>
          </label>
        </div>
      </div>
    </div>
  );
}

export function IPhoneTransfer() {
  const s = useStore();
  const [sel, setSel] = useState<string[]>(["p1", "p3", "p4", "p5"]);
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const [dest, setDest] = useState("Media Library / Sunday Import");
  const [phase, setPhase] = useState<"browse" | "transfer" | "done">("browse");
  const [progress, setProgress] = useState(0);
  const shown = phoneFiles.filter((f) => filter === "all" || f.kind === filter);

  const start = () => {
    if (!sel.length) return s.pushToast("Nothing selected", "Choose at least one file.");
    setPhase("transfer");
    setProgress(8);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(100, p + 9);
      });
    }, 180);
    setTimeout(() => {
      s.importFiles(sel);
      setPhase("done");
      s.pushToast("Import complete", `${sel.length} files added to Media Library`);
    }, 2200);
  };

  if (phase === "transfer") {
    return (
      <div className="grid h-full place-items-center">
        <div className="w-[460px] rounded-2xl border border-white/10 bg-ink-850 p-6 shadow-panel">
          <div className="mb-1 text-xs tracking-[0.2em] uppercase text-gold-400">Transferring</div>
          <div className="text-xl font-semibold">Blessing’s iPhone</div>
          <div className="mt-1 text-sm text-slate-400">{sel.length} files → {dest}</div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/40">
            <div className="h-full bg-gold-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 text-xs text-slate-400">{progress < 100 ? `Copying ${phoneFiles.find((f) => sel.includes(f.id))?.name ?? "media"}…` : "Finishing library index"} · {progress}%</div>
        </div>
      </div>
    );
  }
  if (phase === "done") {
    return (
      <div className="grid h-full place-items-center">
        <div className="w-[480px] rounded-2xl border border-emerald-400/30 bg-ink-850 p-6 text-center shadow-panel">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-500/20 text-emerald-300"><Check /></div>
          <div className="text-xl font-semibold">Import Complete — {sel.length} files added to Media Library</div>
          <p className="mt-2 text-sm text-slate-400">Sunday video and photos are ready to edit or drop into the service.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Btn kind="gold" onClick={() => s.setScreen("library")}><FolderOpen size={14} /> Open Media Library</Btn>
            <Btn onClick={() => setPhase("browse")}>Import more</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col p-5">
      <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Smartphone className="text-emerald-300" />
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-300">iPhone connected</div>
            <div className="font-medium">Blessing’s iPhone · iOS 18 · 34 items available</div>
          </div>
        </div>
        <div className="text-xs text-slate-300">USB · Photos library</div>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Btn onClick={() => setSel(shown.map((f) => f.id))}>Select all</Btn>
        <Btn onClick={() => setSel([])}>Clear</Btn>
        <Btn kind={filter === "photo" ? "gold" : "ghost"} onClick={() => setFilter("photo")}>Photos only</Btn>
        <Btn kind={filter === "video" ? "gold" : "ghost"} onClick={() => setFilter("video")}>Videos only</Btn>
        <Btn kind={filter === "all" ? "gold" : "ghost"} onClick={() => setFilter("all")}>All</Btn>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-300">Destination
          <select value={dest} onChange={(e) => setDest(e.target.value)} className="rounded bg-black/40 px-2 py-1">
            <option>Media Library / Sunday Import</option>
            <option>Media Library / Photos</option>
            <option>Media Library / Videos</option>
          </select>
        </label>
        <Btn kind="gold" onClick={start}>Import selected ({sel.length})</Btn>
      </div>
      <div className="grid flex-1 grid-cols-4 gap-3 overflow-auto">
        {shown.map((f) => {
          const on = sel.includes(f.id);
          return (
            <button key={f.id} onClick={() => setSel((ids) => on ? ids.filter((i) => i !== f.id) : [...ids, f.id])} className={`overflow-hidden rounded-xl border text-left ${on ? "border-gold-400" : "border-white/10"}`}>
              <div className="thumb relative h-32" style={{ ["--h" as string]: f.hue }}>
                {on && <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-gold-500 text-ink-950"><Check size={12} /></span>}
                <span className="absolute bottom-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] uppercase">{f.kind}</span>
              </div>
              <div className="p-2">
                <div className="text-sm">{f.name}</div>
                <div className="text-[11px] text-slate-400">{f.size} · {f.date}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MediaLibrary() {
  const s = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | MediaKind>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [folder, setFolder] = useState("All folders");
  const [fav, setFav] = useState(false);
  const folders = ["All folders", "Sunday Import", "Backgrounds", "Photos", "Videos", "Audio", "Church Graphics"];
  const items = s.media.filter((m) => {
    if (cat !== "all" && m.kind !== cat) return false;
    if (fav && !m.favorite) return false;
    if (folder === "Sunday Import" && !m.fromPhone) return false;
    if (folder !== "All folders" && folder !== "Sunday Import" && m.folder !== folder) return false;
    if (q && !m.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const addToService = (m: typeof items[number]) => {
    const item: ServiceItem = {
      id: "sv-" + m.id,
      kind: m.kind === "video" ? "video" : "image",
      title: m.name,
      detail: `From library · ${m.folder}`,
      minutes: m.kind === "video" ? 3 : 1,
      payload: m.id,
    };
    s.setService([...s.service, item]);
    s.pushToast("Added to service", m.name);
  };

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-52 shrink-0 border-r border-white/10 p-3 text-sm">
        <div className="mb-2 text-xs uppercase tracking-widest text-slate-500">Folders</div>
        {folders.map((f) => (
          <button key={f} onClick={() => setFolder(f)} className={`mb-1 block w-full rounded px-2 py-1.5 text-left ${folder === f ? "bg-white/10" : "hover:bg-white/5"}`}>{f}</button>
        ))}
        <button onClick={() => setFav((v) => !v)} className={`mt-3 flex w-full items-center gap-2 rounded px-2 py-1.5 ${fav ? "bg-gold-500/15 text-gold-300" : ""}`}><Star size={14} /> Favorites</button>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-2 py-1.5">
            <Search size={14} className="text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search media" className="w-52 bg-transparent text-sm outline-none" />
          </div>
          {(["all", "photo", "video", "audio", "background", "graphic"] as const).map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-md px-2 py-1 text-xs capitalize ${cat === c ? "bg-gold-500 text-ink-950" : "bg-white/5"}`}>{c === "all" ? "All" : c === "graphic" ? "Church Graphics" : c === "background" ? "Backgrounds" : c + "s"}</button>
          ))}
          <div className="ml-auto flex gap-1">
            <Btn tip="Grid view" onClick={() => setView("grid")}><LayoutGrid size={14} /></Btn>
            <Btn tip="List view" onClick={() => setView("list")}><List size={14} /></Btn>
          </div>
        </div>
        <div className="mb-2 text-xs text-slate-500">{items.length} items · drag onto a service item or use Add to service · recently added float to the top</div>
        {view === "grid" ? (
          <div className="grid flex-1 grid-cols-4 gap-3 overflow-auto content-start">
            {items.map((m) => (
              <div key={m.id} draggable onDragStart={(e) => e.dataTransfer.setData("media", m.id)} className="overflow-hidden rounded-xl border border-white/10 bg-ink-850">
                <div className="thumb h-28" style={{ ["--h" as string]: m.hue }} />
                <div className="p-2">
                  <div className="flex items-center justify-between text-sm"><span className="truncate">{m.name}</span>{m.favorite && <Star size={12} className="text-gold-400" />}</div>
                  <div className="text-[11px] text-slate-400">{m.kind} · {m.added}{m.fromPhone ? " · iPhone" : ""}</div>
                  <div className="mt-2 flex gap-1">
                    <Btn onClick={() => { s.setVideoClipId(m.id); s.setScreen(m.kind === "video" ? "video" : "photo"); }}>Edit</Btn>
                    <Btn onClick={() => addToService(m)}>Add to service</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-auto">
            {items.map((m) => (
              <div key={m.id} className="flex items-center gap-3 border-b border-white/5 py-2 text-sm">
                <div className="thumb h-8 w-12 rounded" style={{ ["--h" as string]: m.hue }} />
                <div className="w-56 truncate">{m.name}</div>
                <div className="w-24 text-slate-400">{m.kind}</div>
                <div className="w-24 text-slate-400">{m.size}</div>
                <div className="flex-1 text-slate-500">{m.added}</div>
                <Btn onClick={() => addToService(m)}>Add to service</Btn>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SongsScreen() {
  const s = useStore();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(false);
  const song = songs.find((x) => x.id === s.selectedSongId) ?? songs[0];
  const section = song.sections[Math.min(s.songSection, song.sections.length - 1)];
  const filtered = songs.filter((x) => x.title.toLowerCase().includes(q.toLowerCase()));
  const payload = { mode: "song" as const, title: song.title, section: section.name, lines: section.lines };

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-72 shrink-0 border-r border-white/10 p-3">
        <div className="mb-2 flex items-center gap-2 rounded-md border border-white/10 px-2 py-1.5">
          <Search size={14} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search songs" className="w-full bg-transparent text-sm outline-none" />
        </div>
        {filtered.map((songItem) => (
          <button key={songItem.id} onClick={() => { s.setSelectedSongId(songItem.id); s.setSongSection(0); }} className={`mb-1 w-full rounded-md px-2 py-2 text-left ${songItem.id === song.id ? "bg-white/10" : "hover:bg-white/5"}`}>
            <div className="text-sm">{songItem.title}</div>
            <div className="text-[11px] text-slate-400">{songItem.key} · {songItem.tempo} bpm · {songItem.publicDomain ? "Public domain" : "Licensed placeholder"}</div>
          </button>
        ))}
      </aside>
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-4 p-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold">{song.title}</div>
              <div className="text-xs text-slate-400">{song.author}</div>
            </div>
            <div className="flex gap-2">
              <Btn onClick={() => setEditing(true)}>Edit song</Btn>
              <Btn onClick={() => {
                s.setService([...s.service, { id: "song-" + song.id + Date.now(), kind: "song", title: song.title, detail: `Key of ${song.key}`, minutes: 5, payload: song.id }]);
                s.pushToast("Added to service", song.title);
              }}>Add to service</Btn>
              <Btn onClick={() => { s.setPreviewIndex(s.service.findIndex((i) => i.payload === song.id) >= 0 ? s.service.findIndex((i) => i.payload === song.id) : s.previewIndex); s.setScreen("live"); }}>Preview</Btn>
              <Btn kind="gold" onClick={() => { s.setScreen("live"); s.pushToast("Staged for live", song.title); }}>Go live</Btn>
            </div>
          </div>
          <div className="space-y-2">
            {song.sections.map((sec, i) => (
              <button key={sec.name + i} onClick={() => s.setSongSection(i)} className={`w-full rounded-lg border px-3 py-2 text-left ${i === s.songSection ? "border-gold-500/50 bg-gold-500/10" : "border-white/10"}`}>
                <div className="text-xs uppercase tracking-widest text-gold-300">{sec.name}</div>
                <div className="text-sm text-slate-300">{sec.lines[0]}</div>
              </button>
            ))}
          </div>
          <div className="mt-4 text-xs text-slate-400">Background</div>
          <div className="mt-1 flex gap-2">
            {["cross", "sanctuary", "harvest", "dawn"].map((bg) => (
              <button key={bg} onClick={() => s.setLyricBg(bg)} className={`stage ${bg} h-12 w-16 rounded border ${s.lyricBg === bg ? "border-gold-400" : "border-white/10"}`} />
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-white/10">
          <Slide payload={payload} theme={s.theme} church={s.churchName} bg={s.lyricBg} />
        </div>
      </div>
      {editing && (
        <Modal title={`Edit ${song.title}`} onClose={() => setEditing(false)}>
          <p className="text-sm text-slate-300">Arrangement editor for the prototype. Section order, key, and operator notes would save with the song library in the Windows app.</p>
          <div className="mt-3 space-y-2 text-sm">
            <div>Key {song.key} · Tempo {song.tempo}</div>
            <div>{song.sections.map((sec) => sec.name).join(" · ")}</div>
          </div>
          <div className="mt-4"><Btn kind="gold" onClick={() => { setEditing(false); s.pushToast("Song saved", song.title); }}>Save arrangement</Btn></div>
        </Modal>
      )}
    </div>
  );
}

export function BibleScreen() {
  const s = useStore();
  const [query, setQuery] = useState("John 3:16");
  const verses = kjv[s.chapterKey] ?? kjv["John 3"];
  const text = s.selectedVerses.map((n) => verses[n - 1]).filter(Boolean).join(" ");
  const ref = `${s.chapterKey}:${s.selectedVerses.join(", ") || "—"}`;
  const payload = { mode: "bible" as const, ref, text: text || "Select a verse" };

  const jump = () => {
    const m = query.match(/john\s*3/i);
    if (m) {
      s.setBook("John");
      s.setChapterKey("John 3");
      s.pushToast("Passage found", "John 3");
    } else if (/psalm\s*23/i.test(query)) {
      s.setBook("Psalm");
      s.setChapterKey("Psalm 23");
    } else s.pushToast("Sample search", "Try John 3:16 or Psalm 23 in this prototype.");
  };

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-64 shrink-0 border-r border-white/10 p-3 text-sm">
        <div className="mb-2 text-xs uppercase tracking-widest text-slate-500">Offline Bible</div>
        <label className="mb-2 block text-xs text-slate-400">Translation
          <select value={s.translation} onChange={(e) => s.setTranslation(e.target.value)} className="mt-1 w-full rounded bg-black/40 px-2 py-1">
            {["KJV", "WEB (sample)", "ASV (sample)"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="mb-2 block text-xs text-slate-400">Book
          <select value={s.book} onChange={(e) => s.setBook(e.target.value)} className="mt-1 w-full rounded bg-black/40 px-2 py-1">{books.map((b) => <option key={b}>{b}</option>)}</select>
        </label>
        <label className="mb-2 block text-xs text-slate-400">Chapter
          <select value={s.chapterKey} onChange={(e) => s.setChapterKey(e.target.value)} className="mt-1 w-full rounded bg-black/40 px-2 py-1">
            {Object.keys(kjv).map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <div className="mt-3 flex gap-1">
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded bg-black/40 px-2 py-1" />
          <Btn onClick={jump}>Search</Btn>
        </div>
      </aside>
      <div className="grid min-w-0 flex-1 grid-cols-2">
        <div className="overflow-auto border-r border-white/10 p-4">
          <div className="mb-3 flex gap-2">
            <Btn onClick={() => {
              s.setService([...s.service, { id: "bib-" + Date.now(), kind: "bible", title: `Bible Reading — ${ref}`, detail: s.translation, minutes: 2, payload: "john-3-16" }]);
              s.pushToast("Added to service", ref);
            }}>Add to service</Btn>
            <Btn onClick={() => s.setScreen("live")}>Preview</Btn>
            <Btn kind="gold" onClick={() => { s.setScreen("live"); s.pushToast("Verse staged", ref); }}>Go live</Btn>
          </div>
          {verses.map((v, i) => {
            const n = i + 1;
            const on = s.selectedVerses.includes(n);
            return (
              <button key={n} onClick={() => s.toggleVerse(n)} className={`mb-2 block w-full rounded-md px-2 py-1 text-left text-sm ${on ? "bg-gold-500/15" : "hover:bg-white/5"}`}>
                <span className="mr-2 text-gold-400">{n}</span>{v}
              </button>
            );
          })}
        </div>
        <div className="relative m-4 overflow-hidden rounded-xl border border-white/10">
          <Slide payload={payload} theme={s.theme} church={s.churchName} bg={s.lyricBg} />
        </div>
      </div>
    </div>
  );
}

const addKinds: { kind: ServiceKind; title: string; detail: string }[] = [
  { kind: "song", title: "Song", detail: "Congregational" },
  { kind: "bible", title: "Bible Verse", detail: "Scripture slide" },
  { kind: "video", title: "Video", detail: "Media item" },
  { kind: "image", title: "Image", detail: "Still graphic" },
  { kind: "announcement", title: "Announcement", detail: "Youth night · Friday 6:30" },
  { kind: "text", title: "Text", detail: "Custom slide" },
  { kind: "blank", title: "Blank Screen", detail: "Clear output" },
  { kind: "countdown", title: "Countdown", detail: "Pre-service timer" },
];

export function PlannerScreen() {
  const s = useStore();
  const [adder, setAdder] = useState(false);
  const total = s.service.reduce((a, b) => a + b.minutes, 0);
  const move = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= s.service.length) return;
    const next = [...s.service];
    [next[i], next[j]] = [next[j], next[i]];
    s.setService(next);
  };
  const onDrop = (index: number, id: string) => {
    const media = s.media.find((m) => m.id === id);
    if (!media) return;
    const item: ServiceItem = { id: "drop-" + media.id, kind: media.kind === "video" ? "video" : "image", title: media.name, detail: "Dropped from library", minutes: 2, payload: media.id };
    const next = [...s.service];
    next.splice(index, 0, item);
    s.setService(next);
    s.pushToast("Dropped into service", media.name);
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold-400">Running order</div>
          <h2 className="text-xl font-semibold">Sunday Celebration Service</h2>
          <div className="text-sm text-slate-400">Sunday 10:00 AM · {s.service.length} items · {total} min · status {s.service.length ? "Ready" : "Empty"}</div>
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => setAdder(true)}><Plus size={14} /> Add item</Btn>
          <Btn kind="gold" onClick={() => { s.setPreviewIndex(0); s.setScreen("live"); s.pushToast("Presentation started", "Preview is on the first item."); }}>Start presentation</Btn>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded-xl border border-white/10">
        {s.service.map((item, i) => (
          <div
            key={item.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(i, e.dataTransfer.getData("media"))}
            className="flex items-center gap-3 border-b border-white/5 px-3 py-2 hover:bg-white/5"
          >
            <span className="w-6 text-slate-500">{i + 1}</span>
            <div className="w-28 text-[11px] uppercase tracking-wider text-gold-300/80">{item.kind}</div>
            <div className="flex-1">
              <div className="text-sm">{item.title}</div>
              <div className="text-xs text-slate-500">{item.detail}</div>
            </div>
            <div className="w-12 text-xs text-slate-400">{item.minutes}m</div>
            <Btn tip="Move up" onClick={() => move(i, -1)}><ChevronUp size={14} /></Btn>
            <Btn tip="Move down" onClick={() => move(i, 1)}><ChevronDown size={14} /></Btn>
            <Btn tip="Remove" kind="danger" onClick={() => s.setService(s.service.filter((x) => x.id !== item.id))}><Trash2 size={14} /></Btn>
          </div>
        ))}
        {!s.service.length && <div className="p-8 text-center text-slate-500">Empty service. Add a song, verse, or video.</div>}
      </div>
      {adder && (
        <Modal title="Add to service" onClose={() => setAdder(false)}>
          <div className="grid grid-cols-2 gap-2">
            {addKinds.map((k) => (
              <button key={k.kind} className="rounded-lg border border-white/10 px-3 py-2 text-left hover:border-gold-500/40" onClick={() => {
                const payload = k.kind === "song" ? "amazing-grace" : k.kind === "bible" ? "john-3-16" : undefined;
                const title = k.kind === "song" ? "Amazing Grace" : k.kind === "bible" ? "Bible Reading — John 3:16–17" : k.title;
                s.setService([...s.service, { id: k.kind + Date.now(), kind: k.kind, title, detail: k.detail, minutes: 3, payload }]);
                setAdder(false);
                s.pushToast("Item added", title);
              }}>
                <div className="text-sm">{k.title}</div>
                <div className="text-xs text-slate-400">{k.detail}</div>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

export function LiveScreen() {
  const s = useStore();
  const previewItem = s.service[s.previewIndex];
  const liveItem = s.service[s.liveIndex];
  const previewPayload = payloadFor(previewItem, s.churchName);
  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 text-xs tracking-[0.2em] text-sky-300">PREVIEW · operator</div>
            <div className="relative h-56 overflow-hidden rounded-xl border border-sky-400/30">
              <Slide payload={previewPayload} theme={s.theme} church={s.churchName} bg={s.lyricBg} compact />
            </div>
            <div className="mt-1 text-xs text-slate-400">Next: {previewItem?.title ?? "—"}</div>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs tracking-[0.2em] text-rose-300">LIVE · congregation <span className="h-2 w-2 rounded-full bg-rose-500" /></div>
            <div className="relative h-56 overflow-hidden rounded-xl border border-rose-400/40">
              <Slide payload={s.livePayload} theme={s.theme} church={s.churchName} bg={s.lyricBg} compact />
            </div>
            <div className="mt-1 text-xs text-slate-400">Current: {s.black ? "Black" : s.showLogo ? "Logo" : liveItem?.title}</div>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <Btn kind="gold" tip="Send preview to live output" onClick={s.goLive}>Go live</Btn>
          <Btn tip="Advance preview" onClick={s.next}><SkipForward size={14} /> Next</Btn>
          <Btn tip="Previous preview" onClick={s.prev}><SkipBack size={14} /> Previous</Btn>
          <Btn tip="Clear to empty screen" onClick={() => { s.setOutputMode("clear"); s.setBlack(false); s.setShowLogo(false); }}>Clear</Btn>
          <Btn tip="Blackout projector" onClick={() => s.setBlack(!s.black)}>Black</Btn>
          <Btn tip="Church logo" onClick={() => { s.setShowLogo(!s.showLogo); s.setBlack(false); }}>Logo</Btn>
          <Btn tip="Play or pause media" onClick={() => s.setPlaying(!s.playing)}>{s.playing ? <Pause size={14} /> : <Play size={14} />} {s.playing ? "Pause" : "Play"}</Btn>
          <Btn kind="blue" tip="Open clean projector output" onClick={() => s.setProjectorOpen(true)}>Open projector view</Btn>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-white/10 p-3">
            <div className="text-xs text-slate-500">Current item</div>
            <div className="font-medium">{liveItem?.title ?? "—"}</div>
          </div>
          <div className="rounded-lg border border-white/10 p-3">
            <div className="text-xs text-slate-500">Next item</div>
            <div className="font-medium">{s.service[s.liveIndex + 1]?.title ?? previewItem?.title ?? "—"}</div>
          </div>
        </div>
      </div>
      <aside className="w-72 shrink-0 overflow-auto border-l border-white/10 p-3">
        <div className="mb-2 text-xs uppercase tracking-widest text-slate-500">Service order</div>
        {s.service.map((item, i) => (
          <button key={item.id} onClick={() => s.setPreviewIndex(i)} className={`mb-1 w-full rounded-md px-2 py-2 text-left text-sm ${i === s.liveIndex ? "bg-rose-500/15" : i === s.previewIndex ? "bg-sky-500/15" : "hover:bg-white/5"}`}>
            <span className="mr-2 text-slate-500">{i + 1}</span>{item.title}
            {i === s.liveIndex && <span className="ml-2 text-[10px] text-rose-300">LIVE</span>}
          </button>
        ))}
      </aside>
    </div>
  );
}

export function ThemesScreen() {
  const s = useStore();
  const [font, setFont] = useState(s.theme.font);
  return (
    <div className="grid h-full grid-cols-5 gap-4 p-5">
      <div className="col-span-2 space-y-3 overflow-auto">
        <div className="text-xs uppercase tracking-widest text-slate-500">Presets</div>
        {themes.map((t) => (
          <button key={t.id} onClick={() => { s.setThemeId(t.id); setFont(t.font); }} className={`w-full rounded-xl border p-3 text-left ${s.theme.id === t.id ? "border-gold-400" : "border-white/10"}`}>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: t.primary }} />{t.name}</div>
            <div className="text-xs text-slate-400">{t.lyricStyle}</div>
          </button>
        ))}
        <label className="block text-sm">Church name
          <input value={s.churchName} onChange={(e) => s.setChurchName(e.target.value)} className="mt-1 w-full rounded bg-black/40 px-2 py-1" />
        </label>
        <label className="block text-sm">Logo mark
          <div className="mt-1 grid h-12 w-12 place-items-center rounded-full border border-white/20 font-display">G</div>
        </label>
        <label className="block text-sm">Primary
          <input type="color" value={s.theme.primary} readOnly className="mt-1 h-8 w-full bg-transparent" />
        </label>
        <label className="block text-sm">Font
          <select value={font} onChange={(e) => setFont(e.target.value)} className="mt-1 w-full rounded bg-black/40 px-2 py-1"><option>Fraunces</option><option>Outfit</option></select>
        </label>
        <div className="text-xs text-slate-400">Lyrics · {s.theme.lyricStyle}<br />Bible · {s.theme.verseStyle}<br />Announcements · {s.theme.announceStyle}<br />Lower thirds · {s.theme.lowerThird}</div>
      </div>
      <div className="col-span-3 grid grid-rows-2 gap-3">
        <div className="relative overflow-hidden rounded-xl border border-white/10">
          <Slide payload={{ mode: "song", title: "Amazing Grace", section: "Verse 1", lines: ["Amazing grace, how sweet the sound", "That saved a wretch like me"] }} theme={{ ...s.theme, font }} church={s.churchName} bg={s.theme.bg} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-xl border border-white/10">
            <Slide payload={{ mode: "bible", ref: "John 3:16", text: kjv["John 3"][15] }} theme={{ ...s.theme, font }} church={s.churchName} bg={s.theme.bg} compact />
          </div>
          <div className="relative overflow-hidden rounded-xl border border-white/10">
            <Slide payload={{ mode: "announce", title: "Youth Night", body: "Friday · 6:30 PM · Foyer" }} theme={{ ...s.theme, font }} church={s.churchName} bg={s.theme.bg} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsScreen() {
  const s = useStore();
  const [tab, setTab] = useState("General");
  const tabs = ["General", "Media Storage", "Projection Display", "Audio Output", "Default Bible Translation", "Import Settings", "Video Export", "Backup", "About"];
  return (
    <div className="flex h-full min-h-0">
      <aside className="w-64 shrink-0 border-r border-white/10 p-3">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`mb-1 block w-full rounded px-2 py-1.5 text-left text-sm ${tab === t ? "bg-white/10" : "hover:bg-white/5"}`}>{t}</button>
        ))}
      </aside>
      <div className="p-6 text-sm">
        <h2 className="mb-3 text-xl font-semibold">{tab}</h2>
        {tab === "General" && <div className="space-y-2 text-slate-300"><div>Church · {s.churchName}</div><div>Language · English</div><div>Startup · Home</div></div>}
        {tab === "Media Storage" && <div className="text-slate-300">Library path · D:\GraceChapel\MediaDesk<br />Used · 48.2 GB of 2 TB</div>}
        {tab === "Projection Display" && <div className="text-slate-300">Output · Display 2 · 1920×1080<br />Audience screen · fullscreen, no operator chrome</div>}
        {tab === "Audio Output" && <div className="text-slate-300">Main · Sanctuary mixer USB<br />Cue · Operator headphones</div>}
        {tab === "Default Bible Translation" && <div className="text-slate-300">Default · {s.translation}<br />Offline package · KJV included</div>}
        {tab === "Import Settings" && <div className="text-slate-300">iPhone · copy originals<br />Destination · Sunday Import folder</div>}
        {tab === "Video Export" && <div className="text-slate-300">1080p · H.264 · 12 Mbps · AAC stereo</div>}
        {tab === "Backup" && <div><Btn onClick={() => s.pushToast("Backup started", "Service plans and library index")}>Back up now</Btn></div>}
        {tab === "About" && (
          <div>
            <div className="font-display text-3xl text-gold-300">MediaDesk</div>
            <div className="mt-1">Version 1.0 Prototype</div>
            <p className="mt-3 max-w-md text-slate-400">Interactive proposal for an all-in-one media production and church presentation application. No media leaves this browser.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const nav = [
  { id: "home" as const, label: "Home", icon: Home },
  { id: "video" as const, label: "Video Studio", icon: Clapperboard },
  { id: "photo" as const, label: "Photo Studio", icon: ImageIcon },
  { id: "iphone" as const, label: "iPhone Transfer", icon: Smartphone },
  { id: "library" as const, label: "Media Library", icon: Library },
  { id: "songs" as const, label: "Songs & Lyrics", icon: Music2 },
  { id: "bible" as const, label: "Bible", icon: BookOpen },
  { id: "planner" as const, label: "Service Planner", icon: CalendarRange },
  { id: "live" as const, label: "Live Projection", icon: MonitorPlay },
  { id: "themes" as const, label: "Themes & Branding", icon: Palette },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

export function useClock() {
  return useMemo(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), []);
}
