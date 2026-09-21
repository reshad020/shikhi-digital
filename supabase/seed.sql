-- Sample lesson, so a fresh `supabase db reset` gives a playable app.
--
-- Runs as the postgres role during a reset, which is why it can insert a lesson
-- without an admin session. Nothing here depends on a user existing.

insert into public.lessons (slug, subject, locale, source_text, status, model, storyboard)
values (
  'nelson-mandela',
  'Nelson Mandela',
  'en',
  'Nelson Mandela was born in 1918 in Mvezo, a small village in South Africa. His parents named him Rolihlahla, a name that colloquially means "troublemaker". On his first day at school a teacher gave him the English name Nelson, as was common at the time.

As Nelson grew up, South Africa was governed by apartheid: a system of laws that separated people according to the colour of their skin and decided where they could live, study, work and travel. Black South Africans were denied the vote and pushed into the poorest land and jobs.

Nelson trained as a lawyer and joined the movement against apartheid. He argued, organised and spoke out. The government treated him as a dangerous enemy, and in 1962 he was arrested. He was sentenced to life imprisonment and spent 27 years behind bars, much of it on Robben Island.

While he was in prison, people around the world learned his name. They marched, sang and demanded his release. Pressure on the South African government grew year after year.

In February 1990 Nelson Mandela finally walked free. Many people expected him to be bitter. Instead he called for peace and negotiated with the very government that had imprisoned him. He argued that revenge would only create more suffering, and that the country had to be rebuilt by everyone together. In 1993 he shared the Nobel Peace Prize with F.W. de Klerk.

In 1994 South Africa held its first election in which every adult could vote, regardless of skin colour. People queued for hours, some for most of a day. They elected Nelson Mandela as their president. He served one term and then stepped down, which surprised many leaders who expected him to hold on to power.

Mandela spent the rest of his life campaigning for education and health. He died in 2013, and is remembered less for his anger at injustice than for his extraordinary willingness to forgive.',
  'ready',
  'seed-fixture',
  '{"title":"The Man Who Chose Forgiveness","hook":"He spent 27 years in prison — and walked out ready to forgive.","bigIdea":"Nelson Mandela showed that fairness is worth waiting and working for.","heroEmoji":"🕊️","scenes":[{"id":"a-boy-called-trouble","title":"A Boy Called Trouble","narration":"In 1918 a baby boy was born in a tiny village in South Africa. His family named him Rolihlahla. In his language, that name means something like troublemaker!","art":{"palette":"meadow","motif":"home","props":["leaves","dots"],"mood":"calm"},"imagePrompt":"A friendly cartoon village of round huts on green hills, warm morning light, no text.","interaction":{"kind":"reveal","prompt":"On his very first day at school, his teacher gave him a brand new name. What was it?","revealAnswer":"Nelson! Back then, teachers often gave children English names at school.","choices":[]}},{"id":"unfair-rules","title":"Unfair Rules","narration":"When Nelson grew up, South Africa had a cruel set of laws called apartheid. The laws sorted people by the colour of their skin. They decided where you could live, learn and work.","art":{"palette":"storm","motif":"justice-scales","props":["zigzags","triangles"],"mood":"tense"},"imagePrompt":"A cartoon set of scales tipping unfairly under a grey cloudy sky, gentle not frightening, no text.","interaction":{"kind":"choice","prompt":"What did apartheid decide about people?","revealAnswer":"","choices":[{"text":"How they were treated, based on their skin","isCorrect":true,"feedback":"Exactly. Apartheid gave people different rights for no fair reason at all."},{"text":"Which sports teams they supported","isCorrect":false,"feedback":"Apartheid was about something much bigger — it controlled people''s whole lives."},{"text":"What they were allowed to eat","isCorrect":false,"feedback":"Close thinking! Apartheid controlled where people lived, learned and worked."}]}},{"id":"twenty-seven-years","title":"Twenty-Seven Years","narration":"Nelson spoke out against apartheid, so the government locked him away. He stayed in prison for 27 years. That is longer than most grown-ups have been alive.","art":{"palette":"night","motif":"locked-door","props":["stars","circles"],"mood":"tense"},"imagePrompt":"A small cartoon window with bars, one bright star visible outside in a deep blue night, hopeful, no text.","interaction":{"kind":"reveal","prompt":"Imagine waiting 27 years. What do you think kept him going?","revealAnswer":"He studied, exercised, and kept believing the rules would change one day. He never gave up hope.","choices":[]}},{"id":"choosing-forgiveness","title":"Choosing Forgiveness","narration":"In 1990 the prison doors finally opened. Many people expected Nelson to be angry. Instead he shook hands with the people who had jailed him, and asked his country to heal.","art":{"palette":"sunrise","motif":"handshake","props":["hearts","sparkles"],"mood":"hopeful"},"imagePrompt":"Two cartoon hands of different skin tones shaking warmly against a sunrise, no text.","interaction":{"kind":"choice","prompt":"Why do you think Nelson chose forgiveness?","revealAnswer":"","choices":[{"text":"So the country could heal together","isCorrect":true,"feedback":"Yes. He believed revenge would only start the hurting all over again."},{"text":"Because he had forgotten what happened","isCorrect":false,"feedback":"He remembered every day — forgiving is not the same as forgetting."}]}},{"id":"everyone-votes","title":"Everyone Votes","narration":"In 1994 South Africa held an election where every grown-up could vote, whatever their skin colour. People queued for hours, smiling. They chose Nelson Mandela as their president.","art":{"palette":"candy","motif":"vote","props":["stars","sparkles","circles"],"mood":"triumphant"},"imagePrompt":"A long cheerful cartoon queue of diverse people waiting to post ballots, confetti in the air, no text.","interaction":{"kind":"reveal","prompt":"How long did some people wait in line to vote that day?","revealAnswer":"Many waited more than half a day — some queues stretched for kilometres!","choices":[]}}],"glossary":[{"word":"apartheid","kidDefinition":"Old laws that treated people differently by skin colour."},{"word":"election","kidDefinition":"When people vote to choose who leads their country."},{"word":"forgiveness","kidDefinition":"Choosing not to stay angry with someone who hurt you."},{"word":"president","kidDefinition":"The person chosen to lead a whole country."}],"quiz":[{"id":"q-name","question":"What did Nelson''s birth name, Rolihlahla, mean?","hint":"Think about the name a cheeky child might get.","options":[{"text":"Troublemaker","isCorrect":true,"feedback":"That is right — and he did make trouble for unfair laws!"},{"text":"Wise one","isCorrect":false,"feedback":"He grew wise, but his name meant something far cheekier."},{"text":"Little lion","isCorrect":false,"feedback":"Brave guess! His name actually hinted at mischief."}],"defend":false,"defendPrompt":""},{"id":"q-apartheid","question":"What was apartheid?","hint":"It was a system of laws, not a place.","options":[{"text":"Laws that separated people by skin colour","isCorrect":true,"feedback":"Correct. Those laws decided where people could live and learn."},{"text":"A South African city","isCorrect":false,"feedback":"It was not a place — it was a set of unfair rules."},{"text":"A kind of school","isCorrect":false,"feedback":"Not quite. Apartheid was a system of laws across the whole country."}],"defend":true,"defendPrompt":"What made you sure it was that one?"},{"id":"q-prison","question":"How long was Nelson Mandela in prison?","hint":"Nearly three whole decades.","options":[{"text":"27 years","isCorrect":true,"feedback":"Yes — 27 years, and he still came out full of hope."},{"text":"7 years","isCorrect":false,"feedback":"It was far longer than that. Try adding twenty more."},{"text":"2 years","isCorrect":false,"feedback":"Much longer. He was there for 27 years."}],"defend":false,"defendPrompt":""},{"id":"q-after","question":"What did Nelson do after he left prison?","hint":"He surprised almost everybody.","options":[{"text":"He worked for peace and became president","isCorrect":true,"feedback":"Exactly. He led the country that once locked him up."},{"text":"He moved far away and stayed quiet","isCorrect":false,"feedback":"He did the opposite — he stepped straight back into the struggle."},{"text":"He punished the people who jailed him","isCorrect":false,"feedback":"He chose forgiveness instead, so the country could heal."}],"defend":true,"defendPrompt":"How did you work that out from his story?"}],"celebration":{"headline":"You told his whole story!","funFact":"Nelson Mandela shared the Nobel Peace Prize in 1993, one year before he became president."}}'::jsonb
)
on conflict (slug) do update set
  storyboard  = excluded.storyboard,
  source_text = excluded.source_text,
  status      = excluded.status,
  model       = excluded.model;

