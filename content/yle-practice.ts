import type { PracticeSet } from "../src/lib/yle/items";
import { GENERATED_SETS } from "./yle-generated";

/**
 * Hand-authored YLE practice sets.
 *
 * Vocabulary is kept inside the published Cambridge wordlist for each level,
 * and the task wording mirrors the exam's own instructions — a child who has
 * practised here should find the real paper familiar rather than merely
 * similar.
 *
 * Distractors are chosen the way the exam chooses them: plausible, same part
 * of speech, wrong for a reason a child can learn from. A joke option turns a
 * three-way question into a two-way guess and teaches nothing.
 */
export const PRACTICE_SETS: PracticeSet[] = [
  // ---------------------------------------------------------------- Starters
  {
    id: "starters-rw3-animals",
    level: "starters",
    paper: "reading-writing",
    part: 3,
    kind: "spelling",
    title: "Spelling: animals and the home",
    instruction: "Look at the letters. Put them in order to spell the word.",
    questions: [
      { id: "s1", prompt: "It lives in water and it can swim.", answer: "fish", note: "Four letters, and the 'sh' goes at the end." },
      { id: "s2", prompt: "It has eight legs.", answer: "spider", note: "Six letters: s-p-i-d-e-r." },
      { id: "s3", prompt: "You sleep in it.", answer: "bed", note: "Three letters, and the shortest word here." },
      { id: "s4", prompt: "It is yellow and it is in the sky in the day.", answer: "sun", note: "Three letters. Not 'son' — that is a different word." },
      { id: "s5", prompt: "A big grey animal with a long nose.", answer: "elephant", note: "Eight letters, and the 'ph' sounds like 'f'." },
    ],
  },
  {
    id: "starters-rw4-park",
    level: "starters",
    paper: "reading-writing",
    part: 4,
    kind: "word-box",
    title: "Choose a word: a day at the park",
    instruction: "Choose a word from the box. Write the correct word next to each number.",
    passage:
      "On Saturday we go to the ___ . My brother takes his red ___ and rides it on the path. I like the ___ because you can go very high on it. Mum sits on a ___ under the big tree. We eat our lunch and then we go ___ .",
    wordBox: ["park", "bike", "swing", "chair", "home", "school", "boat"],
    questions: [
      { id: "p1", prompt: "Gap 1", answer: "park", note: "The place you go to play outside." },
      { id: "p2", prompt: "Gap 2", answer: "bike", note: "You ride it, and it is red in this story." },
      { id: "p3", prompt: "Gap 3", answer: "swing", note: "The one you can go high on." },
      { id: "p4", prompt: "Gap 4", answer: "chair", note: "Mum sits on it." },
      { id: "p5", prompt: "Gap 5", answer: "home", note: "Where you go at the end of the day." },
    ],
  },

  // ------------------------------------------------------------------ Movers
  {
    id: "movers-rw2-replies",
    level: "movers",
    paper: "reading-writing",
    part: 2,
    kind: "dialogue-choice",
    title: "What does Sam say?",
    instruction: "Read the conversation. Choose the best answer, A, B or C.",
    questions: [
      {
        id: "m1",
        prompt: "Anna: What did you do at the weekend?",
        answer: "I went to my cousin's house.",
        options: ["I went to my cousin's house.", "I am going now, thank you.", "Yes, it is very big."],
        note: "The question asks about the past, so the answer has to be about the past too.",
      },
      {
        id: "m2",
        prompt: "Anna: Would you like to come to the cinema?",
        answer: "Yes, please. What time?",
        options: ["Yes, please. What time?", "It was really good.", "I have got two."],
        note: "'Would you like to' is an invitation, so it needs a yes or a no.",
      },
      {
        id: "m3",
        prompt: "Anna: How many brothers have you got?",
        answer: "Two, and one sister.",
        options: ["Two, and one sister.", "He is eleven.", "Every Saturday."],
        note: "'How many' asks for a number.",
      },
      {
        id: "m4",
        prompt: "Anna: Where does your dad work?",
        answer: "At the hospital in town.",
        options: ["At the hospital in town.", "He is a doctor.", "On Mondays."],
        note: "'Where' asks for a place. 'He is a doctor' answers 'what does he do'.",
      },
      {
        id: "m5",
        prompt: "Anna: I am sorry I am late.",
        answer: "That's OK. Come and sit down.",
        options: ["That's OK. Come and sit down.", "Yes, I would like to.", "It is half past four."],
        note: "An apology needs an answer that accepts it.",
      },
      {
        id: "m6",
        prompt: "Anna: Shall we take some water with us?",
        answer: "Good idea. It is hot today.",
        options: ["Good idea. It is hot today.", "I drank it all.", "No, it is my sister's."],
        note: "'Shall we' is a suggestion, so the answer agrees or disagrees with the plan.",
      },
    ],
  },
  {
    id: "movers-rw4-penguins",
    level: "movers",
    paper: "reading-writing",
    part: 4,
    kind: "option-gap",
    title: "Choose the word: penguins",
    instruction: "Read the text and choose the best word, A, B or C, for each gap.",
    passage:
      "Penguins are birds, but they ___ (1) fly. They use their wings for swimming, and some of them can swim faster ___ (2) a person can run. Penguins live ___ (3) the cold south of the world, and they keep warm because they have very thick feathers. A mother penguin lays one egg and then ___ (4) to find food. The father keeps the egg warm on his feet for about two ___ (5) until she comes back.",
    questions: [
      { id: "g1", prompt: "Gap 1", answer: "cannot", options: ["cannot", "are not", "do not have"], note: "We say 'cannot fly' — 'can' goes with the verb." },
      { id: "g2", prompt: "Gap 2", answer: "than", options: ["than", "then", "that"], note: "'Faster than' is a comparison. 'Then' is about time." },
      { id: "g3", prompt: "Gap 3", answer: "in", options: ["in", "on", "at"], note: "We live 'in' a place like a country or a region." },
      { id: "g4", prompt: "Gap 4", answer: "goes", options: ["goes", "going", "gone"], note: "The sentence needs a simple present verb after 'and'." },
      { id: "g5", prompt: "Gap 5", answer: "months", options: ["months", "month", "monthly"], note: "'Two' needs a plural noun after it." },
    ],
  },

  // ------------------------------------------------------------------ Flyers
  {
    id: "flyers-rw1-definitions",
    level: "flyers",
    paper: "reading-writing",
    part: 1,
    kind: "definition",
    title: "Write the word: jobs and places",
    instruction: "Read the definition and write the word. Spelling counts.",
    questions: [
      { id: "f1", prompt: "This person helps you when you are ill.", answer: "doctor", note: "A nurse also helps, but this is the person who decides the treatment." },
      { id: "f2", prompt: "You go to this place to borrow books.", answer: "library", note: "Careful with the spelling: l-i-b-r-a-r-y." },
      { id: "f3", prompt: "This person brings your food in a restaurant.", answer: "waiter", alsoAccept: ["waitress"], note: "Either form is fine here." },
      { id: "f4", prompt: "You buy medicine in this shop.", answer: "chemist", alsoAccept: ["pharmacy"], note: "Both words are used in the Flyers wordlist." },
      { id: "f5", prompt: "This person flies a plane.", answer: "pilot", note: "Five letters, and it is spelled the way it sounds." },
      { id: "f6", prompt: "You wait here to catch a train.", answer: "station", note: "A stop is for buses; this one is for trains." },
      { id: "f7", prompt: "This person teaches you at school.", answer: "teacher", note: "Watch the 'ea' in the middle." },
      { id: "f8", prompt: "You keep your money in this building.", answer: "bank", note: "Four letters." },
      { id: "f9", prompt: "This person makes bread and cakes.", answer: "baker", note: "The shop is a bakery; the person is a baker." },
      { id: "f10", prompt: "You can watch a film in this place.", answer: "cinema", note: "Not a theatre — that is usually for plays." },
    ],
  },
  {
    id: "flyers-rw6-grammar",
    level: "flyers",
    paper: "reading-writing",
    part: 6,
    kind: "missing-word",
    title: "Write the missing word: a letter home",
    instruction: "Write one word in each gap. There are no options — you have to think of the word yourself.",
    passage:
      "Dear Grandma,\n\nWe arrived at the campsite yesterday. It ___ (1) raining when we got here, so we put the tent up very quickly! This morning the sun came out and we went down ___ (2) the lake. Dad caught a fish, but it was ___ (3) small that he put it back in the water. Tomorrow we ___ (4) going to walk up the hill behind the trees. I will send you a photo when we ___ (5) home.\n\nLove, Ravi",
    questions: [
      { id: "w1", prompt: "Gap 1", answer: "was", note: "The weather in the past, and 'it' is singular." },
      { id: "w2", prompt: "Gap 2", answer: "to", note: "We go 'down to' a place." },
      { id: "w3", prompt: "Gap 3", answer: "so", note: "'So small that…' shows the reason for what happened next." },
      { id: "w4", prompt: "Gap 4", answer: "are", note: "'We are going to' is how we talk about a plan." },
      { id: "w5", prompt: "Gap 5", answer: "get", alsoAccept: ["are", "come"], note: "'When we get home' is the most natural, but others work too." },
    ],
  },
  {
    id: "flyers-rw3-wordbox",
    level: "flyers",
    paper: "reading-writing",
    part: 3,
    kind: "word-box",
    title: "Choose a word: the sea",
    instruction: "Choose the right word from the box for each gap and copy it carefully.",
    passage:
      "The sea covers most of our ___ (1). In some places it is only a few metres deep, but in others it goes down for ___ (2) of metres. Very little light reaches the bottom, so the animals that live there are often ___ (3) and have very large eyes. Scientists use a small ___ (4) with strong lights to visit them. We have better maps of the moon than of the ocean ___ (5).",
    wordBox: ["planet", "thousands", "strange", "submarine", "floor", "beach", "quickly"],
    questions: [
      { id: "b1", prompt: "Gap 1", answer: "planet", note: "The sea covers most of the Earth." },
      { id: "b2", prompt: "Gap 2", answer: "thousands", note: "A number word, and it needs to be plural before 'of'." },
      { id: "b3", prompt: "Gap 3", answer: "strange", note: "A describing word for the animals." },
      { id: "b4", prompt: "Gap 4", answer: "submarine", note: "The small boat that goes under the water." },
      { id: "b5", prompt: "Gap 5", answer: "floor", note: "The bottom of the ocean is called the ocean floor." },
    ],
  },
];

/**
 * Everything available to practise: written by hand first, then generated.
 *
 * Hand-authored sets lead deliberately. They have been read by a person, and a
 * child arriving at a level should meet the best material first rather than
 * whatever the generator happened to produce.
 */
export const ALL_SETS: PracticeSet[] = [...PRACTICE_SETS, ...GENERATED_SETS];

export function setsForLevel(level: string) {
  return ALL_SETS.filter((s) => s.level === level);
}

export function setById(id: string) {
  return ALL_SETS.find((s) => s.id === id) ?? null;
}
