import { ClubEvent, VIPPackage } from "./types";

export const CLUB_EVENTS: ClubEvent[] = [
  {
    id: "evt-01",
    title: "FRIDAY LIVE ROCK: LEGENDS NIGHT",
    date: "FRIDAY SPECIAL",
    time: "21:00 - 03:30",
    headliner: "COBWEB & ALBATROSS",
    support: ["Robin & The New Revolution", "DJ Suraj"],
    subgenre: "NEPALESE LEGENDARY LIVE HARD ROCK & METAL",
    bpm: 125,
    ticketPrice: 2000, // NPR 2,000
    availableTickets: 120,
    accentColor: "from-zinc-400 to-black",
    rawAccent: "#ffffff",
    doorPolicy: "SEXY SMART CASUAL / ENERGIZED SPIRIT MANDATORY",
    graphicStyle: "industrial",
    targetDate: "2026-05-29T21:00:00",
    gifUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800"
  },
  {
    id: "evt-02",
    title: "EDM SATURDAY METROPOLIS",
    date: "SATURDAY SPECIAL",
    time: "22:00 - 03:30",
    headliner: "DJ ROHIT & DJ BIDHAN",
    support: ["DJ BPM", "Vibe Masters"],
    subgenre: "HIGH-ENERGY EDM, ACID HOUSE & PROGRESSIVE",
    bpm: 128,
    ticketPrice: 2500, // NPR 2,500
    availableTickets: 185,
    accentColor: "from-zinc-300 to-neutral-800",
    rawAccent: "#ffffff",
    doorPolicy: "XO CLUB SILVER & BLACK SIGNATURE / SMARTEST ATTIRE ONLY",
    graphicStyle: "hypnotic",
    targetDate: "2026-05-30T22:00:00",
    gifUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800"
  },
  {
    id: "evt-03",
    title: "XO BOLLYWOOD BOOM",
    date: "WEDNESDAY MIDWEEK",
    time: "21:30 - 03:00",
    headliner: "DJ SHIREEN (MUMBAI)",
    support: ["DJ Karsan", "DJ Susan"],
    subgenre: "COMMERCIAL MIXES, PUNJABI BEATS & BOLLYWOOD BASH",
    bpm: 120,
    ticketPrice: 1500, // NPR 1,500
    availableTickets: 250,
    accentColor: "from-zinc-400 to-neutral-700",
    rawAccent: "#ffffff",
    doorPolicy: "BRIGHT NIGHTGLOW SASSY / SMART DRESSED ENTRY ONLY",
    graphicStyle: "acid",
    targetDate: "2026-05-27T21:30:00",
    gifUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800"
  },
  {
    id: "evt-04",
    title: "VOID SYSTEM LAUNCH",
    date: "THURSDAY RAVE",
    time: "22:00 - 03:00",
    headliner: "INTERNATIONAL SPECIAL GUEST ACT",
    support: ["DJ Finzon", "Acid Project Nepal"],
    subgenre: "UNDERGROUND TECHNO & DEEP CONVEX AUDIO",
    bpm: 135,
    ticketPrice: 3000, // NPR 3,000
    availableTickets: 55,
    accentColor: "from-neutral-900 to-black",
    rawAccent: "#ffffff",
    doorPolicy: "ALL BLACK WITH STRIKING MONOCHROME ACCENTS / STRICT 18+",
    graphicStyle: "geometric",
    targetDate: "2026-05-28T22:00:00",
    gifUrl: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=800"
  }
];

export const VIP_PACKAGES: VIPPackage[] = [
  {
    id: "vip-01",
    name: "PLATINUM MAIN ROOM BOOTH",
    price: 45000, // NPR 45,000 (Approx $340)
    capacity: 12,
    location: "MAIN ROOM DANCEFLOOR FLANK",
    perks: [
      "Immediate front row rights adjacent to the central LED dancefloor",
      "1x Dom Pérignon Champagne or Ace of Spades Prestige selection",
      "1x Bottle of Ultra-Premium Don Julio 1942 Tequila or Doorly's XO Rum",
      "Elite VIP Butler host with synchronized fire-flare bottle display",
      "Biometric express-track direct escorted bypass on arrival",
      "Unrestricted access to both Main Room and VIP Mezzanines"
    ]
  },
  {
    id: "vip-02",
    name: "XO PRESTIGE VIP LOUNGE",
    price: 60000, // NPR 60,000 (Approx $450)
    capacity: 15,
    location: "ELEVATED LEVEL 2 LOUNGE",
    perks: [
      "Absolute exclusivity overlooking the main arena with one-way glass viewing",
      "Ultra-luxe black leather seating with silver neon piped framing",
      "1x Ace of Spades Champagne, 1x Premium Spirit of choice (Don Julio/Doorly's)",
      "Access to private reservation-only VIP restrooms and private mixologist",
      "Personal dedicated security escorts and elite premium hostess",
      "Preloaded XO signatures cocktail flight for all 15 attendees"
    ]
  },
  {
    id: "vip-03",
    name: "ADAMSON CONSOLE DECK",
    price: 25000, // NPR 25,000 (Approx $190)
    capacity: 8,
    location: "SOUNDBOOTH ELEVATION",
    perks: [
      "Sweet-spot acoustic alignment directly adjacent to the Canada-tuned Adamson Audio console",
      "1x Doorly's XO Rum or Ultra-Premium Grey Goose Vodka",
      "Fully responsive audio-visual active monitoring workspace view",
      "Digital tablet seamless tabletop automatic bottle ordering system",
      "Express front-gate bypass escorted VIP admission vouchers"
    ]
  }
];

export const PHOTO_GROUPS: PhotoGroup[] = [
  {
    id: "g-01",
    title: "VOID LAUNCH TECHNO NIGHT",
    date: "MAY 2026",
    description: "An immersive glimpse into our modular laser grids and techno synth-scapes.",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571266028243-34b311217e3f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489641499593-95edf228a025?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=1000&auto=format&fit=crop"
    ]
  },
  {
    id: "g-02",
    title: "VIP PRESTIGE & LUXURY CODES",
    date: "APRIL 2026",
    description: "Capture the high society ambiance, luxury table sparklers, and black-leather booths.",
    coverImage: "https://images.unsplash.com/photo-1485872224824-94e874c60252?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1485872224824-94e874c60252?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1000&auto=format&fit=crop"
    ]
  },
  {
    id: "g-03",
    title: "LIVE ROCK EXTREME IN THAMEL",
    date: "MARCH 2026",
    description: "The peak adrenaline moments of local rock legend performances on the XO main-deck.",
    coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000&auto=format&fit=crop"
    ]
  }
];

import { PhotoGroup } from "./types";

