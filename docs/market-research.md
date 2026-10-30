# Market research brief: what families say about kids' learning apps

## Read this first: how this was produced

I could not browse Reddit, Facebook, app-store reviews or any live website. This brief is a synthesis of
feedback that has been widely and repeatedly reported about Prodigy, IXL, ABCmouse, Duolingo / Duolingo ABC,
Khan Academy Kids, Epic!, Reading Eggs, Osmo and Kahoot (parent and teacher forum threads, app-store review
themes, press and academic commentary). It is **directional, not a fresh data pull**. No quotes or counts here
were scraped. Before betting budget on any one theme, validate it with real review mining (see the last section).

## Pain points, ranked by how consistently they come up

| # | Pain point | Who raises it | Typical wording | Decision in AdaptiveMinds |
|---|-----------|--------------|-----------------|---------------------------|
| 1 | **"It feels like homework."** Worksheet-style quizzes bore kids within minutes; they ask to quit. | Parents, kids | "My son hates it", "just flashcards with stars" | Every practice session is a **quest**: a world, a guide character, rounds of 5 questions, a boss round, and a reward at the end. |
| 2 | **Game is fun, learning is not.** Games that bolt maths onto a battle game let kids race through, guess, or spend most time on non-learning actions. | Teachers, parents | "They are playing, not learning" | The game **is** the question. No separate mini-game that skips learning; every second of play is answering or reading a hint. |
| 3 | **Pay-to-win and constant upsell.** Paywalls, pestering and pressure aimed at kids and parents. | Parents (very common for Prodigy) | "Constant pop-ups to upgrade" | No ads, no purchases, no upsell. Said plainly on the landing page and privacy notice. |
| 4 | **Too hard, then rage-quit; or too easy, then bored.** Difficulty is off, or one mistake ends the fun. | Parents, kids | "Gets stuck", "too easy" | Keep the adaptive engine, add **hints** and a rule that a student never faces a long run of misses without an easier step. |
| 5 | **Mistakes feel like punishment.** Red crosses, lost lives and lost streaks discourage anxious kids. | Parents, teachers | "My daughter cries when she gets it wrong" | Hearts do not exist. Wrong answers get an encouraging guide line plus an explanation. A **forgiving streak** survives one missed day. |
| 6 | **Streak anxiety.** Losing a long streak is upsetting and pushes unhealthy compulsion. | Parents, press | "She cried when she lost her 100-day streak" | One "rest day" is automatically forgiven. Streak copy is encouraging, never guilt-based. |
| 7 | **Repetitive content.** Same questions repeat, kids memorise answers. | Parents, teachers | "Same questions again and again" | No-repeat selection: choose from questions not recently seen before reusing any. |
| 8 | **Gamble-style and dark-pattern engagement.** Loot boxes, countdown pressure, fake scarcity, "come back or your pet is sad". | Parents, regulators (UK Children's Code, FTC) | "Manipulative" | None used. Companion never shames the child. Rewards are predictable. Session ends with a clear stopping point. |
| 9 | **No natural stopping point / screen-time battles.** Endless play creates fights at home. | Parents | "Can't get him off it" | Quests are short (5 questions, roughly 3 min). End screen offers "done for today" as an equal-weight choice. Existing stretch reminders stay. |
| 10 | **Parents can't see what is happening.** | Parents | "What is she actually learning?" | Parent dashboard and weekly emails already exist. Round summaries now say which skill was practised. |
| 11 | **Reading level blocks younger kids.** Pre-readers cannot follow text instructions. | Parents of K-2 | "He can't read the instructions" | Read-aloud button is on every question (done); the guide speaks short sentences. |
| 12 | **Hints that give the answer away, or no hints at all.** Kids either get stuck or learn to just tap "hint". | Teachers | "They just click hint" | Hint removes **two wrong options** (50:50) and halves the XP for that question. The answer is never sent to the browser before submission. |
| 13 | **Sound and motion overload.** Sensory-sensitive and neurodivergent kids find constant noise and flashing distressing; classrooms need silence. | Parents, teachers | "Too loud" | Sound **off** by default with a toggle. Confetti and animation respect "reduce motion". |
| 14 | **Privacy and safety.** Data collection, open chat, strangers. | Parents | "Why does it need my child's data?" | Already addressed: no chat, no photos, consent tick box, privacy notice. |
| 15 | **Cheating / rewards farming.** | Teachers | "They found a way to spam XP" | Already addressed: repeat answers earn no XP. |

## What the best apps do right (and we copy)

- **Short loops with a visible finish line** (Duolingo lessons, Prodigy battles): a session has a start, a goal and a payoff.
- **A character the child cares about** (Khan Academy Kids' animals, Duolingo's owl): characters give feedback a personality, which feels like encouragement instead of grading.
- **Progress shown as a map** (ABCmouse, Reading Eggs): children can see where they are and what is next.
- **Collection that rewards effort, not luck** (Epic!, Khan Kids): earn it by learning, never by chance or payment.

## Design principles chosen for AdaptiveMinds

1. **Wrap the learning in a game, never replace it.** Question -> answer -> feedback is the core loop; theme, character and rewards sit around it.
2. **Make effort the currency.** Progress comes from trying, not from perfection; a wrong answer still moves the quest forward.
3. **Predictable rewards, no gambling mechanics.** Every reward is shown in advance (e.g. "3 stars to evolve").
4. **Always a clean exit.** Every round ends with a calm summary and an equal choice to stop.
5. **Calm by default.** No sound, no countdown, no guilt.

## Concept: "Quest Worlds" with a hatching companion

- **Worlds** replace the plain topic list. Each topic is a themed world with a guide character
  (e.g. Addition is Candy Kingdom with Gummy the Bear, Fractions is Pizza Planet with Chef Pie).
- **Quest** = 5 questions, then a summary of stars, XP, and what the child practised.
- **Companion**: each child gets an egg that grows through stages (Egg, Hatchling, Explorer, Hero, Legend) as XP rises.
  Growth is deterministic and always visible, so there is nothing to gamble on.
- **Daily goal**: "finish 1 quest today" (a small, achievable target) with a forgiving streak.
- **Combo**: consecutive correct answers build a visual combo for a little extra celebration. It does not remove
  anything when it breaks.

## Not built (deliberately)

- Currency shops, loot boxes, pets that "starve", leaderboards between children (comparison hurts struggling kids), timers that count down, chat.

## How to validate this brief with real data

1. Export recent app-store reviews (1-3 star) for Prodigy, IXL, ABCmouse, Khan Academy Kids, Duolingo ABC and tag each by the themes above.
2. Search Reddit (r/homeschool, r/Teachers, r/Parenting, r/elementaryteachers) and parent Facebook groups for "[app name] + boring / hates / too hard / ads".
3. Run a 5-child playtest with the new quest flow; watch for where they stall or ask to stop.
4. Track in-app: quest completion rate, questions per session, return rate after 3 days, hint use, wrong-answer drop-offs per world.
