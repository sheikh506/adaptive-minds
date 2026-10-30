/**
 * Art & Craft content: craft projects with kid-sized steps and a "what you learn" line,
 * plus tap-to-colour pages built from simple shapes. Pure data, safe on server and client.
 */

export interface Craft {
  id: string;
  title: string;
  emoji: string;
  cover: string;
  time: string;
  /** The learning idea hiding inside the fun. */
  learn: string;
  materials: string[];
  steps: string[];
  /** Safety note for the grown-up. */
  grownUp: string;
}

export const CRAFTS: Craft[] = [
  {
    id: "paper-plate-sun",
    title: "Paper Plate Sun",
    emoji: "☀️",
    cover: "from-yellow-300 to-orange-400",
    time: "15 minutes",
    learn: "Patterns and counting: make a pattern with your rays, and count them in 2s.",
    materials: ["1 paper plate", "Yellow and orange paper", "Child-safe glue", "Safety scissors", "Crayons"],
    steps: [
      "Colour the middle of the plate yellow.",
      "Cut 12 long strips from the yellow and orange paper.",
      "Glue the strips around the edge, making a pattern: yellow, orange, yellow, orange.",
      "Count your rays in twos: 2, 4, 6, 8, 10, 12.",
      "Draw a smiling face in the middle. Hang your sun in the window!",
    ],
    grownUp: "A grown-up should help with cutting for younger children.",
  },
  {
    id: "rainbow-rain-cloud",
    title: "Rain Cloud in a Jar",
    emoji: "🌧️",
    cover: "from-sky-300 to-indigo-400",
    time: "10 minutes",
    learn: "Science: rain falls when clouds get heavy with water. Watch it happen!",
    materials: ["A clear jar of water", "Shaving foam", "Food colouring (a few drops)", "A spoon"],
    steps: [
      "Fill the jar almost to the top with water. This is the sky.",
      "Squirt a thick cloud of shaving foam on top.",
      "Drop food colouring slowly onto the cloud, one drop at a time.",
      "Wait and watch. When the cloud gets heavy, the colour drips down like rain!",
      "Talk about it: what happens when a real cloud has too much water in it?",
    ],
    grownUp: "Shaving foam is not for eating. Supervise with food colouring, and wash hands afterwards.",
  },
  {
    id: "shape-robot",
    title: "Shape Robot",
    emoji: "🤖",
    cover: "from-cyan-400 to-blue-600",
    time: "20 minutes",
    learn: "Geometry: build a robot from squares, circles, rectangles and triangles, and name each shape.",
    materials: ["Coloured paper", "Safety scissors", "Glue", "Marker pen", "A big sheet of paper"],
    steps: [
      "Cut a big rectangle for the body and a square for the head.",
      "Cut two circles for eyes and a thin rectangle for the mouth.",
      "Cut a triangle for the nose and two small squares for the feet.",
      "Glue the shapes onto the big paper to make your robot.",
      "Say the name of every shape out loud. How many corners does each shape have?",
    ],
    grownUp: "A grown-up can pre-cut the shapes for younger children.",
  },
  {
    id: "sock-puppet",
    title: "Sock Puppet Friend",
    emoji: "🧦",
    cover: "from-pink-400 to-rose-500",
    time: "20 minutes",
    learn: "Storytelling: give your puppet a name and a problem to solve, then act out a story.",
    materials: ["A clean sock", "Buttons or paper circles for eyes", "Felt or paper for a mouth", "Glue", "Wool for hair"],
    steps: [
      "Put the sock on your hand and make the mouth open and close.",
      "Glue two button eyes above the mouth.",
      "Glue on felt for a tongue and wool for hair.",
      "Give your puppet a name and a favourite food.",
      "Make up a short story: what is your puppet's problem, and how does it fix it?",
    ],
    grownUp: "Use big buttons or paper circles for children under 3, and always supervise small parts.",
  },
  {
    id: "nature-collage",
    title: "Nature Collage",
    emoji: "🍂",
    cover: "from-lime-400 to-emerald-600",
    time: "25 minutes",
    learn: "Science and sorting: sort leaves by colour, size and shape, then make a picture.",
    materials: ["Leaves, petals and twigs from a walk", "A sheet of card", "Glue", "Crayons"],
    steps: [
      "Go for a nature walk and collect 10 safe things from the ground.",
      "Sort them into groups: big and small, or by colour.",
      "Arrange them on the card to make an animal or a tree.",
      "Glue them down and add details with crayons.",
      "Count how many of each group you used.",
    ],
    grownUp: "Check nothing collected is sharp, dirty or poisonous, and wash hands afterwards.",
  },
  {
    id: "paper-boat",
    title: "Paper Boat Race",
    emoji: "⛵",
    cover: "from-teal-400 to-cyan-600",
    time: "15 minutes",
    learn: "Science: some things float and some sink. Test your boat with coins and find out how many it can carry.",
    materials: ["A sheet of paper", "A bowl or tub of water", "Small coins or buttons"],
    steps: [
      "Fold the paper in half, then fold the top corners into the middle to make a hat.",
      "Fold the bottom edges up on both sides, then open it out and pull it into a boat.",
      "Float it on the water.",
      "Add coins one by one. How many can it carry before it sinks?",
      "Guess first, then count. Was your guess close?",
    ],
    grownUp: "Always stay close when children play with water.",
  },
];

