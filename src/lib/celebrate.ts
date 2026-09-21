import confetti from "canvas-confetti";

const KID_COLORS = ["#8B5CF6", "#38BDF8", "#34D399", "#FBBF24", "#F472B6", "#FB923C"];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Quick burst — use for a single correct answer. */
export function celebrate(origin: { x: number; y: number } = { x: 0.5, y: 0.6 }) {
  if (prefersReducedMotion()) return;
  confetti({
    particleCount: 90,
    spread: 70,
    startVelocity: 38,
    scalar: 1.1,
    colors: KID_COLORS,
    origin,
    disableForReducedMotion: true,
  });
}

/** Bigger, two-sided cannon — use when a whole lesson is finished. */
export function celebrateBig() {
  if (prefersReducedMotion()) return;
  const end = Date.now() + 1200;
  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: KID_COLORS,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: KID_COLORS,
      disableForReducedMotion: true,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

/** Rain of stars — the "you earned a badge" moment. */
export function celebrateStars() {
  if (prefersReducedMotion()) return;
  confetti({
    particleCount: 60,
    spread: 100,
    shapes: ["star"],
    colors: ["#FBBF24", "#FDE68A", "#F59E0B"],
    scalar: 1.3,
    origin: { x: 0.5, y: 0.35 },
    disableForReducedMotion: true,
  });
}
