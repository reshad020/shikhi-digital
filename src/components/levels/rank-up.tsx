"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { celebrateStars } from "@/lib/celebrate";
import { acknowledgeRank } from "@/lib/levels/actions";

/**
 * Shown once, the first time a child reaches a new Thinking Level.
 *
 * Fires on mount rather than on a click because the promotion already happened —
 * this is an announcement, not an action. The acknowledgement is written
 * server-side so it does not reappear on another device.
 */
export function RankUp({
  childId,
  rankSlug,
  rankName,
}: {
  childId: string;
  rankSlug: string;
  rankName: string;
}) {
  const [open, setOpen] = useState(true);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    celebrateStars();
    void acknowledgeRank(childId, rankSlug);
  }, [childId, rankSlug]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex max-w-sm flex-col items-center gap-4 rounded-4xl border-2 bg-card p-8 text-center shadow-pop"
          >
            <Trophy className="size-14 text-sunny" aria-hidden />
            <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              New thinking level
            </p>
            <h2 className="font-heading text-3xl font-extrabold">{rankName}</h2>
            <p className="text-muted-foreground">
              You earned this by how you think, not by how much you tapped.
            </p>
            <Button
              onClick={() => setOpen(false)}
              className="btn-pop h-12 rounded-full px-8 text-base font-bold"
            >
              Nice
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