export const craftById = (id: string) => CRAFTS.find((c) => c.id === id);

// ─── Colouring pages ────────────────────────────────────────────────────────

export interface Region {
  id: string;
  d: string;
  /** colour shown before the child paints it */
  start: string;
}

export interface ColourPage {
  id: string;
  title: string;
  emoji: string;
  viewBox: string;
  regions: Region[];
}

const f = (n: number) => Number(n.toFixed(2));
const circle = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)} ${f(cy)} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y} h${w} v${h} h${-w} Z`;
const poly = (...pts: [number, number][]) => `M${pts.map(([x, y]) => `${x} ${y}`).join(" L")} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${f(cx - rx)} ${f(cy)} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;

const W = "#ffffff";

export const COLOUR_PAGES: ColourPage[] = [
  {
    id: "flower",
    title: "Garden Flower",
    emoji: "🌼",
    viewBox: "0 0 200 240",
    regions: [
      { id: "sky", d: rect(0, 0, 200, 240), start: W },
      { id: "petal-1", d: circle(100, 52, 22), start: W },
      { id: "petal-2", d: circle(138, 80, 22), start: W },
      { id: "petal-3", d: circle(124, 124, 22), start: W },
      { id: "petal-4", d: circle(76, 124, 22), start: W },
      { id: "petal-5", d: circle(62, 80, 22), start: W },
      { id: "middle", d: circle(100, 92, 24), start: W },
      { id: "stem", d: rect(95, 132, 10, 70), start: W },
      { id: "leaf-l", d: poly([95, 175], [60, 150], [62, 182]), start: W },
      { id: "leaf-r", d: poly([105, 165], [140, 140], [138, 172]), start: W },
      { id: "pot", d: poly([70, 198], [130, 198], [120, 232], [80, 232]), start: W },
    ],
  },
  {
    id: "house",
    title: "Cosy House",
    emoji: "🏠",
    viewBox: "0 0 240 220",
    regions: [
      { id: "sky", d: rect(0, 0, 240, 220), start: W },
      { id: "sun", d: circle(200, 36, 20), start: W },
      { id: "grass", d: rect(0, 176, 240, 44), start: W },
      { id: "wall", d: rect(50, 100, 140, 76), start: W },
      { id: "roof", d: poly([36, 104], [120, 40], [204, 104]), start: W },
      { id: "door", d: rect(106, 132, 28, 44), start: W },
      { id: "window-l", d: rect(64, 116, 28, 26), start: W },
      { id: "window-r", d: rect(148, 116, 28, 26), start: W },
      { id: "chimney", d: rect(158, 54, 16, 30), start: W },
    ],
  },
  {
    id: "fish",
    title: "Happy Fish",
    emoji: "🐠",
    viewBox: "0 0 240 180",
    regions: [
      { id: "water", d: rect(0, 0, 240, 180), start: W },
      { id: "body", d: ellipse(110, 90, 70, 44), start: W },
      { id: "tail", d: poly([170, 90], [226, 44], [226, 136]), start: W },
      { id: "fin-top", d: poly([90, 50], [120, 20], [140, 54]), start: W },
      { id: "fin-bottom", d: poly([100, 130], [124, 160], [140, 128]), start: W },
      { id: "eye", d: circle(70, 80, 9), start: W },
      { id: "bubble-1", d: circle(34, 50, 9), start: W },
      { id: "bubble-2", d: circle(22, 28, 6), start: W },
      { id: "sand", d: rect(0, 160, 240, 20), start: W },
    ],
  },
  {
    id: "rocket",
    title: "Rocket to the Moon",
    emoji: "🚀",
    viewBox: "0 0 200 260",
    regions: [
      { id: "space", d: rect(0, 0, 200, 260), start: W },
      { id: "moon", d: circle(150, 52, 28), start: W },
      { id: "star-1", d: circle(34, 40, 6), start: W },
      { id: "star-2", d: circle(60, 100, 5), start: W },
      { id: "star-3", d: circle(168, 150, 5), start: W },
      { id: "flame", d: poly([84, 190], [100, 245], [116, 190]), start: W },
      { id: "fin-l", d: poly([76, 150], [50, 196], [82, 188]), start: W },
      { id: "fin-r", d: poly([124, 150], [150, 196], [118, 188]), start: W },
      { id: "body", d: ellipse(100, 120, 28, 70), start: W },
      { id: "window", d: circle(100, 104, 12), start: W },
    ],
  },
];

export const colourPageById = (id: string) => COLOUR_PAGES.find((p) => p.id === id);

export const PALETTE = [
  "#ff6b6b", "#ff9f1c", "#ffd23f", "#9be564", "#2ec4b6", "#3ec6ff",
  "#8b45f7", "#ff7ac6", "#8d5524", "#222222", "#ffffff", "#b0b8c4",
];
