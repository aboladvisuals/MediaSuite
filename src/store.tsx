import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { kjv, phoneFiles, seedMedia, seedService, songs, themes } from "./data";
import type { MediaItem, ScreenId, ServiceItem, ThemePreset, Toast } from "./types";

export type LivePayload =
  | { mode: "black" }
  | { mode: "logo" }
  | { mode: "clear" }
  | { mode: "countdown"; label: string }
  | { mode: "song"; title: string; section: string; lines: string[] }
  | { mode: "bible"; ref: string; text: string }
  | { mode: "announce"; title: string; body: string }
  | { mode: "text"; title: string; body: string }
  | { mode: "media"; title: string; kind: string; hue: number }
  | { mode: "welcome"; title: string };

type Store = {
  screen: ScreenId;
  setScreen: (s: ScreenId) => void;
  media: MediaItem[];
  service: ServiceItem[];
  setService: (items: ServiceItem[]) => void;
  theme: ThemePreset;
  setThemeId: (id: string) => void;
  churchName: string;
  setChurchName: (v: string) => void;
  toasts: Toast[];
  pushToast: (title: string, body?: string) => void;
  dismissToast: (id: string) => void;
  imported: boolean;
  importFiles: (ids: string[]) => void;
  selectedSongId: string;
  setSelectedSongId: (id: string) => void;
  songSection: number;
  setSongSection: (n: number) => void;
  lyricBg: string;
  setLyricBg: (v: string) => void;
  translation: string;
  setTranslation: (v: string) => void;
  book: string;
  setBook: (v: string) => void;
  chapterKey: string;
  setChapterKey: (v: string) => void;
  selectedVerses: number[];
  toggleVerse: (n: number) => void;
  liveIndex: number;
  previewIndex: number;
  setPreviewIndex: (n: number) => void;
  goLive: () => void;
  next: () => void;
  prev: () => void;
  outputMode: LivePayload["mode"] | "item";
  setOutputMode: (m: LivePayload["mode"] | "item") => void;
  black: boolean;
  setBlack: (v: boolean) => void;
  showLogo: boolean;
  setShowLogo: (v: boolean) => void;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  projectorOpen: boolean;
  setProjectorOpen: (v: boolean) => void;
  videoClipId: string | null;
  setVideoClipId: (id: string | null) => void;
  livePayload: LivePayload;
};

const Ctx = createContext<Store | null>(null);

function uid(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 8);
}

export function payloadFor(item: ServiceItem | undefined, themeName: string): LivePayload {
  if (!item) return { mode: "logo" };
  if (item.kind === "song") {
    const song = songs.find((s) => s.id === item.payload) ?? songs[0];
    const section = song.sections[0];
    return { mode: "song", title: song.title, section: section.name, lines: section.lines };
  }
  if (item.kind === "bible") {
    return {
      mode: "bible",
      ref: "John 3:16–17",
      text: `${kjv["John 3"][15]} ${kjv["John 3"][16]}`,
    };
  }
  if (item.kind === "announcement") {
    return { mode: "announce", title: item.title, body: item.detail || "Youth night this Friday · 6:30 PM" };
  }
  if (item.kind === "blank") return { mode: "clear" };
  if (item.kind === "countdown") return { mode: "countdown", label: item.title };
  if (item.kind === "video" || item.kind === "image") {
    return { mode: "media", title: item.title, kind: item.kind, hue: 32 };
  }
  if (item.kind === "welcome") return { mode: "welcome", title: themeName };
  return { mode: "text", title: item.title, body: item.detail };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>("home");
  const [media, setMedia] = useState<MediaItem[]>(seedMedia);
  const [service, setService] = useState<ServiceItem[]>(seedService);
  const [themeId, setThemeId] = useState("grace");
  const [churchName, setChurchName] = useState("Grace Chapel");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [imported, setImported] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState("amazing-grace");
  const [songSection, setSongSection] = useState(0);
  const [lyricBg, setLyricBg] = useState("cross");
  const [translation, setTranslation] = useState("KJV");
  const [book, setBook] = useState("John");
  const [chapterKey, setChapterKey] = useState("John 3");
  const [selectedVerses, setSelectedVerses] = useState<number[]>([16, 17]);
  const [liveIndex, setLiveIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(1);
  const [outputMode, setOutputMode] = useState<LivePayload["mode"] | "item">("item");
  const [black, setBlack] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [projectorOpen, setProjectorOpen] = useState(false);
  const [videoClipId, setVideoClipId] = useState<string | null>(null);

  const theme = useMemo(() => {
    const base = themes.find((t) => t.id === themeId) ?? themes[0];
    return { ...base, church: churchName };
  }, [themeId, churchName]);

  const pushToast = (title: string, body?: string) => {
    const id = uid("t");
    setToasts((t) => [...t, { id, title, body }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  const dismissToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const importFiles = (ids: string[]) => {
    const added: MediaItem[] = phoneFiles
      .filter((f) => ids.includes(f.id))
      .map((f) => ({
        id: "imp-" + f.id,
        name: f.name.replace(/\.(mov|jpg)$/i, ""),
        kind: f.kind,
        folder: f.kind === "video" ? "Videos" : "Photos",
        size: f.size,
        added: "Just now",
        favorite: false,
        fromPhone: true,
        hue: f.hue,
        duration: f.kind === "video" ? "2:14" : undefined,
        note: "Imported from Blessing’s iPhone",
      }));
    setMedia((m) => [...added, ...m]);
    setImported(true);
    if (added[0]) setVideoClipId(added[0].id);
  };

  const toggleVerse = (n: number) => {
    setSelectedVerses((cur) => (cur.includes(n) ? cur.filter((v) => v !== n) : [...cur, n].sort((a, b) => a - b)));
  };

  const livePayload: LivePayload = useMemo(() => {
    if (black) return { mode: "black" };
    if (showLogo) return { mode: "logo" };
    if (outputMode === "clear") return { mode: "clear" };
    if (outputMode === "countdown") return { mode: "countdown", label: "Service begins" };
    return payloadFor(service[liveIndex], churchName);
  }, [black, showLogo, outputMode, service, liveIndex, churchName]);

  useEffect(() => {
    const packet = { livePayload, theme, churchName, playing };
    localStorage.setItem("mediadesk-live", JSON.stringify(packet));
    const ch = new BroadcastChannel("mediadesk");
    ch.postMessage(packet);
    ch.close();
  }, [livePayload, theme, churchName, playing]);

  const goLive = () => {
    setLiveIndex(previewIndex);
    setOutputMode("item");
    setBlack(false);
    setShowLogo(false);
    pushToast("Sent to projector", service[previewIndex]?.title ?? "Current slide");
  };
  const next = () => {
    setPreviewIndex((i) => Math.min(service.length - 1, i + 1));
  };
  const prev = () => {
    setPreviewIndex((i) => Math.max(0, i - 1));
  };

  const value: Store = {
    screen, setScreen, media, service, setService, theme, setThemeId, churchName, setChurchName,
    toasts, pushToast, dismissToast, imported, importFiles, selectedSongId, setSelectedSongId,
    songSection, setSongSection, lyricBg, setLyricBg, translation, setTranslation, book, setBook,
    chapterKey, setChapterKey, selectedVerses, toggleVerse, liveIndex, previewIndex, setPreviewIndex,
    goLive, next, prev, outputMode, setOutputMode, black, setBlack, showLogo, setShowLogo, playing,
    setPlaying, projectorOpen, setProjectorOpen, videoClipId, setVideoClipId, livePayload,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("store");
  return ctx;
}
