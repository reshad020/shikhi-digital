import { Howl } from "howler";

/**
 * Tiny sound bus. Drop mp3/ogg files into /public/sounds and they become
 * available here. Audio is lazily constructed so nothing loads until a child
 * actually triggers a sound, and everything is a no-op if the file is missing.
 */
export type SoundName = "correct" | "wrong" | "pop" | "levelUp" | "star";

const SOURCES: Record<SoundName, string> = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  pop: "/sounds/pop.mp3",
  levelUp: "/sounds/level-up.mp3",
  star: "/sounds/star.mp3",
};

const cache = new Map<SoundName, Howl>();
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
  cache.forEach((howl) => howl.mute(value));
}

export function isMuted() {
  return muted;
}

export function playSound(name: SoundName, volume = 0.6) {
  if (typeof window === "undefined" || muted) return;
  let howl = cache.get(name);
  if (!howl) {
    howl = new Howl({ src: [SOURCES[name]], volume, preload: true, html5: false });
    // A missing asset should never break a lesson.
    howl.on("loaderror", () => cache.delete(name));
    cache.set(name, howl);
  }
  howl.play();
}
