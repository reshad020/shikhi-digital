/**
 * Source texts for the lesson library.
 *
 * These are the raw material: an adult writes 150–900 words, and
 * `generateStoryboard` turns each into a playable storyboard. Seeded through
 * `npm run seed:content`.
 *
 * Chosen deliberately from across the world rather than from the usual
 * English-language syllabus. A child in Lagos, Dhaka, Lima or Jakarta should
 * find people and places they recognise here, and a child in London should
 * meet several they have never heard of. Every one of them also turns on a
 * *decision* — someone choosing to do something difficult — because that is
 * what gives a child something to argue about afterwards, which is the point
 * of the whole product.
 */

export type LessonSource = {
  /** Shown in the admin list and used for the slug. */
  subject: string;
  text: string;
};

export const LESSON_SOURCES: LessonSource[] = [
  {
    subject: "Wangari Maathai",
    text: `Wangari Maathai grew up in a village in Kenya, in a place where a fig tree stood beside a stream. Her mother told her never to cut it. Years later, when Wangari came home as a scientist, the tree was gone, the stream had dried up, and the hillside was bare.

She noticed something other people had missed. The women walking further every year to find firewood, the thinner harvests, and the empty riverbeds were not separate problems. They were one problem. The trees were gone, so the soil washed away, so the crops failed, so the families went hungry.

In 1977 she suggested something that sounded almost too simple. What if women planted trees? Not scientists, not the government. Ordinary women, in their own villages, paid a small amount for every seedling that survived.

People laughed. Officials told her that women without training could not run a forestry programme. Wangari ignored them and taught the women herself. They collected seeds from the forest, grew them in tins and broken pots, and planted them in rows along the roads and streams.

The movement grew. It also made her enemies, because some of the land being cleared was being taken by powerful people. Wangari was beaten by police and put in prison more than once. On one occasion she chained herself to a tree in a public park in Nairobi to stop it being built on. The park is still there.

By the time she died in 2011, the Green Belt Movement she started had planted more than fifty million trees. In 2004 she became the first African woman to win the Nobel Peace Prize — awarded not for stopping a war, but for planting trees.

The committee explained why. Wangari had shown that when forests disappear, people fight over what is left. Protecting the land was a way of preventing conflict before it started. She had spotted a connection nobody else was making.`,
  },
  {
    subject: "King Sejong and the Korean alphabet",
    text: `Six hundred years ago, almost nobody in Korea could read. The written language was Chinese, which took years of study to learn. Scholars and officials could read. Farmers, soldiers and most women could not.

King Sejong thought this was unjust. If a farmer was cheated, he could not read the document that cheated him. If a mother wanted to send word to her son, she needed to find someone else to write it.

So the king did something kings almost never do. He designed a new alphabet himself, with a small group of scholars, and he designed it to be easy.

The letters were not random shapes. The consonants were drawn to show the shape your mouth makes when you say them. The letter for "n" looks like a tongue touching the roof of the mouth, because that is exactly what your tongue does. The vowels were built from three simple marks representing the sky, the earth and a person standing between them.

He finished it in 1443 and announced it in 1446. He claimed a wise person could learn it in a morning, and a slow learner in ten days.

Many scholars were furious. One wrote a formal protest to the king arguing that abandoning Chinese characters would make Korea look backward, and that the common people had no business reading anyway. Some scholars refused to use the new alphabet for centuries, calling it the writing of women and children.

They lost. The alphabet, now called Hangul, is used by about eighty million people, and linguists often describe it as one of the most logical writing systems ever invented — because it was designed on purpose, by someone who wanted it to be learnable, rather than growing by accident over hundreds of years.

South Korea celebrates Hangul Day every October the ninth. It is a public holiday for an alphabet.`,
  },
  {
    subject: "Mansa Musa and the libraries of Timbuktu",
    text: `In 1324 a king left the city of Niani in West Africa and set off across the Sahara. His name was Mansa Musa, and he ruled the Mali Empire — an empire so rich in gold that nobody has ever worked out exactly how rich.

He was travelling to Mecca, and he did not travel quietly. Reports from the time describe thousands of people in the caravan, camels loaded with gold, and Musa giving gold away in every city he passed through.

In Cairo he gave away so much that something strange happened. The value of gold in Egypt fell, and stayed low for years. One man had handed out enough of a precious metal to change what it was worth across a whole region. It is one of the only times in history a single person's spending has done that.

But the part of the story that mattered most was quieter. On his way home, Musa brought back architects, scholars and books. He built mosques and schools in Timbuktu, a city on the edge of the desert where the trade routes met.

Timbuktu became a place people travelled to in order to read. Scholars copied and wrote manuscripts on astronomy, medicine, mathematics, law and poetry. Families kept private libraries. Books were valuable trade goods — in some accounts, more valuable than salt or gold.

For a long time, history books written in Europe described Timbuktu as a legend, or as a symbol of somewhere impossibly far away. The libraries were real. Hundreds of thousands of manuscripts survived, kept by families for generations.

In 2012, when armed groups took control of the city and began destroying manuscripts, librarians and ordinary families smuggled them out in metal trunks, on carts and in boats, and hid them hundreds of kilometres away. Most of the collection survived — because people who were not soldiers decided that books were worth the risk.`,
  },
  {
    subject: "Dashrath Manjhi and the mountain road",
    text: `Gehlaur is a village in Bihar, in eastern India. A ridge of rock stood between it and the nearest town with a doctor. To get around the ridge took about fifty-five kilometres. Walking over it was dangerous.

In 1959, Dashrath Manjhi's wife Falguni Devi was injured crossing that ridge while bringing him water. The journey to a hospital was too long. She died.

What Manjhi did next sounds made up. He sold his goats, bought a hammer and a chisel, and began cutting a road through the mountain. By himself.

People in the village thought he had lost his mind. They told him it was impossible. For a long time they were right to think so — in the first years, the progress was barely visible.

He kept going. He worked before and after his job as a labourer, and in the end he worked at it most of the day. Twenty-two years passed.

When he finished in 1982, there was a path roughly a hundred and ten metres long cut through solid rock, nine metres wide in places, with the ridge walls rising on either side. The journey to town fell from fifty-five kilometres to about fifteen.

Manjhi did not get rich. He asked the government for a proper road and a hospital, and spent years being passed between offices. He is said to have once walked much of the way to Delhi along the railway tracks because he could not afford the fare.

The road is still used. Local people call him the Mountain Man. A tarred road was eventually built along the route he cut.

He said something simple when people asked why he had bothered: when he started, he was doing it for his wife. By the end, he was doing it so that nobody else's wife would die on that ridge.`,
  },
  {
    subject: "The Pacific wayfinders",
    text: `Look at a map of the Pacific Ocean. It covers about a third of the planet, and the islands in it are tiny specks separated by thousands of kilometres of open water.

People reached almost all of them. They did it in canoes, without compasses, without maps, without clocks, and without any instruments at all — and they did it centuries before European ships could safely cross open ocean.

For a long time, European scholars refused to believe it was done on purpose. They suggested the islands must have been settled by canoes blown off course. The idea that Pacific navigators had deliberately sailed out of sight of land, found a target island and sailed home again seemed impossible to them.

It was not impossible. It was a skill, taught carefully from one person to the next.

A wayfinder memorised the rising and setting points of dozens of stars around the whole horizon, and used them like a compass that turned through the night. When clouds covered the sky, they read the ocean itself. Swells travel across the Pacific in steady directions for thousands of kilometres, and a navigator lying in the bottom of a canoe can feel the pattern of them through the hull.

They read birds. Some seabirds fly out to fish in the morning and return to land at dusk, so following them at the right time of day points at an island you cannot see. They read the colour of clouds, because a lagoon reflects a faint green onto the clouds above it.

By the twentieth century the knowledge had nearly disappeared. In 1976 a canoe called Hōkūleʻa sailed from Hawaii to Tahiti, more than four thousand kilometres, navigated by Mau Piailug from the island of Satawal — one of the last people who still held the whole system in his head. They arrived.

Mau then broke with tradition and taught outsiders, because he had decided that losing the knowledge entirely would be worse than sharing it.`,
  },
  {
    subject: "Fatima al-Fihri and the oldest university",
    text: `In the ninth century, a woman named Fatima al-Fihri lived in the city of Fez, in what is now Morocco. Her family had come from Tunisia. When her father died, she and her sister inherited money.

What she did with it in the year 859 is still standing.

She used the inheritance to build a mosque with a place of learning attached to it. She is said to have fasted during the whole of the construction. The building became al-Qarawiyyin, and it did not stay a single room for long. Students came to study religion, but also grammar, mathematics, medicine, astronomy and law.

It has been teaching ever since. That is the remarkable part. Not that it was built, but that it never stopped. Guinness World Records lists al-Qarawiyyin as the oldest existing, continually operating degree-granting university in the world — older than Bologna, older than Oxford, older than almost anything else people point to when they talk about the history of universities.

Its library is one of the oldest in the world too, and it holds manuscripts more than a thousand years old, including a ninth-century copy of the Qur'an and early work on medicine and mathematics.

By the twentieth century the library was in a bad state. Water was getting in, and the manuscripts were at risk. The restoration, finished in 2016, was led by an architect named Aziza Chaouni, who installed a new drainage system, solar panels and a laboratory for repairing old books.

So a library founded by a woman in the ninth century was rescued by a woman in the twenty-first.

Historians still argue about some details of Fatima's life, because the records from that period are thin and were written down much later. What is not in doubt is the building, the date, and the fact that it has been full of students for more than eleven hundred years.`,
  },
  {
    subject: "Tu Youyou and the 1,600-year-old cure",
    text: `In 1969 a Chinese scientist named Tu Youyou was given a difficult job. Malaria was killing enormous numbers of people, and the medicines that used to work were failing, because the parasite that causes it had become resistant to them.

Her team tested hundreds of chemical compounds. None of them worked well enough.

So she tried something unusual. Instead of looking forward at new chemistry, she looked backwards. She read old Chinese medical texts, collecting any plant that had ever been recorded as treating fevers. She gathered more than two thousand recipes.

One plant kept appearing: sweet wormwood, *qinghao*. But when her team extracted it in the normal way, by boiling, the results were disappointing and inconsistent.

Then she went back to a handbook written by Ge Hong in about the fourth century — roughly sixteen hundred years earlier. The instruction there did not say boil it. It said soak it in cold water and wring out the juice.

That detail was the answer. The active ingredient breaks down in heat. Boiling the plant was destroying the very thing that worked. Once the team extracted it at a low temperature, the results were dramatic: in tests, the parasite was wiped out.

There was a problem. Nobody knew whether the extract was safe in humans, and the testing rules of the time were not what they are now. Tu Youyou volunteered to take it herself, along with two colleagues, before giving it to patients.

The drug is called artemisinin. It is now part of the standard treatment for malaria worldwide, and it is credited with saving millions of lives, most of them children.

In 2015 Tu Youyou was awarded the Nobel Prize in Medicine. She was eighty-four. She had no doctorate and no training abroad, which had kept her out of China's top scientific academy for decades.

The cure had been written down in the fourth century. Somebody had to go back and read it properly.`,
  },
  {
    subject: "The walls of Benin City",
    text: `Before the aeroplane, before satellites, somebody in West Africa built what may have been the longest structure ever made by human hands.

Benin City, in what is now southern Nigeria, was the capital of the Kingdom of Benin. Around it, and spreading out through the countryside, people dug a vast network of ditches and banks — earth walls, with the ditch on one side and the dug-out soil piled up on the other.

Estimates of the total length vary a great deal, but archaeologists have suggested the whole network ran for thousands of kilometres, enclosing hundreds of separate communities. By some measures it is the largest earthwork built before the machine age, and several times the length of the Great Wall of China.

European visitors in the sixteenth and seventeenth centuries described the city itself with surprise. They wrote about long straight streets, houses in neat rows, and a royal palace with galleries of bronze plaques. One Dutch visitor compared the main street to the grandest street in Amsterdam.

The bronzes are the part most people have seen. Craftsmen in Benin cast metal plaques and heads of extraordinary quality, using a method that takes years to learn.

In 1897 a British force attacked the city, burned much of it, and took thousands of the bronzes away. They ended up in museums and private collections across Europe and North America. For more than a century, people in Benin City asked for them back and were refused.

That has begun to change. Some museums and universities have returned pieces, and in 2022 Germany formally transferred ownership of a large number of them to Nigeria.

The walls are harder to see now. Farming, building and time have flattened much of the network, and it is not protected the way a stone monument would be. A thing that may have been the longest structure on earth is mostly known today from archaeologists' surveys and from the sections that still run through the bush.`,
  },
  {
    subject: "Ibn Battuta, the traveller",
    text: `In 1325, a twenty-one-year-old law student left the city of Tangier in Morocco to make the pilgrimage to Mecca. He travelled alone, and he later wrote that he left with no companion and no caravan, and that he cried when he said goodbye to his parents.

He did not come home for twenty-four years.

Ibn Battuta reached Mecca and then simply kept going. Over about thirty years he travelled through North Africa, Arabia, East Africa, Persia, Central Asia, India, the Maldives, Sri Lanka, Southeast Asia and China, and later across the Sahara to Mali. The usual estimate for the total distance is around one hundred and twenty thousand kilometres — far more than Marco Polo covered.

He worked as a judge in Delhi and in the Maldives. He was robbed by bandits, nearly drowned, survived a plague, was shipwrecked, and at one point had to flee a ruler whose temper had turned against him.

When he finally returned to Morocco, the sultan asked him to dictate the story. A scholar named Ibn Juzayy wrote it down, and the book is usually called the *Rihla*, meaning the journey.

Historians treat it carefully. Ibn Battuta was recalling decades of travel from memory, years after the fact, and some passages appear to borrow from other writers. A few of the places he claims to have visited are disputed.

But most of it holds up, and the detail is what makes it valuable. He describes what people ate, how they greeted each other, what they wore, what a market smelled like, which rulers were generous and which were frightening. He noticed that women in the Maldives and in Mali had freedoms that surprised him, and he said so plainly, sometimes disapprovingly.

He was not trying to write history. He was a traveller describing what he saw, and that is exactly why historians still read him seven hundred years later.`,
  },
  {
    subject: "The Antikythera mechanism",
    text: `In 1901, sponge divers sheltering from a storm near the Greek island of Antikythera went down to look at the seabed and found a shipwreck. It was about two thousand years old, and it was full of treasure: bronze statues, marble figures, jewellery, glassware.

Among the finds was a lump of corroded bronze and rotten wood, about the size of a large book. It was put aside. It did not look like much.

Months later it cracked open, and someone noticed a gear wheel inside. A gear wheel, with precisely cut teeth, in a wreck from the first or second century before the common era.

This was not supposed to exist. Geared machinery of that complexity was not known again in Europe for well over a thousand years.

For decades nobody could work out what it did. It was only when researchers used X-rays, and later three-dimensional scanning that could see through the corrosion, that the picture became clear. The device had at least thirty bronze gears. On the front was a dial showing the position of the sun and the moon against the zodiac. There was a small ball, half silver and half dark, that rotated to show the phase of the moon. On the back were spiral dials tracking cycles of years.

It could predict eclipses. It tracked the irregular speed of the moon's orbit, which required a clever arrangement of one gear pin running in the slot of another. It also marked the four-year cycle of the athletic games, including the Olympics.

It was, in effect, a mechanical model of the sky, built by hand.

Nobody knows who made it. No other object like it has ever been found from the ancient world, which leaves two uncomfortable possibilities: either it was a one-off of astonishing genius, or there was a whole tradition of such machines and every other example has been lost.

Scholars still argue about which.`,
  },
];
