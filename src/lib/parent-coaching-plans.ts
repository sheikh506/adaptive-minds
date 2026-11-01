/**
 * Curated Parent-Coached Daily Learning Plans
 *
 * Aligned with the ADAPTIVEMINDS curriculum. Each plan provides a 5-10 minute,
 * screen-free parent-led learning experience tailored to specific child progress.
 */

export interface CoachedPlan {
  skillId: string;
  skillName: string;
  subject: "MATH" | "READING" | "SCIENCE";
  objective: string;
  parentExplanation: string;
  materialsNeeded: string[];
  instructionalScript: string;
  activity: string;
  followUp: string;
  checkUnderstanding: string;
}

export const COACHING_PLANS: Record<string, Omit<CoachedPlan, "skillId" | "skillName" | "subject" | "objective">> = {
  "ph-letter-names": {
    parentExplanation: "Naming letters is the first step in learning to read. It helps children map written symbols to spoken language.",
    materialsNeeded: ["Paper", "Marker or crayon", "Small toys (cars, Lego blocks)"],
    instructionalScript: "Say: 'Look at this letter. This is the uppercase A and lowercase a. They make the same sound, /æ/. Let's draw their shapes in the air with our fingers!'",
    activity: "Draw 3 large letters (e.g. A, B, C) on paper. Ask your child to drive a toy car along the lines of the letter while saying its name: 'A is for Apple, B is for Bear, C is for Cat!'",
    followUp: "Spot these letters on food boxes or books around the room.",
    checkUnderstanding: "Point to a letter on a box and ask: 'What letter is this?'",
  },
  "ph-letter-sounds-consonants": {
    parentExplanation: "Consonant sounds are the building blocks of most short words. Learning the pure sound (e.g. say /b/, not 'buh') prevents blending issues later.",
    materialsNeeded: ["3-5 common household objects (e.g., cup, spoon, sock, pen)"],
    instructionalScript: "Say: 'Today, we are sound detectives! Let's listen to the first sound in spoon. S-S-Spoon. The first sound is /s/. Let's find other things that start with /s/!'",
    activity: "Put three objects in front of your child (e.g., a cup, a spoon, a sock). Say a sound (e.g. /s/) and ask your child to grab the object that starts with that sound as fast as they can!",
    followUp: "While walking, play 'I Spy' with starting consonant sounds.",
    checkUnderstanding: "Show a spoon and ask: 'What sound does this word start with?'",
  },
  "ph-cvc-blending": {
    parentExplanation: "Blending is pushing individual letter sounds together to read a word. This is the heart of decoding.",
    materialsNeeded: ["Sticky notes or small index cards", "Marker"],
    instructionalScript: "Say: 'We can build words like magic! I am going to say three sounds slowly: /c/... /a/... /t/. Now let's slide them together faster: cat! Your turn!'",
    activity: "Write 'c', 'a', and 't' on three sticky notes. Separate them. Say each sound while tapping the note, then slide the notes together and run your finger underneath to say 'cat!'",
    followUp: "Try building other simple words like 'sit', 'dog', or 'bed'.",
    checkUnderstanding: "Point to the notes for 'bed' and ask: 'Can you blend these sounds to read the word?'",
  },
  "ph-cvc-segmenting": {
    parentExplanation: "Segmenting is breaking a spoken word into its individual sounds, which is the foundational skill for spelling.",
    materialsNeeded: ["3 small coins, raisins, or buttons"],
    instructionalScript: "Say: 'Let's break words into small pieces! The word is dog. Let's stretch it: d... o... g. Let's push a button for each sound: /d/ (push)... /o/ (push)... /g/ (push). That's three sounds!'",
    activity: "Say a spoken CVC word (e.g., pig, sun, van). Ask your child to push one coin forward for each sound they hear, counting them as they go.",
    followUp: "Clap or stomp for each sound in family names or pets' names.",
    checkUnderstanding: "Say the word 'hop' and ask: 'What are the individual sounds in this word?'",
  },
  "math-counting-0-10": {
    parentExplanation: "One-to-one correspondence is matching each counted object to exactly one number name. It prevents children from counting too fast or missing items.",
    materialsNeeded: ["A bowl of cereal, dry pasta, or small blocks"],
    instructionalScript: "Say: 'Let's count our snacks! When we count, we must touch each piece once and say one number: 1, 2, 3... Let's see how many we have!'",
    activity: "Line up 8 dry pasta shapes. Have your child touch each one while counting aloud. If they count too fast, hold their finger and guide them to touch and say the numbers slowly together.",
    followUp: "Count steps while walking from the sofa to the door.",
    checkUnderstanding: "Put out 6 blocks and ask: 'How many blocks are here? Point and count them for me.'",
  },
  "math-addition-to-10": {
    parentExplanation: "Understanding addition as 'composing' or combining two groups of objects establishes the concrete meaning of arithmetic.",
    materialsNeeded: ["Paper plates", "Small toys or fruit pieces"],
    instructionalScript: "Say: 'If I have 3 apples in this hand, and you give me 2 more apples, how many do we have in total? Let's put them together and count!'",
    activity: "Draw a line dividing a paper plate in half. Put 4 cereal pieces on the left and 3 on the right. Ask: 'How many on the left? How many on the right? Now let's push them to the middle and find the total!'",
    followUp: "Write down the matching equation: 4 + 3 = 7 on paper.",
    checkUnderstanding: "Ask: 'If we have 5 red cars and 2 blue cars, how many cars do we have in all?'",
  },
  "sci-living-nonliving": {
    parentExplanation: "Early scientific thinking starts with classification. Categorizing living versus non-living helps children understand life characteristics (breathing, growing, feeding).",
    materialsNeeded: ["An indoor houseplant", "A toy or household object (e.g., shoe or doll)"],
    instructionalScript: "Say: 'Look at this plant. It grows, drinks water, and needs sunshine. It is living! What about this shoe? Does it grow or eat food? No, it is non-living!'",
    activity: "Walk around the house or garden. Point to 5 different things (tree, rock, dog, chair, television) and ask your child to jump up and down if it is living, or stand still like a statue if it is non-living!",
    followUp: "Draw a line down a piece of paper and draw 2 living things and 2 non-living things on each side.",
    checkUnderstanding: "Show a pebble and ask: 'Is this pebble living or non-living? Why?'",
  },
};

