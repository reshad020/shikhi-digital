import {
  Bird,
  BookOpen,
  Camera,
  Clock,
  Factory,
  Flag,
  FlaskConical,
  Footprints,
  Globe2,
  Handshake,
  Heart,
  HeartPulse,
  Home,
  Key,
  Lightbulb,
  Lock,
  Mail,
  Medal,
  Megaphone,
  Moon,
  Mountain,
  Music,
  Palette,
  PenTool,
  Plane,
  Scale,
  School,
  Ship,
  Star,
  Sun,
  Trees,
  Trophy,
  User,
  Users,
  UsersRound,
  Vote,
  Waves,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import type { Motif, Mood, Palette as PaletteName, Prop } from "@/lib/storyboard/art";
import { cn } from "@/lib/utils";

/**
 * Renders a scene's artwork from the four values the model chose. Deterministic
 * and dependency-free — the same art object always draws the same picture.
 */

export const MOTIF_ICONS: Record<Motif, LucideIcon> = {
  person: User,
  family: Users,
  crowd: UsersRound,
  home: Home,
  school: School,
  book: BookOpen,
  letter: Mail,
  "locked-door": Lock,
  key: Key,
  "justice-scales": Scale,
  flag: Flag,
  megaphone: Megaphone,
  footsteps: Footprints,
  handshake: Handshake,
  heart: Heart,
  star: Star,
  sun: Sun,
  moon: Moon,
  mountain: Mountain,
  tree: Trees,
  river: Waves,
  bird: Bird,
  globe: Globe2,
  lightbulb: Lightbulb,
  clock: Clock,
  vote: Vote,
  medicine: HeartPulse,
  plane: Plane,
  ship: Ship,
  farm: Wheat,
  factory: Factory,
  science: FlaskConical,
  art: Palette,
  sport: Medal,
  music: Music,
  camera: Camera,
  pen: PenTool,
  trophy: Trophy,
};

/** `from` / `via` / `to` stops plus the ink colour the motif is drawn in. */
const PALETTE_STYLES: Record<PaletteName, { gradient: string; ink: string; prop: string }> = {
  sunrise: { gradient: "from-[#FFD3A5] via-[#FD9C6E] to-[#F27A9B]", ink: "text-[#7A2E4E]", prop: "bg-[#FFF1DC]" },
  ocean: { gradient: "from-[#A8E6F0] via-[#5EC8E5] to-[#3E7BC4]", ink: "text-[#0F3B63]", prop: "bg-[#E3F8FD]" },
  forest: { gradient: "from-[#C7F0BD] via-[#7FD08C] to-[#3F9D6B]", ink: "text-[#14472F]", prop: "bg-[#EBFBE6]" },
  candy: { gradient: "from-[#FFD1F0] via-[#E5A8F5] to-[#A87BE8]", ink: "text-[#4B1C6B]", prop: "bg-[#FDEBFA]" },
  night: { gradient: "from-[#4B4C87] via-[#33356B] to-[#1B1C3D]", ink: "text-[#EDE6FF]", prop: "bg-[#7B7CC4]" },
  desert: { gradient: "from-[#FBE3B0] via-[#EDBC72] to-[#C98A4B]", ink: "text-[#5A3312]", prop: "bg-[#FFF5E1]" },
  meadow: { gradient: "from-[#F2F7C6] via-[#C6E88E] to-[#8CCB6B]", ink: "text-[#2F4B18]", prop: "bg-[#FBFEE9]" },
  storm: { gradient: "from-[#C9CEDD] via-[#8E94B5] to-[#5C5F86]", ink: "text-[#22243F]", prop: "bg-[#EDEFF7]" },
};

/** Each prop is drawn as a small clipped shape, scattered by PROP_LAYOUT. */
const PROP_SHAPES: Record<Prop, string> = {
  stars: "[clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]",
  circles: "rounded-full",
  triangles: "[clip-path:polygon(50%_0%,100%_100%,0%_100%)]",
  hearts: "[clip-path:path('M12_21s-9-5.5-9-12a5_5_0_0_1_9-3_5_5_0_0_1_9_3c0_6.5-9_12-9_12z')]",
  clouds: "rounded-[40%_60%_55%_45%/60%_45%_55%_40%]",
  leaves: "rounded-[0%_100%_0%_100%]",
  sparkles: "[clip-path:polygon(50%_0%,58%_42%,100%_50%,58%_58%,50%_100%,42%_58%,0%_50%,42%_42%)]",
  zigzags: "[clip-path:polygon(0%_30%,20%_0%,40%_30%,60%_0%,80%_30%,100%_0%,100%_60%,0%_60%)]",
  dots: "rounded-full",
  rings: "rounded-full border-[6px] border-current bg-transparent",
  blobs: "rounded-[60%_40%_45%_55%/50%_60%_40%_50%]",
  diamonds: "[clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)]",
};

/** Fixed positions so art never reflows or looks random between renders. */
const PROP_LAYOUT = [
  "left-[8%] top-[14%] size-[14%] opacity-70",
  "right-[10%] top-[22%] size-[10%] opacity-55",
  "left-[18%] bottom-[12%] size-[9%] opacity-60",
] as const;

const MOOD_MOTION: Record<Mood, string> = {
  calm: "",
  hopeful: "animate-float",
  curious: "animate-float",
  tense: "",
  triumphant: "animate-float",
};

export type SceneArtValue = {
  palette: PaletteName;
  motif: Motif;
  props: Prop[];
  mood: Mood;
};

export function SceneArt({
  art,
  className,
  animate = false,
}: {
  art: SceneArtValue;
  className?: string;
  animate?: boolean;
}) {
  const palette = PALETTE_STYLES[art.palette];
  const Icon = MOTIF_ICONS[art.motif];

  return (
    <div
      role="img"
      aria-label={`${art.motif.replace(/-/g, " ")}, ${art.mood}`}
      className={cn(
        "relative isolate grid place-items-center overflow-hidden bg-gradient-to-br",
        palette.gradient,
        className,
      )}
    >
      {art.props.slice(0, 3).map((prop, i) => (
        <span
          key={`${prop}-${i}`}
          aria-hidden
          className={cn("absolute", PROP_LAYOUT[i], palette.prop, PROP_SHAPES[prop])}
        />
      ))}

      <Icon
        aria-hidden
        strokeWidth={1.75}
        className={cn(
          "relative size-[42%] drop-shadow-sm",
          palette.ink,
          animate && MOOD_MOTION[art.mood],
        )}
      />
    </div>
  );
}