-- ---------------------------------------------------------------------------
-- Steelman Arena: three claims, published, so a fresh reset is playable.
-- ---------------------------------------------------------------------------
--
-- Each one is chosen so that both sides are genuinely arguable by a 9-year-old.
-- That is the hard constraint: a claim with an obviously correct side produces
-- a strawman from every child and then marks them down for our mistake.
--
-- `best_for_*` is never sent to the browser. It is read back server-side on
-- submit and revealed only after the child has written their own argument.

insert into public.steelman_prompts
  (locale, claim, context, side_a, side_b, best_for_a, best_for_b, status, model)
values
  (
    'en',
    'Schools should let children choose what they learn.',
    'Most schools decide the subjects for you. A few around the world let children pick most of their own, with a teacher helping them plan.',
    'Let children choose',
    'Keep a set timetable',
    'People work harder at things they picked themselves, and a child who is bored all day is not learning much anyway — so choice is not a treat, it is what makes the time count.',
    'You cannot choose something you have never heard of. A set timetable is how a child meets the subject they turn out to love, and how everyone ends up with the basics whatever their home is like.',
    'ready',
    'seed-fixture'
  ),
  (
    'en',
    'Zoos are good for animals.',
    'Zoos keep wild animals in enclosures and people pay to see them. Many also breed rare animals and fund work protecting them in the wild.',
    'Zoos help animals',
    'Zoos harm animals',
    'Some species now exist only because zoos bred them, and the ticket money pays for guarding animals in the wild. A person who has stood next to an elephant is far more likely to care what happens to elephants.',
    'An enclosure is nothing like the space these animals evolved for, and an animal that cannot roam, hunt or choose its company is having its whole life shortened to make a point about conservation.',
    'ready',
    'seed-fixture'
  ),
  (
    'en',
    'Children should be given pocket money without having to earn it.',
    'Some families pay pocket money every week no matter what. Others pay for chores, or for good marks, or not at all.',
    'Give it freely',
    'Make them earn it',
    'You cannot learn to handle money without having any, and tying it to chores teaches that helping your own family is a paid job rather than something you just do.',
    'Money that arrives whatever you do teaches nothing about where it comes from. Earning it is the first time most children feel the link between effort and what they can afford.',
    'ready',
    'seed-fixture'
  )
on conflict do nothing;
