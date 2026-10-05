import { useEffect, useState } from "react";
import { Minus, Square, X } from "lucide-react";
import { useStore } from "./store";
import { Slide } from "./ui";
import {
  BibleScreen, HomeScreen, IPhoneTransfer, LiveScreen, MediaLibrary, PhotoStudio,
  PlannerScreen, SettingsScreen, SongsScreen, ThemesScreen, VideoStudio, nav,
} from "./screens";

function ProjectorOnly() {
  const [packet, setPacket] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mediadesk-live") || "null"); } catch { return null; }
  });
  useEffect(() => {
    const ch = new BroadcastChannel("mediadesk");
    ch.onmessage = (e) => setPacket(e.data);
    const onStorage = () => {
      try { setPacket(JSON.parse(localStorage.getItem("mediadesk-live") || "null")); } catch { /* ignore */ }
    };
    window.addEventListener("storage", onStorage);
    return () => { ch.close(); window.removeEventListener("storage", onStorage); };
  }, []);
  const theme = packet?.theme ?? { primary: "#c9a44a", accent: "#f4efe4", font: "Fraunces", church: "Grace Chapel", id: "grace", name: "", lyricStyle: "", verseStyle: "", announceStyle: "", lowerThird: "", bg: "cross" };
  const payload = packet?.livePayload ?? { mode: "logo" };
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Slide payload={payload} theme={theme} church={packet?.churchName ?? "Grace Chapel"} bg={theme.bg} />
    </div>
  );
}

export default function App() {
  const s = useStore();
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 10000);
    return () => clearInterval(t);
  }, []);

  if (window.location.hash === "#projector") return <ProjectorOnly />;

  const Screen = {
    home: HomeScreen,
    video: VideoStudio,
    photo: PhotoStudio,
    iphone: IPhoneTransfer,
    library: MediaLibrary,
    songs: SongsScreen,
    bible: BibleScreen,
    planner: PlannerScreen,
    live: LiveScreen,
    themes: ThemesScreen,
    settings: SettingsScreen,
  }[s.screen];

  return (
    <div className="flex h-full items-center justify-center bg-[#07090d] p-3">
      <div className="desk-window flex h-full max-h-[980px] w-full max-w-[1440px] flex-col overflow-hidden rounded-xl border border-white/10 shadow-panel">
        <header className="flex h-9 shrink-0 items-center gap-3 border-b border-white/10 bg-ink-950/80 px-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-medium text-slate-100">
            <span className="grid h-4 w-4 place-items-center rounded-sm bg-gold-500 text-[10px] font-bold text-ink-950">M</span>
            MediaDesk
          </div>
          <span className="text-slate-500">Grace Chapel · Sunday Celebration</span>
          <div className="ml-auto flex items-center gap-3">
            <span>{clock}</span>
            <Minus size={14} className="opacity-60" />
            <Square size={12} className="opacity-60" />
            <X size={14} className="opacity-60" />
          </div>
        </header>
        <div className="flex min-h-0 flex-1">
          <nav className="flex w-52 shrink-0 flex-col border-r border-white/10 bg-ink-950/50 py-2">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => s.setScreen(item.id)}
                  className={`nav-btn mx-2 mb-0.5 flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-slate-300 hover:bg-white/5 ${s.screen === item.id ? "active" : ""}`}
                >
                  <Icon size={16} /> {item.label}
                </button>
              );
            })}
            <div className="mt-auto px-3 pb-3 text-[11px] text-slate-500">
              MediaDesk<br />Version 1.0 Prototype
            </div>
          </nav>
          <main className="min-w-0 flex-1 bg-ink-900/40">
            <Screen />
          </main>
        </div>
      </div>
      <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex w-80 flex-col gap-2">
        {s.toasts.map((t) => (
          <button key={t.id} onClick={() => s.dismissToast(t.id)} className="pointer-events-auto rounded-lg border border-white/10 bg-ink-850 px-3 py-2 text-left shadow-panel">
            <div className="text-sm font-medium">{t.title}</div>
            {t.body && <div className="text-xs text-slate-400">{t.body}</div>}
          </button>
        ))}
      </div>
      {s.projectorOpen && (
        <div className="fixed inset-0 z-50 bg-black">
          <Slide payload={s.livePayload} theme={s.theme} church={s.churchName} bg={s.lyricBg} />
          <button
            onClick={() => s.setProjectorOpen(false)}
            className="absolute right-3 top-3 rounded bg-black/40 px-2 py-1 text-[11px] text-white/70 hover:text-white"
          >
            Close projector simulation
          </button>
          <button
            onClick={() => window.open(`${window.location.pathname}${window.location.search}#projector`, "MediaDeskProjector", "noopener,width=1280,height=720")}
            className="absolute left-3 top-3 rounded bg-black/40 px-2 py-1 text-[11px] text-white/70 hover:text-white"
          >
            Pop out to second window
          </button>
        </div>
      )}
    </div>
  );
}
