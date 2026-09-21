"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProgressState = {
  stars: number;
  streak: number;
  completedLessons: string[];
  soundOn: boolean;
  awardStar: (amount?: number) => void;
  completeLesson: (id: string) => void;
  toggleSound: () => void;
  reset: () => void;
};

/**
 * Local-first progress. Swap `persist` storage for a server sync later without
 * touching any component that reads this store.
 */
export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      stars: 0,
      streak: 0,
      completedLessons: [],
      soundOn: true,
      awardStar: (amount = 1) => set((s) => ({ stars: s.stars + amount })),
      completeLesson: (id) =>
        set((s) =>
          s.completedLessons.includes(id)
            ? s
            : {
                completedLessons: [...s.completedLessons, id],
                stars: s.stars + 3,
                streak: s.streak + 1,
              },
        ),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      reset: () => set({ stars: 0, streak: 0, completedLessons: [] }),
    }),
    { name: "shikhi-progress" },
  ),
);
