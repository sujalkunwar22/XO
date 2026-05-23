export interface Artist {
  name: string;
  role: string;
  avatar: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  headliner: string;
  support: string[];
  subgenre: string;
  bpm: number;
  ticketPrice: number;
  availableTickets: number;
  accentColor: string; // Tailwind neon color for individual event branding
  rawAccent: string; // hex color for GSAP/canvas glows
  doorPolicy: string;
  graphicStyle: "geometric" | "acid" | "hypnotic" | "industrial";
  targetDate: string; // ISO string format e.g. "2026-05-29T21:00:00"
  gifUrl: string; // Looping high-fidelity GIF/video backdrop URL
}

export interface VIPPackage {
  id: string;
  name: string;
  price: number;
  capacity: number;
  location: string;
  perks: string[];
}

export interface PhotoGroup {
  id: string;
  title: string;
  date: string;
  description: string;
  coverImage: string;
  images: string[];
}

