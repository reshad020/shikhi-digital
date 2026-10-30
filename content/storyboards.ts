import type { Storyboard } from "../src/lib/storyboard/schema";

/**
 * Hand-authored storyboards.
 *
 * Normally a storyboard comes from `generateStoryboard`: an adult writes the
 * source text in `lessons.ts` and Gemini turns it into scenes. These are
 * written by hand instead, and typed as `Storyboard` so the compiler checks
 * every field against the real schema — including the closed art vocabulary,
 * where a palette or motif that does not exist is a type error rather than a
 * blank rectangle at runtime.
 *
 * Two things every one of these follows, because they are what the product is
 * for rather than decoration:
 *
 * - **Exactly two quiz questions are `defend: true`**, and they are the two
 *   where a child's reasoning is more interesting than the fact. Those are the
 *   ones that reach the grader and end up in the weekly report.
 * - **Wrong options are never silly.** A joke option turns a three-way
 *   question into a two-way guess, and a child who picks correctly by
 *   elimination has demonstrated nothing.
 *
 * Keyed by the subject in `lessons.ts`, so the seed script pairs them up.
 */
export const STORYBOARDS: Record<string, Storyboard> = {
  "Wangari Maathai": {
    title: "The Woman Who Planted a Forest",
    hook: "She was told women could not plant trees. She planted fifty million.",
    bigIdea: "Wangari Maathai saw that empty hills and hungry families were the same problem.",
    heroEmoji: "🌳",
    scenes: [
      {
        id: "the-missing-tree",
        title: "The Missing Tree",
        narration:
          "When Wangari was small, a big fig tree grew by a stream near her home. Her mother said never to cut it. Years later she came back. The tree was gone, and so was the stream.",
        art: { palette: "meadow", motif: "tree", props: ["leaves", "dots"], mood: "calm" },
        imagePrompt:
          "A large friendly cartoon fig tree beside a clear stream on a green hillside, warm light, no text.",
        interaction: {
          kind: "reveal",
          prompt: "The tree had gone. What else had disappeared with it?",
          revealAnswer: "The stream. Tree roots hold water in the ground, so when they go, it goes.",
          choices: [],
        },
      },
      {
        id: "one-problem",
        title: "One Problem, Not Four",
        narration:
          "Women walked further every year to find firewood. Crops grew smaller. Rivers ran dry. Most people saw four separate troubles. Wangari saw one.",
        art: { palette: "desert", motif: "river", props: ["zigzags", "clouds"], mood: "tense" },
        imagePrompt:
          "A dry cracked riverbed winding through bare brown hills under a pale sky, gentle not frightening, no text.",
        interaction: {
          kind: "choice",
          prompt: "What did Wangari think was behind all of it?",
          revealAnswer: "",
          choices: [
            {
              text: "The trees were gone",
              isCorrect: true,
              feedback: "Yes. No trees meant no roots, so the soil and the water washed away.",
            },
            {
              text: "People had stopped farming",
              isCorrect: false,
              feedback: "People were still farming hard — the land itself had changed underneath them.",
            },
            {
              text: "The rain had stopped falling",
              isCorrect: false,
              feedback: "Good thinking. The rain still came, but with no roots to hold it, it ran straight off.",
            },
          ],
        },
      },
      {
        id: "a-simple-idea",
        title: "A Very Simple Idea",
        narration:
          "In 1977 she suggested something small. Ordinary women would plant trees in their own villages. They would be paid a little for every seedling that lived. Officials laughed and said women had no training.",
        art: { palette: "sunrise", motif: "crowd", props: ["leaves", "sparkles"], mood: "hopeful" },
        imagePrompt:
          "A group of cheerful cartoon women planting small seedlings in tins and pots along a path, no text.",
        interaction: {
          kind: "reveal",
          prompt: "Why pay for every seedling that survived, instead of every seed planted?",
          revealAnswer:
            "Because planting is easy and keeping a tree alive is hard. She paid for the part that was difficult.",
          choices: [],
        },
      },
      {
        id: "chained-to-a-tree",
        title: "Chained to a Tree",
        narration:
          "Some powerful people were taking land she wanted to protect. Wangari was beaten by police and put in prison more than once. Once she chained herself to a tree in a park in Nairobi so it could not be built on.",
        art: { palette: "storm", motif: "megaphone", props: ["zigzags", "triangles"], mood: "tense" },
        imagePrompt:
          "A determined cartoon woman standing beside a tall tree in a city park, grey sky, gentle not frightening, no text.",
        interaction: {
          kind: "reveal",
          prompt: "Is that park still there today?",
          revealAnswer: "Yes. Uhuru Park in Nairobi is still open, and people still use it.",
          choices: [],
        },
      },
      {
        id: "a-prize-for-trees",
        title: "A Prize for Trees",
        narration:
          "By the time she died in 2011, more than fifty million trees had been planted. In 2004 she became the first African woman to win the Nobel Peace Prize. Not for stopping a war. For planting trees.",
        art: { palette: "forest", motif: "trophy", props: ["leaves", "stars", "sparkles"], mood: "triumphant" },
        imagePrompt:
          "A hillside covered in healthy young cartoon trees with a bright medal-like sun above, no text.",
        interaction: {
          kind: "choice",
          prompt: "Why would a peace prize be given for planting trees?",
          revealAnswer: "",
          choices: [
            {
              text: "When land runs out, people fight over what is left",
              isCorrect: true,
              feedback: "Exactly. She was stopping arguments before they could start.",
            },
            {
              text: "Because trees are peaceful and quiet",
              isCorrect: false,
              feedback: "A lovely thought, but the prize was about something more practical than that.",
            },
          ],
        },
      },
    ],
    glossary: [
      { word: "seedling", kidDefinition: "A very young plant, just big enough to move." },
      { word: "soil erosion", kidDefinition: "When rain washes away the earth that plants grow in." },
      { word: "Nobel Peace Prize", kidDefinition: "A famous award for people who help the world be peaceful." },
    ],
    quiz: [
      {
        id: "q-tree",
        question: "What happened to the stream after the fig tree was cut down?",
        hint: "Think about what tree roots do underground.",
        options: [
          { text: "It dried up", isCorrect: true, feedback: "Right. The roots were holding that water in place." },
          { text: "It got wider", isCorrect: false, feedback: "The opposite happened — without roots, the water left." },
          { text: "It stayed the same", isCorrect: false, feedback: "Something did change. The water went away with the roots." },
        ],
        defend: false,
        defendPrompt: "",
      },
      {
        id: "q-connection",
        question: "What connection did Wangari notice that other people missed?",
        hint: "She thought several problems were really one problem.",
        options: [
          {
            text: "Missing trees caused the hunger and the dry rivers",
            isCorrect: true,
            feedback: "Yes — one cause underneath several different-looking troubles.",
          },
          {
            text: "People were not working hard enough",
            isCorrect: false,
            feedback: "She never thought that. She thought the land had been changed.",
          },
          {
            text: "The villages were in the wrong place",
            isCorrect: false,
            feedback: "The villages were fine. What had changed was what grew around them.",
          },
        ],
        defend: true,
        defendPrompt: "How did you work that out?",
      },
      {
        id: "q-women",
        question: "Who did Wangari ask to plant the trees?",
        hint: "Not scientists, and not the government.",
        options: [
          { text: "Ordinary women in the villages", isCorrect: true, feedback: "Correct, and she taught them herself when officials refused." },
          { text: "Trained forest scientists", isCorrect: false, feedback: "Officials wanted that. She thought the village women could do it." },
          { text: "Soldiers", isCorrect: false, feedback: "Not soldiers — the people already living on the land." },
        ],
        defend: false,
        defendPrompt: "",
      },
      {
        id: "q-peace",
        question: "Why did the Nobel committee call tree planting peaceful work?",
        hint: "Think about what people argue over when there is not enough to go round.",
        options: [
          {
            text: "Protecting land stops fights over what is left",
            isCorrect: true,
            feedback: "That was their reasoning exactly.",
          },
          {
            text: "Because gardening is a calm hobby",
            isCorrect: false,
            feedback: "It was harder work than that, and the reason was about preventing conflict.",
          },
          {
            text: "Because she asked them to",
            isCorrect: false,
            feedback: "The committee chose her. She did not ask.",
          },
        ],
        defend: true,
        defendPrompt: "What made you sure it was that one?",
      },
    ],
    celebration: {
      headline: "You followed the roots all the way down!",
      funFact: "Wangari once said that when she started, she was simply planting trees — and only later realised she was planting an argument.",
    },
  },

  "King Sejong and the Korean alphabet": {
    title: "The King Who Invented Letters",
    hook: "He was a king. He sat down and designed an alphabet himself.",
    bigIdea: "Sejong built a writing system on purpose, so that ordinary people could learn it fast.",
    heroEmoji: "✍️",
    scenes: [
      {
        id: "nobody-could-read",
        title: "Nobody Could Read",
        narration:
          "Six hundred years ago in Korea, writing meant Chinese characters. Learning them took years. Scholars could read. Farmers, soldiers and most women could not.",
        art: { palette: "night", motif: "book", props: ["dots", "circles"], mood: "tense" },
        imagePrompt:
          "A cartoon scroll covered in dense complex characters, with a puzzled farmer looking at it, no text in image.",
        interaction: {
          kind: "reveal",
          prompt: "Why did that matter so much in everyday life?",
          revealAnswer:
            "If you were cheated, you could not read the paper that cheated you. You had to trust whoever read it for you.",
          choices: [],
        },
      },
      {
        id: "the-kings-idea",
        title: "The King's Own Idea",
        narration:
          "King Sejong decided this was unfair. So he did something kings almost never do. He designed a brand new alphabet himself, with a few scholars, and he designed it to be easy.",
        art: { palette: "sunrise", motif: "pen", props: ["sparkles", "rings"], mood: "curious" },
        imagePrompt:
          "A cartoon king at a low desk carefully drawing simple shapes on paper by lamplight, warm and quiet, no text.",
        interaction: {
          kind: "reveal",
          prompt: "How long did he say it took to learn?",
          revealAnswer: "A wise person could learn it in a morning. A slow learner in ten days.",
          choices: [],
        },
      },
      {
        id: "shapes-of-your-mouth",
        title: "The Shape of Your Mouth",
        narration:
          "The letters were not random. Each consonant was drawn to show what your mouth does when you say it. The letter for n shows a tongue touching the roof of the mouth, because that is exactly what your tongue does.",
        art: { palette: "candy", motif: "lightbulb", props: ["circles", "triangles", "sparkles"], mood: "curious" },
        imagePrompt:
          "Three simple cartoon diagrams of a mouth shape beside three matching simple letter shapes, no text.",
        interaction: {
          kind: "choice",
          prompt: "Why design letters to match the mouth?",
          revealAnswer: "",
          choices: [
            {
              text: "So the shape reminds you of the sound",
              isCorrect: true,
              feedback: "Yes. You are not memorising a random squiggle — the letter shows you the answer.",
            },
            {
              text: "So the letters look pretty together",
              isCorrect: false,
              feedback: "They do look neat, but he was after something far more useful than that.",
            },
            {
              text: "So they would be hard to copy",
              isCorrect: false,
              feedback: "He wanted the opposite — he wanted everybody to be able to use them.",
            },
          ],
        },
      },
      {
        id: "the-scholars-object",
        title: "The Scholars Object",
        narration:
          "Many scholars were furious. One wrote to the king saying Korea would look backward, and that common people had no business reading. Some refused to use the new letters for hundreds of years.",
        art: { palette: "storm", motif: "crowd", props: ["zigzags", "triangles"], mood: "tense" },
        imagePrompt:
          "Several cartoon scholars in robes frowning and turning away from a scroll, grey background, no text.",
        interaction: {
          kind: "reveal",
          prompt: "What might the scholars have been afraid of losing?",
          revealAnswer:
            "Being the only people who could read. If everyone can read, nobody has to come to you first.",
          choices: [],
        },
      },
      {
        id: "a-holiday-for-letters",
        title: "A Holiday for an Alphabet",
        narration:
          "They lost. About eighty million people use the alphabet today, and it is called Hangul. South Korea has a public holiday every ninth of October to celebrate it.",
        art: { palette: "candy", motif: "flag", props: ["stars", "sparkles", "hearts"], mood: "triumphant" },
        imagePrompt:
          "A cheerful cartoon street festival with simple letter shapes on banners and bunting, no readable text.",
        interaction: {
          kind: "reveal",
          prompt: "A public holiday for an alphabet. Can you think of another country that has one?",
          revealAnswer:
            "Almost nowhere does. Most alphabets grew slowly over centuries, so there is no day to point at.",
          choices: [],
        },
      },
    ],
    glossary: [
      { word: "alphabet", kidDefinition: "A set of letters used to write down sounds." },
      { word: "consonant", kidDefinition: "A sound like b, n or t, made by blocking the air." },
      { word: "Hangul", kidDefinition: "The Korean alphabet that King Sejong designed." },
    ],
    quiz: [
      {
        id: "q-who",
        question: "Who designed the Korean alphabet?",
        hint: "This is the surprising part of the whole story.",
        options: [
          { text: "The king himself, with a few scholars", isCorrect: true, feedback: "Right — which is why the story is so unusual." },
          { text: "A group of farmers", isCorrect: false, feedback: "It was made for them, but not by them." },
          { text: "It grew slowly over hundreds of years", isCorrect: false, feedback: "That is how most alphabets happen — but not this one." },
        ],
        defend: false,
        defendPrompt: "",
      },
      {
        id: "q-shapes",
        question: "What do the consonant shapes show?",
        hint: "Say the letter n out loud and notice your tongue.",
        options: [
          { text: "What your mouth does when you say them", isCorrect: true, feedback: "Exactly. The shape is a little instruction." },
          { text: "Pictures of animals", isCorrect: false, feedback: "Some writing systems started that way — this one did not." },
          { text: "Numbers in disguise", isCorrect: false, feedback: "Interesting idea, but the shapes are about sounds." },
        ],
        defend: true,
        defendPrompt: "What made you choose that answer?",
      },
      {
        id: "q-scholars",
        question: "Why were many scholars against the new alphabet?",
        hint: "Think about what being the only reader gives you.",
        options: [
          {
            text: "They did not want common people reading",
            isCorrect: true,
            feedback: "One of them wrote that to the king almost word for word.",
          },
          {
            text: "They thought it was too hard to learn",
            isCorrect: false,
            feedback: "The opposite. Its easiness was part of what bothered them.",
          },
          {
            text: "They could not see the letters properly",
            isCorrect: false,
            feedback: "The objection was about who should be allowed to read, not about eyesight.",
          },
        ],
        defend: true,
        defendPrompt: "How did you work that out from the story?",
      },
      {
        id: "q-today",
        question: "Roughly how many people use Hangul today?",
        hint: "It is the writing of a whole peninsula.",
        options: [
          { text: "About eighty million", isCorrect: true, feedback: "Yes — and it is often called one of the most logical alphabets ever made." },
          { text: "About eight thousand", isCorrect: false, feedback: "Far more than that. Think of a whole country, twice over." },
          { text: "Nobody uses it now", isCorrect: false, feedback: "It is very much alive — there is even a holiday for it." },
        ],
        defend: false,
        defendPrompt: "",
      },
    ],
    celebration: {
      headline: "You cracked the code of the code!",
      funFact: "The three marks that build every Hangul vowel stand for the sky, the earth, and a person standing between them.",
    },
  },

  "Mansa Musa and the libraries of Timbuktu": {
    title: "The King Who Changed the Price of Gold",
    hook: "He gave away so much gold that he accidentally broke a country's money.",
    bigIdea: "Mansa Musa is remembered for gold, but what lasted were the books he brought home.",
    heroEmoji: "📜",
    scenes: [
      {
        id: "a-journey-begins",
        title: "Across the Sahara",
        narration:
          "In 1324 a king set out from West Africa to travel to Mecca. His name was Mansa Musa, and he ruled the Mali Empire. He did not travel quietly.",
        art: { palette: "desert", motif: "footsteps", props: ["dots", "clouds"], mood: "curious" },
        imagePrompt:
          "A long cartoon caravan of camels and travellers crossing golden sand dunes, warm sunlight, no text.",
        interaction: {
          kind: "reveal",
          prompt: "How big was the caravan said to be?",
          revealAnswer: "Reports from the time describe thousands of people and camels loaded with gold.",
          choices: [],
        },
      },
      {
        id: "the-price-falls",
        title: "The Price of Gold Falls",
        narration:
          "In Cairo he handed out so much gold that something odd happened. Gold became less valuable across Egypt, and stayed cheap for years afterwards.",
        art: { palette: "sunrise", motif: "crowd", props: ["circles", "sparkles"], mood: "curious" },
        imagePrompt:
          "A busy cartoon city market with coins changing hands and traders looking surprised, no text.",
        interaction: {
          kind: "choice",
          prompt: "Why would giving away gold make gold worth less?",
          revealAnswer: "",
          choices: [
            {
              text: "Suddenly there was much more of it around",
              isCorrect: true,
              feedback: "Yes. When something becomes common, people will not pay as much for it.",
            },
            {
              text: "The gold he gave away was fake",
              isCorrect: false,
              feedback: "It was real gold. The change came from how much of it arrived at once.",
            },
            {
              text: "People stopped liking gold",
              isCorrect: false,
              feedback: "They still wanted it — there was simply a lot more of it to go round.",
            },
          ],
        },
      },
      {
        id: "what-he-brought-back",
        title: "What He Brought Home",
        narration:
          "On the way back, Musa did something quieter. He brought architects, scholars and books. He built mosques and schools in Timbuktu, a city where the desert trade routes met.",
        art: { palette: "desert", motif: "school", props: ["rings", "dots"], mood: "hopeful" },
        imagePrompt:
          "A warm cartoon mud-brick city with towers and a busy courtyard of students, golden light, no text.",
        interaction: {
          kind: "reveal",
          prompt: "What did people travel to Timbuktu to do?",
          revealAnswer: "To read. Scholars came to copy and write books on medicine, stars, law and poetry.",
          choices: [],
        },
      },
      {
        id: "books-worth-more",
        title: "Worth More Than Salt",
        narration:
          "Families kept private libraries and copied manuscripts by hand. In some accounts, books were worth more as trade goods than salt or gold.",
        art: { palette: "candy", motif: "book", props: ["sparkles", "diamonds"], mood: "curious" },
        imagePrompt:
          "A cartoon market stall with stacks of handwritten books beside blocks of salt, no readable text.",
        interaction: {
          kind: "reveal",
          prompt: "Why would a book be worth more than gold here?",
          revealAnswer:
            "Every copy was written out by hand. One book could take months, so there were very few of each.",
          choices: [],
        },
      },
      {
        id: "the-rescue",
        title: "The Rescue",
        narration:
          "In 2012 armed groups took the city and began destroying manuscripts. Librarians and ordinary families hid them in metal trunks and moved them hundreds of kilometres away. Most of the collection survived.",
        art: { palette: "night", motif: "key", props: ["stars", "circles"], mood: "tense" },
        imagePrompt:
          "Cartoon figures quietly carrying metal trunks onto a small boat at night under stars, hopeful, no text.",
        interaction: {
          kind: "choice",
          prompt: "Who saved the manuscripts?",
          revealAnswer: "",
          choices: [
            {
              text: "Librarians and ordinary families",
              isCorrect: true,
              feedback: "Yes — people with no army, who decided the books were worth the risk.",
            },
            {
              text: "An army sent to protect them",
              isCorrect: false,
              feedback: "No soldiers came for the books. The people who moved them were not fighters.",
            },
          ],
        },
      },
    ],
    glossary: [
      { word: "manuscript", kidDefinition: "A book or document written out by hand." },
      { word: "empire", kidDefinition: "A very large area ruled by one leader." },
      { word: "trade route", kidDefinition: "A path people travel along to buy and sell things." },
    ],
    quiz: [
      {
        id: "q-gold",
        question: "What happened to the value of gold in Egypt after Mansa Musa visited?",
        hint: "Think about what happens when there is suddenly a lot of something.",
        options: [
          { text: "It fell, and stayed low for years", isCorrect: true, feedback: "Right — one person's spending changed what a metal was worth." },
          { text: "It rose sharply", isCorrect: false, feedback: "The other way round. He brought so much that it became common." },
          { text: "Nothing changed", isCorrect: false, feedback: "Something really did change, and it lasted years." },
        ],
        defend: false,
        defendPrompt: "",
      },
      {
        id: "q-lasting",
        question: "Which part of Mansa Musa's journey mattered longest?",
        hint: "One thing was spent. One thing was kept and copied.",
        options: [
          {
            text: "The scholars and books he brought back",
            isCorrect: true,
            feedback: "Yes. The gold was spent; the libraries lasted for centuries.",
          },
          {
            text: "The gold he gave away",
            isCorrect: false,
            feedback: "That is the famous part, but it was gone within a generation.",
          },
          {
            text: "The size of his caravan",
            isCorrect: false,
            feedback: "It astonished people at the time, but it left nothing behind.",
          },
        ],
        defend: true,
        defendPrompt: "What made you pick that one?",
      },
      {
        id: "q-timbuktu",
        question: "What was Timbuktu known for?",
        hint: "People travelled there to do one particular thing.",
        options: [
          { text: "Its schools and libraries", isCorrect: true, feedback: "Correct. Scholars came from far away to read and copy." },
          { text: "Its gold mines", isCorrect: false, feedback: "Mali had gold, but Timbuktu's fame was about books." },
          { text: "Its harbour", isCorrect: false, feedback: "It sits by the desert, not the sea — the routes there were camel routes." },
        ],
        defend: false,
        defendPrompt: "",
      },
      {
        id: "q-rescue",
        question: "Why did ordinary families risk hiding the manuscripts in 2012?",
        hint: "Nobody ordered them to do it.",
        options: [
          {
            text: "They decided the books were worth the danger",
            isCorrect: true,
            feedback: "That is exactly it — a choice made by people with nothing to gain.",
          },
          {
            text: "They were paid to do it",
            isCorrect: false,
            feedback: "There was no reward waiting. They did it anyway.",
          },
          {
            text: "They were told to by the army",
            isCorrect: false,
            feedback: "No army was involved. The people who moved them were neighbours and librarians.",
          },
        ],
        defend: true,
        defendPrompt: "How did you work that out?",
      },
    ],
    celebration: {
      headline: "You found the real treasure!",
      funFact: "Some of the Timbuktu manuscripts contain astronomy notes recording an eclipse, written down more than six hundred years ago.",
    },
  },

  "Dashrath Manjhi and the mountain road": {
    title: "The Man Who Cut a Mountain",
    hook: "He had a hammer, a chisel, and twenty-two years.",
    bigIdea: "Dashrath Manjhi could not move the mountain quickly, so he moved it slowly.",
    heroEmoji: "⛏️",
    scenes: [
      {
        id: "the-ridge",
        title: "The Ridge in the Way",
        narration:
          "Gehlaur is a village in Bihar, in eastern India. A ridge of rock stood between it and the nearest town with a doctor. Going round took about fifty-five kilometres. Climbing over was dangerous.",
        art: { palette: "storm", motif: "mountain", props: ["triangles", "clouds"], mood: "tense" },
        imagePrompt:
          "A steep rocky ridge separating a small cartoon village from a distant town, grey sky, no text.",
        interaction: {
          kind: "reveal",
          prompt: "Fifty-five kilometres. About how long is that to walk?",
          revealAnswer: "Most of a day for an adult, and far longer if you are carrying someone who is hurt.",
          choices: [],
        },
      },
      {
        id: "falguni",
        title: "The Day It Changed",
        narration:
          "In 1959 Dashrath's wife Falguni Devi was hurt crossing that ridge while bringing him water. The journey to a hospital was too long. She died.",
        art: { palette: "night", motif: "heart", props: ["circles", "dots"], mood: "tense" },
        imagePrompt:
          "A quiet cartoon path on a rocky hillside at dusk with a dropped water pot, gentle and sad, no text.",
        interaction: {
          kind: "reveal",
          prompt: "What do you think he wanted most after that?",
          revealAnswer:
            "He wanted the journey to be shorter, so that nobody else would lose someone the same way.",
          choices: [],
        },
      },
      {
        id: "a-hammer",
        title: "A Hammer and a Chisel",
        narration:
          "He sold his goats and bought a hammer and a chisel. Then he started cutting a road through the mountain by himself. The village thought he had lost his mind.",
        art: { palette: "desert", motif: "person", props: ["zigzags", "dots"], mood: "curious" },
        imagePrompt:
          "A lone cartoon figure chipping at a rock face with a hand chisel, dust in the air, no text.",
        interaction: {
          kind: "choice",
          prompt: "Why did people think it was impossible?",
          revealAnswer: "",
          choices: [
            {
              text: "One person with hand tools against solid rock",
              isCorrect: true,
              feedback: "Yes. In the first years you could barely see any progress at all.",
            },
            {
              text: "Because he was not allowed to",
              isCorrect: false,
              feedback: "Nobody stopped him. They simply did not believe it could be done.",
            },
            {
              text: "Because the mountain was too far away",
              isCorrect: false,
              feedback: "It was right beside the village. The problem was how hard the rock was.",
            },
          ],
        },
      },
      {
        id: "twenty-two-years",
        title: "Twenty-Two Years",
        narration:
          "He worked before and after his job as a labourer, then most of the day. Twenty-two years went by. In 1982 the path was finished: about a hundred and ten metres cut straight through the rock.",
        art: { palette: "sunrise", motif: "clock", props: ["rings", "sparkles"], mood: "hopeful" },
        imagePrompt:
          "A narrow cut passage through a rock ridge with steep walls on both sides and sunlight at the end, no text.",
        interaction: {
          kind: "reveal",
          prompt: "How much shorter was the journey afterwards?",
          revealAnswer: "It fell from about fifty-five kilometres to about fifteen.",
          choices: [],
        },
      },
      {
        id: "the-mountain-man",
        title: "The Mountain Man",
        narration:
          "Manjhi never became rich. He spent years asking for a proper road and a hospital. People in the area call him the Mountain Man, and the route he cut is still used today.",
        art: { palette: "forest", motif: "footsteps", props: ["leaves", "stars"], mood: "triumphant" },
        imagePrompt:
          "Villagers of all ages walking easily through a cut rock passage, green hills beyond, no text.",
        interaction: {
          kind: "reveal",
          prompt: "He said his reason changed over the years. How?",
          revealAnswer:
            "He began it for his wife. By the end he was doing it so no one else's wife would die on that ridge.",
          choices: [],
        },
      },
    ],
    glossary: [
      { word: "ridge", kidDefinition: "A long narrow line of high rock or hills." },
      { word: "chisel", kidDefinition: "A metal tool with a sharp edge for cutting stone." },
      { word: "labourer", kidDefinition: "Someone who is paid to do hard physical work." },
    ],
    quiz: [
      {
        id: "q-years",
        question: "How long did Dashrath Manjhi work on the road?",
        hint: "More than two decades.",
        options: [
          { text: "Twenty-two years", isCorrect: true, feedback: "Yes — from 1960 until 1982." },
          { text: "Two years", isCorrect: false, feedback: "Far longer. Think ten times that." },
          { text: "Six months", isCorrect: false, feedback: "The first six months barely made a mark on the rock." },
        ],
        defend: false,
        defendPrompt: "",
      },
      {
        id: "q-why-start",
        question: "Why did he start cutting the road?",
        hint: "Something happened on that ridge in 1959.",
        options: [
          {
            text: "His wife died because the journey was too long",
            isCorrect: true,
            feedback: "That is what began it, and he said so himself.",
          },
          {
            text: "He was paid by the government",
            isCorrect: false,
            feedback: "He was never paid. He later had to ask the government for years for a proper road.",
          },
          {
            text: "He wanted to become famous",
            isCorrect: false,
            feedback: "Fame came decades later, and he stayed poor.",
          },
        ],
        defend: false,
        defendPrompt: "",
      },
      {
        id: "q-keep-going",
        question: "In the early years almost nothing had changed in the rock. Why do you think he kept going?",
        hint: "There is no single right answer written in the story — think about what would keep a person going.",
        options: [
          {
            text: "Because the reason mattered more than the speed",
            isCorrect: true,
            feedback: "That fits what he said about why he was doing it.",
          },
          {
            text: "Because he expected to finish quickly",
            isCorrect: false,
            feedback: "He cannot have — after a year the progress was still barely visible.",
          },
          {
            text: "Because the village encouraged him",
            isCorrect: false,
            feedback: "They did the opposite at first, and thought he had lost his mind.",
          },
        ],
        defend: true,
        defendPrompt: "What made you choose that? What would have kept you going?",
      },
      {
        id: "q-meaning",
        question: "Why does the story matter to people who never met him?",
        hint: "Think about what the road proved, not just what it did.",
        options: [
          {
            text: "It shows a slow effort can beat an impossible problem",
            isCorrect: true,
            feedback: "That is why people still tell it.",
          },
          {
            text: "Because it saved money on road building",
            isCorrect: false,
            feedback: "A tarred road was built later anyway. The story is about something else.",
          },
          {
            text: "Because the mountain was famous",
            isCorrect: false,
            feedback: "Nobody had heard of that ridge before he started cutting it.",
          },
        ],
        defend: true,
        defendPrompt: "How did you work that out from his story?",
      },
    ],
    celebration: {
      headline: "You went the long way and found the short one!",
      funFact: "Manjhi once walked much of the way towards Delhi along the railway tracks, because he could not afford the train fare to ask for a hospital.",
    },
  },

  "The Pacific wayfinders": {
    title: "Finding Islands Without a Map",
    hook: "No compass. No map. No clock. They found islands anyway.",
    bigIdea: "Pacific navigators read the stars, the waves and the birds the way we read signs.",
    heroEmoji: "🛶",
    scenes: [
      {
        id: "a-third-of-the-planet",
        title: "A Third of the Planet",
        narration:
          "The Pacific Ocean covers about a third of the Earth. The islands in it are tiny specks, often thousands of kilometres apart. People reached almost all of them.",
        art: { palette: "ocean", motif: "globe", props: ["circles", "dots"], mood: "curious" },
        imagePrompt:
          "A cartoon map of a vast blue ocean scattered with tiny green island dots, no text.",
        interaction: {
          kind: "reveal",
          prompt: "What did they have to help them find the way?",
          revealAnswer: "No compass, no map, no clock, no instruments of any kind.",
          choices: [],
        },
      },
      {
        id: "nobody-believed-it",
        title: "Nobody Believed It",
        narration:
          "For a long time European scholars refused to accept it was done on purpose. They said the canoes must have been blown off course by storms.",
        art: { palette: "storm", motif: "ship", props: ["zigzags", "clouds"], mood: "tense" },
        imagePrompt:
          "A small cartoon sailing canoe on a choppy grey sea under heavy clouds, no text.",
        interaction: {
          kind: "choice",
          prompt: "What is wrong with the blown-off-course explanation?",
          revealAnswer: "",
          choices: [
            {
              text: "Being blown somewhere cannot get you home again",
              isCorrect: true,
              feedback: "Exactly. They sailed out, found land, and sailed back. That needs a method.",
            },
            {
              text: "Storms never happen in the Pacific",
              isCorrect: false,
              feedback: "Storms are common there — but a storm cannot explain a return journey.",
            },
            {
              text: "The canoes were too heavy to move",
              isCorrect: false,
              feedback: "The canoes were fast and seaworthy. The puzzle was how they were steered.",
            },
          ],
        },
      },
      {
        id: "a-compass-of-stars",
        title: "A Compass Made of Stars",
        narration:
          "A wayfinder memorised where dozens of stars rose and set all around the horizon. As one star climbed too high, the next took its place. It worked like a compass that turned through the night.",
        art: { palette: "night", motif: "star", props: ["stars", "sparkles"], mood: "calm" },
        imagePrompt:
          "A cartoon night sky full of stars above a calm sea with a small canoe silhouette, no text.",
        interaction: {
          kind: "reveal",
          prompt: "What happens when clouds cover the stars?",
          revealAnswer: "Then they read the ocean instead, feeling the direction of the swells through the hull.",
          choices: [],
        },
      },
      {
        id: "reading-birds",
        title: "Reading Birds and Clouds",
        narration:
          "Some seabirds fly out to fish at dawn and return to land at dusk. Follow them at the right time and they point at an island you cannot see. A lagoon even throws a faint green onto the clouds above it.",
        art: { palette: "sunrise", motif: "bird", props: ["clouds", "sparkles"], mood: "curious" },
        imagePrompt:
          "Cartoon seabirds flying low over the sea towards the horizon at sunset, soft green glow in the clouds, no text.",
        interaction: {
          kind: "choice",
          prompt: "Why does the time of day matter when following a bird?",
          revealAnswer: "",
          choices: [
            {
              text: "At dusk they fly towards land, not away",
              isCorrect: true,
              feedback: "Yes. In the morning they fly out to fish, so following them then takes you further away.",
            },
            {
              text: "Birds only fly in the evening",
              isCorrect: false,
              feedback: "They fly all day — but the direction changes with the time.",
            },
          ],
        },
      },
      {
        id: "hokulea",
        title: "The Canoe That Proved It",
        narration:
          "By the twentieth century the knowledge had nearly vanished. In 1976 a canoe called Hōkūleʻa sailed from Hawaii to Tahiti, more than four thousand kilometres, guided by Mau Piailug. They arrived.",
        art: { palette: "ocean", motif: "trophy", props: ["stars", "rings", "sparkles"], mood: "triumphant" },
        imagePrompt:
          "A double-hulled cartoon voyaging canoe arriving at a green island, people waving, no text.",
        interaction: {
          kind: "reveal",
          prompt: "Mau then did something his tradition did not usually allow. What?",
          revealAnswer:
            "He taught outsiders. He decided losing the knowledge completely would be worse than sharing it.",
          choices: [],
        },
      },
    ],
    glossary: [
      { word: "navigator", kidDefinition: "Someone who works out which way a boat should go." },
      { word: "swell", kidDefinition: "Long rolling waves that travel a steady direction for miles." },
      { word: "lagoon", kidDefinition: "A shallow pool of sea water held inside a reef." },
    ],
    quiz: [
      {
        id: "q-tools",
        question: "What instruments did Pacific wayfinders use?",
        hint: "This is the surprising part.",
        options: [
          { text: "None at all", isCorrect: true, feedback: "Right. Everything they needed was memorised or felt." },
          { text: "A compass and a map", isCorrect: false, feedback: "Those came to the Pacific much later, with other sailors." },
          { text: "A clock and a telescope", isCorrect: false, feedback: "Neither — the whole system worked without equipment." },
        ],
        defend: false,
        defendPrompt: "",
      },
      {
        id: "q-return",
        question: "Why does the return journey disprove the blown-off-course idea?",
        hint: "Think about what a storm can and cannot do.",
        options: [
          {
            text: "A storm cannot steer you home on purpose",
            isCorrect: true,
            feedback: "Exactly. Coming back is the part that proves it was a skill.",
          },
          {
            text: "Because storms only blow one way",
            isCorrect: false,
            feedback: "Winds shift all the time — but that still would not bring you home deliberately.",
          },
          {
            text: "Because they never went back",
            isCorrect: false,
            feedback: "They did go back, and forth, repeatedly. That is the heart of the puzzle.",
          },
        ],
        defend: true,
        defendPrompt: "What made you sure it was that one?",
      },
      {
        id: "q-swells",
        question: "What did navigators do when clouds hid the stars?",
        hint: "They used a different sense entirely.",
        options: [
          { text: "Felt the direction of the swells", isCorrect: true, feedback: "Yes — lying in the hull to feel the pattern through the canoe." },
          { text: "Waited until the sky cleared", isCorrect: false, feedback: "Too slow and too risky. They kept going using the sea itself." },
          { text: "Guessed", isCorrect: false, feedback: "There was a method for cloudy nights, and it was a precise one." },
        ],
        defend: false,
        defendPrompt: "",
      },
      {
        id: "q-mau",
        question: "Why did Mau Piailug decide to teach people outside his tradition?",
        hint: "He was choosing between two things he did not want to lose.",
        options: [
          {
            text: "Losing the knowledge entirely would be worse",
            isCorrect: true,
            feedback: "That was his reasoning — a hard choice between two losses.",
          },
          {
            text: "He was told to by a government",
            isCorrect: false,
            feedback: "It was his own decision, and it broke with custom.",
          },
          {
            text: "He wanted to win a race",
            isCorrect: false,
            feedback: "The 1976 voyage was not a race. It was proof that the method worked.",
          },
        ],
        defend: true,
        defendPrompt: "How did you work that out?",
      },
    ],
    celebration: {
      headline: "You navigated the whole thing!",
      funFact: "A skilled wayfinder could name the rising and setting points of more than thirty stars, and hold the whole circle in their head at once.",
    },
  },

  "Tu Youyou and the 1,600-year-old cure": {
    title: "The Cure Hidden in an Old Book",
    hook: "The answer had been written down sixteen hundred years earlier.",
    bigIdea: "Tu Youyou found a modern medicine by reading an ancient instruction carefully.",
    heroEmoji: "🌿",
    scenes: [
      {
        id: "the-problem",
        title: "A Medicine That Stopped Working",
        narration:
          "In 1969 a Chinese scientist named Tu Youyou was given a hard job. Malaria was killing huge numbers of people, and the old medicines had stopped working, because the parasite had changed.",
        art: { palette: "storm", motif: "medicine", props: ["circles", "zigzags"], mood: "tense" },
        imagePrompt:
          "A cartoon laboratory bench with rows of small bottles and a worried scientist, muted colours, no text.",
        interaction: {
          kind: "reveal",
          prompt: "Her team tested hundreds of new chemicals. How did that go?",
          revealAnswer: "None of them worked well enough. So she decided to look somewhere else entirely.",
          choices: [],
        },
      },
      {
        id: "looking-backwards",
        title: "Looking Backwards",
        narration:
          "Instead of inventing something new, she read old Chinese medical books. She collected every plant ever recorded as treating fevers, and ended up with more than two thousand recipes.",
        art: { palette: "forest", motif: "book", props: ["leaves", "dots"], mood: "curious" },
        imagePrompt:
          "A cartoon desk stacked with very old books and dried plant cuttings, warm lamplight, no text.",
        interaction: {
          kind: "choice",
          prompt: "Why look in old books for a new cure?",
          revealAnswer: "",
          choices: [
            {
              text: "People had been treating fevers for thousands of years",
              isCorrect: true,
              feedback: "Yes. Somebody may have already found something that worked.",
            },
            {
              text: "Because new chemistry is always wrong",
              isCorrect: false,
              feedback: "It is not wrong — it simply had not worked here, so she tried another route.",
            },
            {
              text: "Because old books are cheaper",
              isCorrect: false,
              feedback: "Cost was not the point. She was after knowledge nobody had tested properly.",
            },
          ],
        },
      },
      {
        id: "one-plant",
        title: "The Same Plant, Again and Again",
        narration:
          "One plant kept appearing: sweet wormwood. But when her team boiled it, the way you normally prepare a herb, the results were weak and kept changing.",
        art: { palette: "meadow", motif: "science", props: ["leaves", "blobs"], mood: "curious" },
        imagePrompt:
          "A cartoon sprig of feathery green herb beside a steaming pot, with a puzzled expression nearby, no text.",
        interaction: {
          kind: "reveal",
          prompt: "What was the boiling doing?",
          revealAnswer: "Destroying it. The useful ingredient breaks apart in heat.",
          choices: [],
        },
      },
      {
        id: "the-instruction",
        title: "One Line in a Handbook",
        narration:
          "She went back to a handbook written by Ge Hong about sixteen hundred years earlier. It did not say boil it. It said soak it in cold water and wring out the juice. That line was the answer.",
        art: { palette: "sunrise", motif: "lightbulb", props: ["sparkles", "rings"], mood: "hopeful" },
        imagePrompt:
          "An open ancient cartoon handbook with one line glowing softly, beside a bowl of cold water and herbs, no text.",
        interaction: {
          kind: "reveal",
          prompt: "Why had everyone missed it?",
          revealAnswer:
            "Because boiling is the obvious way to prepare a herb. Nobody expected the method itself to matter.",
          choices: [],
        },
      },
      {
        id: "testing-it",
        title: "She Tested It Herself",
        narration:
          "Nobody knew if it was safe for people. Tu Youyou took it herself, with two colleagues, before giving it to patients. The medicine is called artemisinin, and it is credited with saving millions of lives.",
        art: { palette: "candy", motif: "trophy", props: ["sparkles", "hearts", "stars"], mood: "triumphant" },
        imagePrompt:
          "A calm cartoon scientist holding a small glass vial, with a bright hopeful background, no text.",
        interaction: {
          kind: "reveal",
          prompt: "She won the Nobel Prize in 2015. How old was she?",
          revealAnswer: "Eighty-four. She had no doctorate and had never trained abroad.",
          choices: [],
        },
      },
    ],
    glossary: [
      { word: "malaria", kidDefinition: "An illness carried by mosquitoes that causes bad fevers." },
      { word: "parasite", kidDefinition: "A tiny living thing that lives inside another and makes it ill." },
      { word: "extract", kidDefinition: "To pull one useful part out of a plant or mixture." },
    ],
    quiz: [
      {
        id: "q-where",
        question: "Where did Tu Youyou look for a cure?",
        hint: "Not forwards.",
        options: [
          { text: "In old Chinese medical books", isCorrect: true, feedback: "Yes — more than two thousand recipes." },
          { text: "In a rainforest nobody had visited", isCorrect: false, feedback: "She looked in libraries rather than jungles." },
          { text: "In other countries' hospitals", isCorrect: false, feedback: "Her search went back in time rather than across the world." },
        ],
        defend: false,
        defendPrompt: "",
      },
      {
        id: "q-boiling",
        question: "Why did boiling the plant stop it working?",
        hint: "Think about what heat does to delicate things.",
        options: [
          {
            text: "The useful ingredient breaks down in heat",
            isCorrect: true,
            feedback: "Exactly. The ordinary method was destroying the thing they wanted.",
          },
          {
            text: "Boiling washed the plant away",
            isCorrect: false,
            feedback: "The plant was still there — it was the active part that was being damaged.",
          },
          {
            text: "The water was the wrong kind",
            isCorrect: false,
            feedback: "It was the temperature that mattered, not the water itself.",
          },
        ],
        defend: true,
        defendPrompt: "What made you sure it was that one?",
      },
      {
        id: "q-herself",
        question: "What did Tu Youyou do before giving the medicine to patients?",
        hint: "She did not ask anyone else to go first.",
        options: [
          { text: "Took it herself", isCorrect: true, feedback: "She and two colleagues tested it on themselves." },
          { text: "Published a paper about it", isCorrect: false, feedback: "The papers came later. First somebody had to find out if it was safe." },
          { text: "Waited ten years", isCorrect: false, feedback: "There was no time to wait — people were dying every day." },
        ],
        defend: false,
        defendPrompt: "",
      },
      {
        id: "q-lesson",
        question: "What does this story suggest about old knowledge?",
        hint: "The cure existed long before anyone could explain why it worked.",
        options: [
          {
            text: "It can be worth checking carefully, not just dismissing",
            isCorrect: true,
            feedback: "That is the heart of it — one line in a very old book held the answer.",
          },
          {
            text: "Old books are always right",
            isCorrect: false,
            feedback: "Most of those two thousand recipes did not work. She had to test them.",
          },
          {
            text: "Modern science is not needed",
            isCorrect: false,
            feedback: "It was very much needed — modern testing is how she proved which one worked.",
          },
        ],
        defend: true,
        defendPrompt: "How did you work that out from her story?",
      },
    ],
    celebration: {
      headline: "You read the small print!",
      funFact: "Tu Youyou had no doctorate and had never studied abroad, which kept her out of China's top science academy for decades — long after the medicine was saving lives.",
    },
  },
};
