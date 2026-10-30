/**
 * Hand-authored listening passages.
 *
 * Normally `generatePassage` writes these. These are written by hand so the
 * library is not empty while the Gemini key has no credit — and because the
 * constraint that matters most here is one a model keeps breaking.
 *
 * **The inference question must not be answerable from the transcript.** If it
 * is, the second question is a duplicate of the first and the only part of the
 * exercise that requires thinking disappears. Every one below was checked by
 * reading the transcript and confirming the answer is genuinely absent from it.
 *
 * They are also written for the ear rather than the eye: short sentences, one
 * idea each, concrete nouns, numbers spelled out (a speech engine reads digits
 * unevenly), and no parentheses or lists — a listener cannot scan back.
 */

export type PassageSource = {
  title: string;
  topic: string;
  transcript: string;
  recallQuestion: string;
  recallOptions: { text: string; isCorrect: boolean; feedback: string }[];
  inferenceQuestion: string;
  inferenceOptions: { text: string; isCorrect: boolean; feedback: string }[];
  defendPrompt: string;
};

export const PASSAGES: PassageSource[] = [
  {
    title: "The Bird That Leads People",
    topic: "Animals and people",
    transcript:
      "In parts of Africa there is a small brown bird called a honeyguide. It knows where the wild bee nests are. It cannot get inside them, because the bees would sting it and the nest is usually sealed in a tree. So the bird finds a person instead. Honey hunters in Mozambique make a special call, a sort of trill and a grunt. When a honeyguide hears it, it flies close and chatters back. Then it flits from branch to branch, waiting each time for the person to catch up, leading them through the bush to the nest. The hunters open the nest with smoke and take the honey. The bird eats the wax left behind. Scientists tested the call. When hunters used the proper sound, honeyguides helped them about twice as often as when they made other noises.",
    recallQuestion: "What does the honeyguide eat after the nest is opened?",
    recallOptions: [
      { text: "The wax that is left behind", isCorrect: true, feedback: "Yes — the people take the honey, the bird takes the wax." },
      { text: "The honey", isCorrect: false, feedback: "Close, but listen again — the honey goes to the hunters." },
      { text: "The bees", isCorrect: false, feedback: "It is after something left in the nest once the hunters have finished." },
    ],
    inferenceQuestion: "Why might the bird have learned to work with people rather than other animals?",
    inferenceOptions: [
      {
        text: "People can open a sealed nest without being driven off",
        isCorrect: true,
        feedback: "That fits. The hunters use smoke, and the bird cannot do anything like that alone.",
      },
      {
        text: "People are quieter than other animals",
        isCorrect: false,
        feedback: "Honey hunters are not quiet at all — they call out to the bird on purpose.",
      },
      {
        text: "Because people feed the birds afterwards",
        isCorrect: false,
        feedback: "Nobody hands the bird anything. It takes what the hunters leave.",
      },
    ],
    defendPrompt: "What made you choose that answer?",
  },

  {
    title: "Three Hearts and Blue Blood",
    topic: "Ocean animals",
    transcript:
      "An octopus has three hearts. Two of them push blood through the gills. The third pushes it around the rest of the body. Here is the odd part. When an octopus swims, the third heart stops beating. So swimming is exhausting for it, and most octopuses would rather walk along the seabed than swim anywhere. Its blood is blue, not red. Ours is red because it carries oxygen using iron. An octopus uses copper instead, and copper turns blue when it picks up oxygen. Copper works better than iron in cold water with very little oxygen in it, which is exactly where a lot of octopuses live. An octopus also tastes with its arms. The suckers can sense chemicals, so when it reaches into a dark crack in a rock, it already knows whether what it has found is worth eating.",
    recallQuestion: "What happens to the third heart when an octopus swims?",
    recallOptions: [
      { text: "It stops beating", isCorrect: true, feedback: "Right — which is why swimming tires them out so quickly." },
      { text: "It beats twice as fast", isCorrect: false, feedback: "Listen again — it does the opposite of speeding up." },
      { text: "It moves to the other side", isCorrect: false, feedback: "The hearts stay where they are. Something else happens to the third one." },
    ],
    inferenceQuestion: "Why would blue blood be an advantage in deep, cold water?",
    inferenceOptions: [
      {
        text: "Copper carries oxygen better when there is very little of it",
        isCorrect: true,
        feedback: "Yes — and deep cold water is exactly where oxygen is scarce.",
      },
      {
        text: "Blue is harder for predators to see",
        isCorrect: false,
        feedback: "A clever thought, but blood stays inside the animal where nothing can see it.",
      },
      {
        text: "Because copper is heavier than iron",
        isCorrect: false,
        feedback: "Weight is not the point here — it is about how well each one grabs oxygen.",
      },
    ],
    defendPrompt: "Why do you think that is the answer?",
  },

  {
    title: "The Handle He Took Away",
    topic: "A doctor and a map",
    transcript:
      "In London, in eighteen fifty-four, people in one neighbourhood started dying very quickly of cholera. Almost everybody believed the illness travelled through bad air. A doctor called John Snow did not believe that. He walked the streets and marked every death on a map, one small bar for each one. The marks piled up around a single water pump on Broad Street. He also found the odd cases. A woman who had moved far away still died, because she liked the taste of that water and had it brought to her. The workers in a nearby brewery did not get ill at all. They drank beer, not water. Snow persuaded the local officials to remove the handle from the pump so nobody could use it. The outbreak faded. Many people still did not believe him for years afterwards.",
    recallQuestion: "What did John Snow do to the pump?",
    recallOptions: [
      { text: "He had the handle removed", isCorrect: true, feedback: "Yes — a very small action that stopped people using it." },
      { text: "He cleaned the water", isCorrect: false, feedback: "He did not treat the water. He stopped people reaching it." },
      { text: "He put up a warning sign", isCorrect: false, feedback: "A sign can be ignored. What he did made the pump impossible to use." },
    ],
    inferenceQuestion: "Why did the brewery workers matter so much to his argument?",
    inferenceOptions: [
      {
        text: "They breathed the same air but drank different liquid, and stayed well",
        isCorrect: true,
        feedback: "Exactly. If bad air caused it, they should have been ill too.",
      },
      {
        text: "They were stronger than other people",
        isCorrect: false,
        feedback: "Nothing suggests that. What was different about them was what they drank.",
      },
      {
        text: "They lived further away",
        isCorrect: false,
        feedback: "The brewery was nearby. That is part of why they were such useful evidence.",
      },
    ],
    defendPrompt: "What made the brewery workers such good evidence?",
  },

  {
    title: "Why Ice Sits on Top",
    topic: "Everyday science",
    transcript:
      "Almost everything shrinks when it gets colder. The bits inside move less, so they pack closer together, and the whole thing becomes heavier for its size. Water does that too, down to about four degrees above freezing. Then it does something strange. As it keeps cooling, it starts to expand again. When it finally freezes, the water molecules lock into a open framework with gaps in it. That ice is lighter than the water around it, so it floats. Now think about a lake in winter. The ice forms at the surface and stays there. Underneath, the water keeps flowing, and it stays close to four degrees all the way down. Fish, frogs and insects carry on living in it. Every winter, the lake freezes from the top.",
    recallQuestion: "At roughly what temperature does water stop shrinking and start expanding?",
    recallOptions: [
      { text: "About four degrees above freezing", isCorrect: true, feedback: "Yes — and that is the moment water stops behaving like other liquids." },
      { text: "Exactly at freezing point", isCorrect: false, feedback: "The change begins a little before it freezes." },
      { text: "About forty degrees", isCorrect: false, feedback: "Much colder than that. Listen for the number again." },
    ],
    inferenceQuestion: "What would happen to lakes in winter if ice sank instead of floating?",
    inferenceOptions: [
      {
        text: "They would freeze solid from the bottom up",
        isCorrect: true,
        feedback: "Yes — and then there would be nowhere for the fish and frogs to survive.",
      },
      {
        text: "They would never freeze at all",
        isCorrect: false,
        feedback: "The cold would still be there. The difference is where the ice would end up.",
      },
      {
        text: "They would get warmer",
        isCorrect: false,
        feedback: "Sinking ice would not add heat. Think about where the ice would pile up.",
      },
    ],
    defendPrompt: "How did you work that out?",
  },

  {
    title: "The City That Could Not Afford Trains",
    topic: "How a city solved a problem",
    transcript:
      "In the nineteen seventies, the Brazilian city of Curitiba was growing fast and the traffic was getting worse. The obvious answer was an underground railway. The city could not possibly pay for one. So the planners asked a different question. What is it about a train that makes it fast? They decided it was three things. A train has its own track, so nothing blocks it. People buy tickets before they board. And the doors are level with the platform, so everyone gets on quickly. So Curitiba built those three things for buses instead. Whole lanes were given to buses alone. Passengers paid at glass tube stations beside the road. The bus floor lined up with the station floor. It cost a tiny fraction of a railway. Cities all over the world have copied it since.",
    recallQuestion: "Where did passengers in Curitiba pay for their journey?",
    recallOptions: [
      { text: "At the station, before boarding", isCorrect: true, feedback: "Yes — in glass tube stations beside the road." },
      { text: "To the driver as they got on", isCorrect: false, feedback: "That is the slow way, and avoiding it was part of the whole idea." },
      { text: "Once a month at a city office", isCorrect: false, feedback: "Listen again for where the paying happened." },
    ],
    inferenceQuestion: "What was the most useful thing the planners did?",
    inferenceOptions: [
      {
        text: "They worked out why trains are fast, instead of asking for a train",
        isCorrect: true,
        feedback: "Yes. Once they knew the reasons, they could get them another way.",
      },
      {
        text: "They saved money by buying cheaper buses",
        isCorrect: false,
        feedback: "The buses were not the clever part — the system around them was.",
      },
      {
        text: "They persuaded people to stop driving",
        isCorrect: false,
        feedback: "That came later, and only because the buses had become genuinely quick.",
      },
    ],
    defendPrompt: "What made you pick that one?",
  },

  {
    title: "The Deepest Place",
    topic: "The deep sea",
    transcript:
      "The deepest part of the ocean is a trench in the Pacific, nearly eleven kilometres straight down. If you could drop the tallest mountain on Earth into it, the peak would still be more than a kilometre underwater. Down there the pressure is about a thousand times what you feel standing on a beach. It is like having a large car pressing on every square centimetre of you. There is no light at all. Nothing has grown from sunlight for the whole journey down. And yet it is not empty. There are small shrimp-like creatures, and strange single-celled things the size of your fist. In twenty nineteen, an explorer reached the bottom and reported something nobody wanted to hear. He saw what looked like a plastic bag.",
    recallQuestion: "How deep is the deepest part of the ocean?",
    recallOptions: [
      { text: "Nearly eleven kilometres", isCorrect: true, feedback: "Yes — deep enough to swallow the tallest mountain with room to spare." },
      { text: "About one kilometre", isCorrect: false, feedback: "Much deeper. Listen again for the number." },
      { text: "Nearly one hundred kilometres", isCorrect: false, feedback: "Not that deep — but still further down than any mountain is tall." },
    ],
    inferenceQuestion: "Why was the plastic bag such bad news?",
    inferenceOptions: [
      {
        text: "If rubbish reaches the hardest place to get to, it is everywhere",
        isCorrect: true,
        feedback: "That is exactly why people found it so troubling.",
      },
      {
        text: "Because the bag was dangerous to the explorer",
        isCorrect: false,
        feedback: "It was not a danger to him. The problem was what it meant.",
      },
      {
        text: "Because it blocked the light down there",
        isCorrect: false,
        feedback: "There is no light at that depth for anything to block.",
      },
    ],
    defendPrompt: "Why do you think that discovery upset people?",
  },
];
