/**
 * src/lib/feelings.ts
 *
 * Feelings and Social Understanding module — P2 Developmental Learning.
 *
 * Age-appropriate content for children aged 4–7 covering:
 *   - Naming feelings (emotional vocabulary)
 *   - Recognising feelings in others (faces, situations)
 *   - Simple coping strategies
 *   - Social scenarios (taking turns, asking for help, disagreements)
 *
 * Design rules:
 *   - No diagnostic or therapeutic claims
 *   - All scenarios are everyday situations (school, home, playground)
 *   - Multiple valid responses are accepted where appropriate
 *   - Calm, validating tone — no shaming
 *   - Content is suitable for 4-7 year olds
 */

export interface FeelingsCard {
  id: string;
  emoji: string;
  feeling: string;
  /** A simple description in child-friendly language */
  description: string;
  /** When you might feel this way */
  examples: string[];
  /** A simple coping strategy or acknowledgement */
  copingTip: string;
  /** What this might look like on a face (for recognition) */
  faceClue: string;
}

export interface SocialScenario {
  id: string;
  title: string;
  situation: string;
  emoji: string;
  question: string;
  choices: { text: string; response: string; isKind: boolean }[];
}

export const FEELINGS_CARDS: FeelingsCard[] = [
  {
    id: "happy",
    emoji: "😊",
    feeling: "Happy",
    description: "Happy is that warm, good feeling when something nice happens.",
    examples: ["Playing with a friend", "Getting a hug", "Eating your favourite food", "Finishing something difficult"],
    copingTip: "When you feel happy, share it! Tell someone, smile, or do a happy dance.",
    faceClue: "Smiling mouth, bright eyes, sometimes rosy cheeks.",
  },
  {
    id: "sad",
    emoji: "😢",
    feeling: "Sad",
    description: "Sad is a low, heavy feeling, sometimes with tears.",
    examples: ["Missing someone", "Losing a toy", "Being left out", "Something ending"],
    copingTip: "It is okay to cry. Talk to someone you trust, have a hug, or draw a picture of how you feel.",
    faceClue: "Turned-down mouth, watery eyes, eyebrows pointing up in the middle.",
  },
  {
    id: "angry",
    emoji: "😠",
    feeling: "Angry",
    description: "Angry is a hot, tight feeling, like a fire inside.",
    examples: ["Someone taking your things", "Being told no", "Something going wrong", "Being treated unfairly"],
    copingTip: "Take 3 deep breaths: breathe in for 4, hold for 2, out for 4. Walk away for a moment if you need to.",
    faceClue: "Eyebrows pulling down in the middle, tight jaw, red face.",
  },
  {
    id: "scared",
    emoji: "😨",
    feeling: "Scared",
    description: "Scared is a shaky, worried feeling when something seems dangerous or uncertain.",
    examples: ["A loud noise", "Trying something new", "The dark", "Being separated from a grown-up"],
    copingTip: "Hold a grown-up's hand. Say 'I feel scared about...' and they can help. Brave feelings come after scared feelings.",
    faceClue: "Wide eyes, raised eyebrows, open mouth, looking away.",
  },
  {
    id: "excited",
    emoji: "🤩",
    feeling: "Excited",
    description: "Excited is a bubbly, bouncy feeling when something great is about to happen.",
    examples: ["A birthday party", "Going somewhere special", "A new toy", "Seeing a friend you missed"],
    copingTip: "Enjoy the feeling! Count down with a grown-up if the waiting is hard.",
    faceClue: "Big smile, wide eyes, eyebrows up.",
  },
  {
    id: "surprised",
    emoji: "😮",
    feeling: "Surprised",
    description: "Surprised is when something happens that you did not expect.",
    examples: ["A sudden noise", "An unexpected gift", "Something different happening"],
    copingTip: "Take a breath and give yourself a moment. Surprises can be good or tricky — both are okay.",
    faceClue: "Very wide eyes, mouth in a big O shape.",
  },
  {
    id: "proud",
    emoji: "😤",
    feeling: "Proud",
    description: "Proud is a tall, warm feeling when you do something well.",
    examples: ["Learning something new", "Helping someone", "Finishing a hard task"],
    copingTip: "Tell someone what you did! Feeling proud of yourself is important.",
    faceClue: "Chin a little higher, big smile, standing tall.",
  },
  {
    id: "lonely",
    emoji: "🥺",
    feeling: "Lonely",
    description: "Lonely is a quiet, empty feeling when you want company or a friend.",
    examples: ["Playing alone when you want friends", "Starting at a new place", "Being left out of a game"],
    copingTip: "Tell a grown-up. You can invite someone to play, or join in a group activity.",
    faceClue: "Sad eyes, looking down or away, not smiling.",
  },
  {
    id: "calm",
    emoji: "😌",
    feeling: "Calm",
    description: "Calm is a quiet, still feeling — not excited, not worried, just peaceful.",
    examples: ["After a rest", "Sitting quietly with a book", "Listening to soft music"],
    copingTip: "Calm is a superpower. You can practise it: close your eyes, breathe slowly, imagine a peaceful place.",
    faceClue: "Relaxed face, gentle smile or no expression, slow blinking.",
  },
  {
    id: "frustrated",
    emoji: "😤",
    feeling: "Frustrated",
    description: "Frustrated is that tight, stuck feeling when something is hard or not going the way you want.",
    examples: ["Something not working", "Making a mistake", "Not being understood"],
    copingTip: "Stop, breathe, step back. Ask for help. Say 'I am finding this hard' — that is brave.",
    faceClue: "Frowning, tense jaw, arms crossed, sometimes sighing.",
  },
];

