import type { ReactNode } from "react";
import type { LivePayload, ThemePreset } from "./types";

export function Slide({
  payload,
  theme,
  church,
  compact = false,
  bg = "cross",
}: {
  payload: LivePayload;
  theme: ThemePreset;
  church: string;
  compact?: boolean;
  bg?: string;
}) {
  if (payload.mode === "black") {
    return <div className="absolute inset-0 bg-black" />;
  }
  if (payload.mode === "clear") {
    return <div className="absolute inset-0 bg-[#050608]" />;
  }
  return (
    <div className={`stage ${bg} absolute inset-0 flex flex-col items-center justify-center text-center px-8 ${compact ? "px-4" : "px-16"}`}>
      <div className="absolute top-4 left-5 text-[10px] tracking-[0.28em] uppercase opacity-70" style={{ color: theme.primary }}>
        {church}
      </div>
      {payload.mode === "logo" && (
        <div>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full border border-white/20 grid place-items-center" style={{ color: theme.primary }}>
            <span className="font-display text-2xl">G</span>
          </div>
          <div className="font-display text-4xl" style={{ color: theme.accent }}>{church}</div>
          <div className="mt-2 tracking-[0.32em] text-xs uppercase opacity-70" style={{ color: theme.primary }}>Welcome</div>
        </div>
      )}
      {payload.mode === "welcome" && (
        <div>
          <div className="tracking-[0.35em] text-xs uppercase mb-3" style={{ color: theme.primary }}>Sunday Celebration</div>
          <div className="font-display text-5xl leading-tight" style={{ color: theme.accent }}>{church}</div>
          <div className="mt-4 text-lg opacity-80">Welcome · 10:00 AM</div>
        </div>
      )}
      {payload.mode === "song" && (
        <div className="max-w-4xl">
          <div className="text-xs tracking-[0.28em] uppercase mb-4" style={{ color: theme.primary }}>{payload.section} · {payload.title}</div>
          {payload.lines.map((line) => (
            <div key={line} className={`${compact ? "text-lg" : "text-4xl"} font-display leading-snug mb-2`} style={{ color: theme.accent, fontFamily: theme.font === "Fraunces" ? "Fraunces, serif" : "Outfit, sans-serif" }}>
              {line}
            </div>
          ))}
        </div>
      )}
      {payload.mode === "bible" && (
        <div className="max-w-4xl">
          <div className={`${compact ? "text-xl" : "text-4xl"} font-display leading-snug`} style={{ color: theme.accent }}>{payload.text}</div>
          <div className="mt-5 tracking-[0.22em] text-sm uppercase" style={{ color: theme.primary }}>{payload.ref}</div>
        </div>
      )}
      {(payload.mode === "announce" || payload.mode === "text") && (
        <div>
          <div className="text-xs tracking-[0.28em] uppercase mb-3" style={{ color: theme.primary }}>{payload.mode === "announce" ? "Announcement" : "On screen"}</div>
          <div className="font-display text-5xl" style={{ color: theme.accent }}>{payload.title}</div>
          <div className="mt-3 text-xl opacity-80">{payload.body}</div>
        </div>
      )}
      {payload.mode === "countdown" && (
        <div>
          <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: theme.primary }}>{payload.label}</div>
          <div className="font-display text-7xl" style={{ color: theme.accent }}>10:00</div>
        </div>
      )}
      {payload.mode === "media" && (
        <div className="w-full h-full absolute inset-0">
          <div className="thumb absolute inset-0" style={{ ["--h" as string]: payload.hue }} />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute bottom-8 left-8 text-left">
            <div className="text-xs tracking-[0.24em] uppercase" style={{ color: theme.primary }}>{payload.kind}</div>
            <div className="font-display text-4xl text-white">{payload.title}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  kind = "ghost",
  tip,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: "ghost" | "gold" | "danger" | "blue";
  tip?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const cls =
    kind === "gold"
      ? "bg-gold-500 text-ink-950 hover:bg-gold-400"
      : kind === "danger"
        ? "bg-rose-500/15 text-rose-200 border border-rose-400/30 hover:bg-rose-500/25"
        : kind === "blue"
          ? "bg-sky-500/15 text-sky-100 border border-sky-400/30 hover:bg-sky-500/25"
          : "bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10";
  return (
    <button
      type={type}
      disabled={disabled}
      data-tip={tip}
      onClick={onClick}
      className={`tooltip inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-6" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-ink-850 shadow-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="font-medium">{title}</div>
          <button className="text-slate-400 hover:text-white" onClick={onClose}>Close</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
