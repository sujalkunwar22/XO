# 🖥️ XO Mainframe Console [v2.0.26]

```bash
guest@xo-terminal:~$ init-session --secure
[SUCCESS] Handshake complete.
[SUCCESS] Connected to XO Mainframe Node: Thamel, Kathmandu (27.7142° N, 85.3117° E)
```

```text
:::    :::  ::::::::  
:+:    :+: :+:    :+: 
 +:+  +:+  +:+    +:+ 
  +#++:+   +#+    +:+ 
   +#++    +#+    +#+ 
  +#+  +#+ #+#    #+# 
###    ###  ########  

K A T H M A N D U  //  L U X U R Y  N I G H T L I F E  P O R T A L
```

---

### `guest@xo:~$ cat club_xo_brief.log`
```yaml
VENUE_IDENTIFIER: "Club XO Kathmandu"
GEOLOCATION: "Chaksibari Marg, Thamel, Kathmandu, Nepal"
COORDINATES: "27.7142° N, 85.3117° E"
INFRASTRUCTURE_VALUE: "NPR 30 Crore ($2.25M USD+)"
CAPACITY: "1,200+ Peak Audio-Visual Space"
SOUND_RIG: "Canada-Tuned Adamson Audio Acoustical Arrays"
MAX_COMPLIANCE: "133dB Audio Limiter Gate"
VISUALS: "Responsive Neon Chromatic Mesh Grid & Kinetic Header Tracking"
ADMISSION_POLICY: "Strict 18+ Verification / Government ID / Smart Dress Code"
```

---

### `guest@xo:~$ ./show-events.py --active`
```text
[FETCHING ACTIVE EVENTS FOR 2026-05-23]
+--------+----------------------------+-----------------------+---------+------------+---------------+
| ID     | EVENT TITLE                | HEADLINER             | BPM     | PRICE (NPR)| SCHEDULE      |
+--------+----------------------------+-----------------------+---------+------------+---------------+
| evt-01 | FRIDAY LIVE ROCK: LEGENDS  | COBWEB & ALBATROSS    | 125     | 2,000      | FRIDAY SPECIAL|
| evt-02 | EDM SATURDAY METROPOLIS    | DJ ROHIT & DJ BIDHAN  | 128     | 2,500      | SATURDAY SPL  |
| evt-03 | XO BOLLYWOOD BOOM          | DJ SHIREEN (MUMBAI)   | 120     | 1,500      | WEDNESDAY MID |
| evt-04 | VOID SYSTEM LAUNCH         | INT'L GUEST ACT       | 135     | 3,000      | THURSDAY RAVE |
+--------+----------------------------+-----------------------+---------+------------+---------------+
```

#### Event Details & Door Policy
*   **Legends Night (FRIDAY):** Cobweb & Albatross live. Nepalese legendary live hard rock & metal.
    *   *Door Policy:* Sexy Smart Casual / Energized Spirit Mandatory.
*   **EDM Saturday Metropolis (SATURDAY):** High-energy progressive, electro & acid house.
    *   *Door Policy:* XO Club Silver & Black Signature / Smartest Attire Only.
*   **Bollywood Boom (WEDNESDAY):** Commercial Bollywood mixes & Punjabi beats.
    *   *Door Policy:* Bright Nightglow Sassy / Smart Dressed Entry Only.
*   **Void System Launch (THURSDAY):** Underground deep convex techno rave.
    *   *Door Policy:* All Black with Striking Monochrome Accents / Strictly 18+.

---

### `guest@xo:~$ cat vip_tier_manifest.json`
```json
{
  "platinum_booth": {
    "name": "PLATINUM MAIN ROOM BOOTH",
    "price_npr": 45000,
    "capacity": 12,
    "location": "MAIN ROOM DANCEFLOOR FLANK",
    "perks": [
      "Immediate front row rights adjacent to the central LED dancefloor",
      "1x Dom Pérignon Champagne or Ace of Spades Prestige selection",
      "1x Bottle of Ultra-Premium Don Julio 1942 Tequila or Doorly's XO Rum",
      "Elite VIP Butler host with synchronized fire-flare bottle display",
      "Biometric express-track direct escorted bypass on arrival"
    ]
  },
  "xo_prestige_lounge": {
    "name": "XO PRESTIGE VIP LOUNGE",
    "price_npr": 60000,
    "capacity": 15,
    "location": "ELEVATED LEVEL 2 LOUNGE",
    "perks": [
      "Absolute exclusivity overlooking the main arena with one-way glass viewing",
      "Ultra-luxe black leather seating with silver neon piped framing",
      "1x Ace of Spades Champagne, 1x Premium Spirit of choice (Don Julio/Doorly's)",
      "Access to private reservation-only VIP restrooms and private mixologist",
      "Personal dedicated security escorts and elite premium hostess"
    ]
  },
  "adamson_deck": {
    "name": "ADAMSON CONSOLE DECK",
    "price_npr": 25000,
    "capacity": 8,
    "location": "SOUNDBOOTH ELEVATION",
    "perks": [
      "Sweet-spot acoustic alignment directly adjacent to the Canada-tuned Adamson Audio console",
      "1x Doorly's XO Rum or Ultra-Premium Grey Goose Vodka",
      "Fully responsive audio-visual active monitoring workspace view",
      "Digital tablet seamless tabletop automatic bottle ordering system"
    ]
  }
}
```

---

### `guest@xo:~$ diagnose-system-architecture`
```text
Analyzing dependencies and front-end components...
[OK] Core Framework: React 19 (TypeScript)
[OK] Bundler: Vite
[OK] Styling System: Tailwind CSS 3.4+
[OK] Animation Engine: Motion (Framer Motion 11.11+)
[OK] Icons Package: Lucide React

Structure:
├── public/                 # Static assets (VIP posters, logos, maps)
├── src/
│   ├── components/
│   │   ├── HeroChamber.tsx         # Hero section & kinetic title controls
│   │   ├── EventRow.tsx            # Horizontal list of upcoming events
│   │   ├── VipSection.tsx          # VIP packages detailed container
│   │   ├── VIPBooking.tsx          # Biometric simulation/checkout booking modal
│   │   ├── DotMeshBackground.tsx   # Responsive, interactive dot particle canvas
│   │   ├── KineticHeader.tsx       # Live status indicators and system clock
│   │   └── StickyControls.tsx      # Floating navigation HUD & Quick VIP Reservation
│   ├── App.tsx             # Root page, global state, Age Gate Modal logic
│   ├── data.ts             # Static database containing events & VIP details
│   ├── types.ts            # Type definitions for ClubEvent and VIPPackage
│   └── index.css           # Styling directives, keyframes, custom utility classes
```

---

### `guest@xo:~$ ./run-local.sh --install`
```bash
# 1. Clone/navigate into the project directory
cd club-xo-kathmandu

# 2. Install package dependencies
npm install

# 3. Create a local environment config
cp .env.example .env.local
# Set your Gemini API key inside .env.local:
# VITE_GEMINI_API_KEY="your_api_key_here"

# 4. Trigger the local development engine
npm run dev
```
```text
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

```bash
guest@xo-terminal:~$ logout
[SUCCESS] Session closed. System status: SECURE. See you on the dancefloor.
```