/**
 * Fallback generator for any skill to ensure we have adaptive coaching plans for all 34 skills.
 */
export function getCoachingPlan(skillId: string, skillName: string, subject: "MATH" | "READING" | "SCIENCE", objective: string): CoachedPlan {
  const curated = COACHING_PLANS[skillId];
  if (curated) {
    return {
      skillId,
      skillName,
      subject,
      objective,
      ...curated,
    };
  }

  // Generate a highly structured fallback coaching plan based on the subject
  const subjectLabel = subject === "MATH" ? "mathematics" : subject === "READING" ? "early reading" : "science";
  const materials = subject === "MATH"
    ? ["Counters (coins, buttons, raisins)", "Paper and marker"]
    : subject === "READING"
    ? ["Picture book or storybook", "Sticky notes", "Crayon"]
    : ["Magnifying glass or paper", "Outdoor objects", "Drawing pencils"];

  const activity = subject === "MATH"
    ? `Set up a hands-on math game using your counters. Model the objective: '${objective}'. Then, let your child solve three problems with physical objects, celebrating their focus.`
    : subject === "READING"
    ? `Read a story together. Every time you find a word or sound related to our objective, highlight it on a sticky note and practice it. Keep it fun and lighthearted.`
    : `Explore your surroundings together! Look for real-world examples matching our objective. Discuss your findings and let your child sketch their observation on a piece of paper.`;

  return {
    skillId,
    skillName,
    subject,
    objective,
    parentExplanation: `This activity reinforces your child's understanding of ${skillName}, a key standard in the ${subjectLabel} curriculum.`,
    materialsNeeded: materials,
    instructionalScript: `Say: 'Today we are going to explore ${skillName}! Let's look at this together. It helps us learn how to: ${objective}.'`,
    activity,
    followUp: `Repeat this challenge in different rooms or settings during daily routines.`,
    checkUnderstanding: `Give a simple, hands-on task: 'Can you show or explain to me how you solve this?'`,
  };
}