export const SOCIAL_SCENARIOS: SocialScenario[] = [
  {
    id: "taking-turns",
    title: "Taking Turns",
    emoji: "🎡",
    situation: "You and your friend both want to go on the swing at the same time. There is only one swing.",
    question: "What is the kindest thing to do?",
    choices: [
      { text: "Push your friend off so you can have a turn", response: "That would hurt your friend and might end the friendship. Their feelings matter too.", isKind: false },
      { text: "Take turns — you go first then swap", response: "Great choice! Taking turns means everyone gets a go and stays friends.", isKind: true },
      { text: "Walk away and never use the swing", response: "You can be kind and still join in! Try asking to share.", isKind: false },
      { text: "Ask a grown-up to help you take turns fairly", response: "That is a great idea! Asking for help is always brave and smart.", isKind: true },
    ],
  },
  {
    id: "asking-for-help",
    title: "Asking for Help",
    emoji: "🤝",
    situation: "You are working on a puzzle. You have been trying for a long time and you feel really stuck.",
    question: "What is a good thing to do?",
    choices: [
      { text: "Throw the puzzle away", response: "That might feel satisfying for a second, but you would miss the chance to finish it!", isKind: false },
      { text: "Ask a grown-up to help you", response: "Brilliant! Asking for help shows you are smart and brave. Everyone needs help sometimes.", isKind: true },
      { text: "Keep trying alone even if you feel like crying", response: "Trying is great, but if you are really stuck, asking for help is always okay.", isKind: false },
      { text: "Take a short break, then try again", response: "A break can really help! Come back fresh. You can still ask for help if you need it.", isKind: true },
    ],
  },
  {
    id: "disagreement",
    title: "A Disagreement",
    emoji: "💬",
    situation: "You and your friend want to play different games. You want to play outside but your friend wants to draw.",
    question: "What is a kind way to solve this?",
    choices: [
      { text: "Do what your friend wants and feel unhappy", response: "It is okay to share your feelings! Both of you matter.", isKind: false },
      { text: "Insist on your game and ignore your friend's idea", response: "That might make your friend feel unheard. Try to compromise.", isKind: false },
      { text: "Play outside first, then draw together", response: "That is great teamwork! Both of you get what you want.", isKind: true },
      { text: "Try a new game you both like", response: "Finding something new to enjoy together is wonderful!", isKind: true },
    ],
  },
  {
    id: "someone-is-sad",
    title: "A Friend Feels Sad",
    emoji: "🫂",
    situation: "You see your friend sitting alone at break time. They look sad and are not playing.",
    question: "What could you do?",
    choices: [
      { text: "Walk past and keep playing", response: "Your friend might really need someone right now. Small acts of kindness are powerful.", isKind: false },
      { text: "Go over and ask 'Are you okay?'", response: "Wonderful! Just asking shows you care. That can make a big difference.", isKind: true },
      { text: "Tell everyone else your friend is sad", response: "That might make your friend embarrassed. It is kinder to speak to them directly.", isKind: false },
      { text: "Sit with them quietly, even without talking", response: "Sometimes just being there is enough. That is real friendship.", isKind: true },
    ],
  },
  {
    id: "making-a-mistake",
    title: "Making a Mistake",
    emoji: "🙈",
    situation: "You accidentally knocked over your classmate's water bottle and it spilled everywhere.",
    question: "What is the right thing to do?",
    choices: [
      { text: "Walk away quickly before anyone notices", response: "Mistakes happen to everyone. Walking away makes things worse.", isKind: false },
      { text: "Say sorry and help clean it up", response: "That is exactly right! A sincere sorry and helping to fix things shows good character.", isKind: true },
      { text: "Blame someone else", response: "That is not honest. Being brave enough to own a mistake is much better.", isKind: false },
      { text: "Say sorry and tell a grown-up so they can help", response: "Great! Saying sorry and getting help to fix things is the kind and honest thing to do.", isKind: true },
    ],
  },
];
