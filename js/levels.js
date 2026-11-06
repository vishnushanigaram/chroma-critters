/* ==========================================================================
   CHROMA CRITTERS - ADVENTURE LEVELS CONFIGURATION
   12 handcrafted stages with learning curve, color mixing & musical fun
   ========================================================================== */

const GAME_LEVELS = [
  {
    id: 1,
    title: "First Nibbles",
    subtitle: "Welcome to Candy Island!",
    hint: "Pull back the spoon and release to feed hungry Bloop & Puff!",
    availableAmmo: ['blue', 'red'],
    targetScore: 600,
    starThresholds: [600, 1200, 2000],
    quota: { bloop: 2, puff: 2 },
    critters: [
      { type: 'bloop', x: 0.3, y: 0.28, radius: 52, desire: 'blue' },
      { type: 'puff', x: 0.7, y: 0.28, radius: 52, desire: 'red' }
    ],
    chimes: [],
    chromaRings: [],
    bouncers: [],
    gravityBubbles: []
  },
  {
    id: 2,
    title: "Musical Munchies",
    subtitle: "Listen to the Singing Crystals!",
    hint: "Bounce treats off the shiny crystals to play happy musical notes!",
    availableAmmo: ['blue', 'yellow'],
    targetScore: 1000,
    starThresholds: [1000, 1800, 2800],
    quota: { bloop: 2, zippy: 2, chimes: 3 },
    critters: [
      { type: 'bloop', x: 0.25, y: 0.32, radius: 50, desire: 'blue' },
      { type: 'zippy', x: 0.75, y: 0.32, radius: 50, desire: 'yellow' }
    ],
    chimes: [
      { x: 0.5, y: 0.36, note: 0, label: 'C' },
      { x: 0.38, y: 0.48, note: 1, label: 'D' },
      { x: 0.62, y: 0.48, note: 2, label: 'E' }
    ],
    chromaRings: [],
    bouncers: [],
    gravityBubbles: []
  },
  {
    id: 3,
    title: "Color Magic: Green!",
    subtitle: "Yellow + Blue = Green!",
    hint: "Shoot the Yellow Lemon Star through the Blue Ring to make Green Melon for Gromp!",
    availableAmmo: ['yellow'],
    targetScore: 1200,
    starThresholds: [1200, 2000, 3200],
    quota: { gromp: 3 },
    critters: [
      { type: 'gromp', x: 0.5, y: 0.22, radius: 58, desire: 'green' }
    ],
    chimes: [
      { x: 0.25, y: 0.42, note: 3, label: 'G' },
      { x: 0.75, y: 0.42, note: 4, label: 'A' }
    ],
    chromaRings: [
      { x: 0.5, y: 0.48, filterColor: 'blue', radius: 46 }
    ],
    bouncers: [],
    gravityBubbles: []
  },
  {
    id: 4,
    title: "Jelly Trampoline",
    subtitle: "High Bouncing Fun!",
    hint: "Hit the bouncy red mushrooms to launch food way up high!",
    availableAmmo: ['red', 'yellow'],
    targetScore: 1400,
    starThresholds: [1400, 2400, 3600],
    quota: { puff: 2, zippy: 2 },
    critters: [
      { type: 'puff', x: 0.28, y: 0.2, radius: 48, desire: 'red' },
      { type: 'zippy', x: 0.72, y: 0.2, radius: 48, desire: 'yellow' }
    ],
    chimes: [
      { x: 0.5, y: 0.28, note: 5, label: 'C5' }
    ],
    chromaRings: [],
    bouncers: [
      { x: 0.32, y: 0.58, width: 75, height: 32 },
      { x: 0.68, y: 0.58, width: 75, height: 32 }
    ],
    gravityBubbles: []
  },
  {
    id: 5,
    title: "Color Magic: Orange!",
    subtitle: "Red + Yellow = Orange!",
    hint: "Shoot the Red Strawberry through the Yellow Ring to make juicy Orange snacks!",
    availableAmmo: ['red'],
    targetScore: 1500,
    starThresholds: [1500, 2600, 3800],
    quota: { zippy: 3 },
    critters: [
      { type: 'zippy', x: 0.5, y: 0.22, radius: 52, desire: 'orange' }
    ],
    chimes: [
      { x: 0.3, y: 0.4, note: 1, label: 'D' },
      { x: 0.7, y: 0.4, note: 2, label: 'E' }
    ],
    chromaRings: [
      { x: 0.5, y: 0.46, filterColor: 'yellow', radius: 46 }
    ],
    bouncers: [],
    gravityBubbles: []
  },
  {
    id: 6,
    title: "Xylophone Symphony",
    subtitle: "Compose a Melody!",
    hint: "Bounce across the whole musical crystal rainbow!",
    availableAmmo: ['blue', 'red', 'yellow'],
    targetScore: 2000,
    starThresholds: [2000, 3200, 4800],
    quota: { bloop: 2, puff: 2, zippy: 2, chimes: 6 },
    critters: [
      { type: 'bloop', x: 0.18, y: 0.25, radius: 48, desire: 'blue' },
      { type: 'puff', x: 0.5, y: 0.18, radius: 48, desire: 'red' },
      { type: 'zippy', x: 0.82, y: 0.25, radius: 48, desire: 'yellow' }
    ],
    chimes: [
      { x: 0.25, y: 0.48, note: 0, label: 'C' },
      { x: 0.37, y: 0.42, note: 1, label: 'D' },
      { x: 0.5, y: 0.38, note: 2, label: 'E' },
      { x: 0.63, y: 0.42, note: 3, label: 'G' },
      { x: 0.75, y: 0.48, note: 4, label: 'A' }
    ],
    chromaRings: [],
    bouncers: [],
    gravityBubbles: []
  },
  {
    id: 7,
    title: "Color Magic: Purple!",
    subtitle: "Red + Blue = Purple!",
    hint: "Shoot Blue Ice Berries through the Red Ring to feed Cosmo purple plum candy!",
    availableAmmo: ['blue'],
    targetScore: 1800,
    starThresholds: [1800, 3000, 4400],
    quota: { cosmo: 3 },
    critters: [
      { type: 'cosmo', x: 0.5, y: 0.2, radius: 56, desire: 'purple' }
    ],
    chimes: [
      { x: 0.35, y: 0.38, note: 0, label: 'C' },
      { x: 0.65, y: 0.38, note: 5, label: 'C5' }
    ],
    chromaRings: [
      { x: 0.5, y: 0.45, filterColor: 'red', radius: 48 }
    ],
    bouncers: [],
    gravityBubbles: []
  },
  {
    id: 8,
    title: "Floaty Dream Bubble",
    subtitle: "Anti-Gravity Floating!",
    hint: "The sparkling giant bubble makes snacks float softly in zero gravity!",
    availableAmmo: ['blue', 'yellow'],
    targetScore: 2200,
    starThresholds: [2200, 3500, 5000],
    quota: { bloop: 2, gromp: 2 },
    critters: [
      { type: 'bloop', x: 0.26, y: 0.24, radius: 50, desire: 'blue' },
      { type: 'gromp', x: 0.74, y: 0.24, radius: 54, desire: 'green' }
    ],
    chimes: [
      { x: 0.5, y: 0.2, note: 3, label: 'G' }
    ],
    chromaRings: [
      { x: 0.74, y: 0.45, filterColor: 'blue', radius: 44 }
    ],
    bouncers: [],
    gravityBubbles: [
      { x: 0.5, y: 0.48, radius: 80 }
    ]
  },
  {
    id: 9,
    title: "Double Color Lab",
    subtitle: "Pick Your Magic Portal!",
    hint: "Left Blue Ring makes Green! Right Red Ring makes Orange!",
    availableAmmo: ['yellow'],
    targetScore: 2400,
    starThresholds: [2400, 3800, 5200],
    quota: { gromp: 2, puff: 2 },
    critters: [
      { type: 'gromp', x: 0.25, y: 0.22, radius: 52, desire: 'green' },
      { type: 'puff', x: 0.75, y: 0.22, radius: 52, desire: 'orange' }
    ],
    chimes: [
      { x: 0.5, y: 0.35, note: 2, label: 'E' }
    ],
    chromaRings: [
      { x: 0.28, y: 0.48, filterColor: 'blue', radius: 44 },
      { x: 0.72, y: 0.48, filterColor: 'red', radius: 44 }
    ],
    bouncers: [],
    gravityBubbles: []
  },
  {
    id: 10,
    title: "Bouncy Symphony",
    subtitle: "Super Trampoline Trick Shots!",
    hint: "Bounce treats from the mushrooms through the chime bells to the critters!",
    availableAmmo: ['red', 'blue', 'yellow'],
    targetScore: 2800,
    starThresholds: [2800, 4200, 6000],
    quota: { bloop: 2, zippy: 2, puff: 2 },
    critters: [
      { type: 'bloop', x: 0.2, y: 0.18, radius: 46, desire: 'blue' },
      { type: 'zippy', x: 0.5, y: 0.15, radius: 48, desire: 'yellow' },
      { type: 'puff', x: 0.8, y: 0.18, radius: 46, desire: 'red' }
    ],
    chimes: [
      { x: 0.35, y: 0.38, note: 1, label: 'D' },
      { x: 0.65, y: 0.38, note: 4, label: 'A' }
    ],
    chromaRings: [],
    bouncers: [
      { x: 0.25, y: 0.62, width: 80, height: 32 },
      { x: 0.75, y: 0.62, width: 80, height: 32 }
    ],
    gravityBubbles: []
  },
  {
    id: 11,
    title: "Cosmic Rainbow Gate",
    subtitle: "The Legendary Rainbow Snack!",
    hint: "Shoot through the Rainbow Portal to turn snacks into Cosmic Rainbow Cupcakes!",
    availableAmmo: ['yellow', 'blue'],
    targetScore: 3200,
    starThresholds: [3200, 4800, 6500],
    quota: { cosmo: 3, gromp: 2 },
    critters: [
      { type: 'cosmo', x: 0.5, y: 0.18, radius: 56, desire: 'rainbow' },
      { type: 'gromp', x: 0.8, y: 0.26, radius: 50, desire: 'green' }
    ],
    chimes: [
      { x: 0.25, y: 0.42, note: 0, label: 'C' },
      { x: 0.75, y: 0.42, note: 5, label: 'C5' }
    ],
    chromaRings: [
      { x: 0.5, y: 0.46, filterColor: 'rainbow', radius: 50 },
      { x: 0.8, y: 0.5, filterColor: 'blue', radius: 42 }
    ],
    bouncers: [
      { x: 0.5, y: 0.68, width: 90, height: 34 }
    ],
    gravityBubbles: []
  },
  {
    id: 12,
    title: "Grand Feast of Cosmo",
    subtitle: "The Ultimate Celebration!",
    hint: "Feed all your alien friends in this grand festival of music and colors!",
    availableAmmo: ['red', 'yellow', 'blue'],
    targetScore: 4000,
    starThresholds: [4000, 6000, 8500],
    quota: { cosmo: 2, bloop: 2, puff: 2, zippy: 2, gromp: 2 },
    critters: [
      { type: 'cosmo', x: 0.5, y: 0.14, radius: 58, desire: 'rainbow' },
      { type: 'bloop', x: 0.18, y: 0.25, radius: 46, desire: 'blue' },
      { type: 'puff', x: 0.38, y: 0.22, radius: 46, desire: 'orange' },
      { type: 'zippy', x: 0.62, y: 0.22, radius: 46, desire: 'yellow' },
      { type: 'gromp', x: 0.82, y: 0.25, radius: 48, desire: 'green' }
    ],
    chimes: [
      { x: 0.28, y: 0.42, note: 0, label: 'C' },
      { x: 0.5, y: 0.35, note: 2, label: 'E' },
      { x: 0.72, y: 0.42, note: 4, label: 'A' }
    ],
    chromaRings: [
      { x: 0.38, y: 0.52, filterColor: 'yellow', radius: 42 },
      { x: 0.5, y: 0.48, filterColor: 'rainbow', radius: 46 },
      { x: 0.82, y: 0.52, filterColor: 'blue', radius: 42 }
    ],
    bouncers: [
      { x: 0.5, y: 0.68, width: 85, height: 32 }
    ],
    gravityBubbles: []
  }
];

window.GAME_LEVELS = GAME_LEVELS;

