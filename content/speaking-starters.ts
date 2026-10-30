import type { SpeakingCue } from "@/lib/speaking/cue";
import type { Level } from "@/lib/pool/serve";

/**
 * Hand-written speaking cues, one small set per level.
 *
 * The pool generates on a miss, so these are not what makes speaking work --
 * they are what makes it work on day one, and on any day the model is
 * unreachable, rate limited or out of credit. A child who opens Speaking and
 * is told "try again later" does not come back, and speaking is already the
 * skill a learner is looking for an excuse to skip.
 *
 * Written rather than generated for the same reason ieltsbiz hand-authors its
 * first sets: these are the cues most children will meet first, so they are
 * worth a person's attention. They seed as `source: 'hand'` and rotate
 * alongside generated ones on exactly the same terms.
 *
 * Every prompt has to be answerable by any child anywhere -- no assumed
 * holidays, pets, family shape or money.
 */
export const SPEAKING_STARTERS: Record<Level, SpeakingCue[]> = {
  "pre-a1": [
    {
      title: "Things you like",
      topic: "Favourites",
      prompt: "Tell me about three things you like.",
      bullets: ["a food", "a colour", "something you do"],
      usefulWords: ["I like", "because", "it is", "my favourite"],
      modelAnswer:
        "I like rice. I like the colour blue. And I like running. Running is my favourite.",
      secondsTarget: 20,
    },
    {
      title: "Your room",
      topic: "Home",
      prompt: "Tell me what is in the room you are in.",
      bullets: ["what you can see", "what colour it is", "what you do there"],
      usefulWords: ["there is", "there are", "near", "big", "small"],
      modelAnswer:
        "There is a window. There is a table and two chairs. The table is brown. I do my homework there.",
      secondsTarget: 20,
    },
  ],
  a1: [
    {
      title: "A meal you like",
      topic: "Food",
      prompt: "Tell me about a meal you like eating.",
      bullets: ["what is in it", "when you eat it", "why you like it"],
      usefulWords: ["taste", "cook", "delicious", "usually", "because"],
      modelAnswer:
        "I like eating noodles. There are vegetables and egg in them. I usually eat them after school because I am hungry. They taste really good.",
      secondsTarget: 30,
    },
    {
      title: "Getting to school",
      topic: "Daily life",
      prompt: "Tell me how you get to school.",
      bullets: ["how you travel", "how long it takes", "what you see on the way"],
      usefulWords: ["walk", "bus", "takes about", "on the way", "past"],
      modelAnswer:
        "I walk to school with my friend. It takes about fifteen minutes. On the way we go past a big park and a small shop.",
      secondsTarget: 30,
    },
  ],
  a2: [
    {
      title: "Something you learned",
      topic: "Learning",
      prompt: "Tell me about something you learned to do.",
      bullets: ["what it was", "how you learned it", "how it felt"],
      usefulWords: ["at first", "practise", "difficult", "finally", "proud"],
      modelAnswer:
        "I learned to ride a bicycle. At first it was really difficult and I fell off a few times. My cousin held the back of the seat while I practised. After about a week I could do it on my own, and I felt really proud.",
      secondsTarget: 45,
    },
    {
      title: "A good day",
      topic: "Experiences",
      prompt: "Tell me about a day you enjoyed.",
      bullets: ["what happened", "who you were with", "why it was good"],
      usefulWords: ["we decided", "then", "afterwards", "the best part", "because"],
      modelAnswer:
        "Last weekend my family and I went to a market. We decided to go early because it gets crowded. I tried a fruit I had never eaten before. The best part was watching a man make bread, because he was so fast.",
      secondsTarget: 45,
    },
  ],
  b1: [
    {
      title: "What makes a good friend",
      topic: "People",
      prompt: "Tell me what you think makes someone a good friend.",
      bullets: ["one quality that matters", "an example", "whether you agree it is the most important"],
      usefulWords: ["honest", "rely on", "for example", "in my opinion", "although"],
      modelAnswer:
        "I think the most important thing is being honest, even when it is uncomfortable. For example, a friend of mine told me my drawing needed work, and although I did not want to hear it, she was right and it helped me. Some people would say being kind matters more, but I think honesty is a kind of kindness.",
      secondsTarget: 60,
    },
    {
      title: "Changing one rule",
      topic: "Opinions",
      prompt: "If you could change one rule at school, tell me which one and why.",
      bullets: ["the rule you would change", "why it does not work", "what you would put instead"],
      usefulWords: ["I would change", "the problem is", "instead", "it would mean", "fair"],
      modelAnswer:
        "I would change the rule that we cannot talk during lunch. The problem is that lunch is the only time we actually see each other, so making it silent does not really help anyone concentrate later. Instead I would allow quiet talking, and it would mean people arrive at afternoon lessons in a better mood.",
      secondsTarget: 60,
    },
  ],
};
