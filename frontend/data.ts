import { ClubEvent, VIPPackage } from "./types";

export const CLUB_EVENTS: ClubEvent[] = [];

export const VIP_PACKAGES: VIPPackage[] = [
  {
    id: "pkg-vvip",
    name: "VVIP ZONE",
    price: 60000,
    capacity: 15,
    location: "VVIP MAIN STAGE FRONT",
    perks: [
      "Immediate front row view of the main LED console and DJ setup",
      "1x Dom Pérignon Champagne or Ace of Spades Prestige selection",
      "1x Bottle of Ultra-Premium Don Julio 1942 Tequila or Doorly's XO Rum",
      "Elite VIP Butler host with synchronized fire-flare bottle display",
      "Biometric express-track direct escorted bypass on arrival",
      "Access to private restrooms and private mixologist"
    ]
  },
  {
    id: "pkg-stage",
    name: "STAGE PRIVATE DECK",
    price: 60000,
    capacity: 12,
    location: "MAIN STAGE ELEVATION",
    perks: [
      "Ultra-exclusive seating elevated directly on the main stage next to the artist",
      "1x Dom Pérignon Champagne, 1x Ultra-Premium Spirit of choice",
      "Private VIP security escort and direct express artist portal check-in",
      "Premium hostesses with synchronized fire-flare bottle display",
      "Unrestricted access to all club levels and VIP private areas"
    ]
  },
  {
    id: "pkg-ground",
    name: "GROUND FLOOR MAIN ROOM",
    price: 45000,
    capacity: 12,
    location: "DANCEFLOOR BOOTHS G1-G6",
    perks: [
      "High-energy booths situated on the ground floor adjacent to the main bar and screen",
      "1x Premium Champagne and 1x Bottle of Ultra-Premium Tequila or Rum",
      "VIP express-track escorted entry bypass on arrival",
      "Dedicated table service team and bottle presenters"
    ]
  },
  {
    id: "pkg-vip-balcony",
    name: "VIP BALCONY / DECK",
    price: 45000,
    capacity: 10,
    location: "ELEVATED VIP DECK VIP 5-VIP 7",
    perks: [
      "Perfect acoustic alignment directly behind VVIP booths with prime elevated view",
      "1x Bottle of Premium Spirit (Grey Goose Vodka / Doorly's XO Rum)",
      "Express front-gate bypass escorted VIP admission vouchers",
      "Dedicated butler host for seamless orders"
    ]
  },
  {
    id: "pkg-first-balcony",
    name: "FIRST FLOOR BALCONY",
    price: 35000,
    capacity: 8,
    location: "FIRST FLOOR OVERLOOK A1-A5",
    perks: [
      "Balcony sofa booths overlooking the main dancefloor and main bar",
      "1x Premium Spirit of choice with mixers",
      "Express front-gate VIP entry vouchers",
      "Dedicated table server for standard orders"
    ]
  },
  {
    id: "pkg-first-cocktail",
    name: "FIRST FLOOR COCKTAIL STANDING",
    price: 15000,
    capacity: 4,
    location: "FIRST FLOOR HIGH TABLES A6-A8",
    perks: [
      "Cocktail high standing tables on the first floor balcony flank",
      "4x Complimentary signature XO cocktails",
      "Standard VIP entry express vouchers",
      "Acoustic sweet-spot overlooking the main floor"
    ]
  },
  {
    id: "pkg-second-vip",
    name: "SECOND FLOOR VIP",
    price: 35000,
    capacity: 10,
    location: "SECOND FLOOR BALCONY C1-C2 & C6-C8",
    perks: [
      "Premium sofa booths on the second floor balcony overlooking the entire club",
      "1x Premium Spirit of choice with mixers",
      "Express VIP entrance vouchers",
      "Dedicated table server for premium orders"
    ]
  },
  {
    id: "pkg-second-standing",
    name: "SECOND FLOOR VIP STANDING",
    price: 15000,
    capacity: 4,
    location: "SECOND FLOOR HIGH TABLES C3-C5",
    perks: [
      "Cocktail high standing tables on the second floor balcony edge",
      "4x Complimentary signature XO cocktails",
      "Standard VIP entry express vouchers"
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
    coverImage: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop",
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

