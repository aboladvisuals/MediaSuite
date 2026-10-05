export type ScreenId =
  | "home"
  | "video"
  | "photo"
  | "iphone"
  | "library"
  | "songs"
  | "bible"
  | "planner"
  | "live"
  | "themes"
  | "settings";

export type MediaKind = "photo" | "video" | "audio" | "background" | "graphic";

export type MediaItem = {
  id: string;
  name: string;
  kind: MediaKind;
  folder: string;
  duration?: string;
  size: string;
  added: string;
  favorite: boolean;
  fromPhone?: boolean;
  hue: number;
  note?: string;
};

export type ServiceKind =
  | "welcome"
  | "prayer"
  | "worship"
  | "song"
  | "bible"
  | "choir"
  | "announcement"
  | "sermon"
  | "offering"
  | "video"
  | "image"
  | "text"
  | "blank"
  | "countdown";

export type ServiceItem = {
  id: string;
  kind: ServiceKind;
  title: string;
  detail: string;
  minutes: number;
  payload?: string;
};

export type Song = {
  id: string;
  title: string;
  author: string;
  key: string;
  tempo: string;
  sections: { name: string; lines: string[] }[];
  publicDomain: boolean;
};

export type ThemePreset = {
  id: string;
  name: string;
  church: string;
  primary: string;
  accent: string;
  font: string;
  lyricStyle: string;
  verseStyle: string;
  announceStyle: string;
  lowerThird: string;
  bg: string;
};

export type Toast = { id: string; title: string; body?: string };

export type PhoneFile = {
  id: string;
  name: string;
  kind: "photo" | "video";
  size: string;
  date: string;
  hue: number;
};
