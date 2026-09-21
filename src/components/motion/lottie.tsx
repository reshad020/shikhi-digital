"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/**
 * Mascots and lesson illustrations. Point `src` at a .lottie/.json file in
 * /public/lottie (or a LottieFiles CDN url).
 */
export function LottiePlayer({
  src,
  className,
  loop = true,
  autoplay = true,
  speed = 1,
}: {
  src: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
}) {
  return (
    <DotLottieReact
      src={src}
      loop={loop}
      autoplay={autoplay}
      speed={speed}
      className={className}
    />
  );
}
