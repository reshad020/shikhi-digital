/**
 * The closed visual vocabulary the model may choose from.
 *
 * The AI never invents artwork — it picks a palette, a motif, some props and a
 * mood, and `SceneArt` renders those deterministically. That keeps every scene
 * on-brand and kid-safe, costs nothing per scene, and means a storyboard is a
 * few hundred bytes of JSON instead of a pile of images. Each scene also
 * carries an `imagePrompt` so real illustration can be layered on later without
 * regenerating anything.
 *
 * Adding a value here is safe; removing one will fail validation on existing
 * stored storyboards, so prefer deprecating in the UI over deleting.
 */

export const PALETTES = [
  "sunrise",
  "ocean",
  "forest",
  "candy",
  "night",
  "desert",
  "meadow",
  "storm",
] as const;

export const MOTIFS = [
  "person",
  "family",
  "crowd",
  "home",
  "school",
  "book",
  "letter",
  "locked-door",
  "key",
  "justice-scales",
  "flag",
  "megaphone",
  "footsteps",
  "handshake",
  "heart",
  "star",
  "sun",
  "moon",
  "mountain",
  "tree",
  "river",
  "bird",
  "globe",
  "lightbulb",
  "clock",
  "vote",
  "medicine",
  "plane",
  "ship",
  "farm",
  "factory",
  "science",
  "art",
  "sport",
  "music",
  "camera",
  "pen",
  "trophy",
] as const;

export const PROPS = [
  "stars",
  "circles",
  "triangles",
  "hearts",
  "clouds",
  "leaves",
  "sparkles",
  "zigzags",
  "dots",
  "rings",
  "blobs",
  "diamonds",
] as const;

export const MOODS = ["calm", "hopeful", "curious", "tense", "triumphant"] as const;

export type Palette = (typeof PALETTES)[number];
export type Motif = (typeof MOTIFS)[number];
export type Prop = (typeof PROPS)[number];
export type Mood = (typeof MOODS)[number];

/** Short guidance shown to the model so it picks meaningfully, not randomly. */
export const MOTIF_HINTS: Record<Motif, string> = {
  person: "one individual, a portrait moment",
  family: "parents, siblings, home life",
  crowd: "many people together, a community",
  home: "a house, a village, where someone grew up",
  school: "learning, classrooms, studying",
  book: "reading, writing, study, law",
  letter: "a written message, news arriving",
  "locked-door": "imprisonment, being shut out, restriction",
  key: "freedom, release, a solution found",
  "justice-scales": "law, fairness, a trial, a court",
  flag: "a country, national identity, independence",
  megaphone: "a speech, protest, speaking out",
  footsteps: "a march, a long journey, walking together",
  handshake: "peace, agreement, forgiveness, reconciliation",
  heart: "love, kindness, care for others",
  star: "hope, a dream, being celebrated",
  sun: "a new day, warmth, optimism",
  moon: "night, waiting, quiet reflection",
  mountain: "a hard challenge, endurance",
  tree: "growth over time, roots, patience",
  river: "change flowing onward, a journey",
  bird: "freedom, flying, escape",
  globe: "the whole world, international attention",
  lightbulb: "an idea, an invention, a realisation",
  clock: "time passing, many years",
  vote: "elections, democracy, choosing leaders",
  medicine: "health, healing, doctors",
  plane: "travel, going far away",
  ship: "sea voyages, exploration",
  farm: "farming, food, the countryside",
  factory: "work, industry, machines",
  science: "experiments, discovery, research",
  art: "painting, creating, imagination",
  sport: "games, competition, teamwork",
  music: "singing, instruments, celebration",
  camera: "being famous, photographs, the news",
  pen: "writing, signing something important",
  trophy: "an award, a prize, recognition",
};

export const PALETTE_HINTS: Record<Palette, string> = {
  sunrise: "warm orange and pink — beginnings, hope",
  ocean: "blues and teals — calm, distance, journeys",
  forest: "greens — growth, nature, home",
  candy: "pink and purple — playful, joyful",
  night: "deep indigo — quiet, difficult, reflective",
  desert: "sand and amber — heat, hardship, long waits",
  meadow: "light green and yellow — peace, freedom",
  storm: "grey and violet — conflict, struggle, tension",
};
