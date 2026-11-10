# Ashen Vow

A dark, bloody, story-driven 2D action game set in a dark age consumed by an infection.
You are **Ser Aldric Vane**, a knight who comes home after seven years abroad carrying a relic that was meant to save a kingdom that no longer exists.

No build step, no dependencies, no asset files — all art and sound are generated in code.

Characters are chibi pixel sprites in the manner of 16-bit JRPG field sprites, placed pixel by pixel in code. Backdrops, props and ground blood are drawn at half size, reduced to a limited palette with an ordered dither, and scaled up unsmoothed to match.

## Play

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Controls

| Action | Keyboard / mouse |
| --- | --- |
| Move | `A` `D` or arrow keys |
| Jump | `W` or up arrow |
| Drop through a ledge | `S` or down arrow (or walk off the edge) |
| Slash (3-hit combo) | `J` or left click |
| Heavy attack | `K` or right click |
| Roll (invulnerable) | `Space` |
| Block | `L` or `Shift` |
| Drink flask | `Q` |
| Drink lily tincture (fights infection) | `R` or `F` |
| Interact / **Execute** | `E` |
| Change weapon | `C` or `X` |
| Quest journal | `Tab` or `T` |
| Pause | `Esc` |
| Full screen | button at the top centre of the screen |
| Mute | `M` |

On touch devices: two move keys on the left; Slash, Heavy, Block and Roll on the right; a Use button that appears only when there is something to speak to, read, gather or execute. Tap the flask or tincture icons in the HUD to drink. Quests, full screen and pause sit at the top centre. The pad hides while a menu or dialogue is open.

## Mechanics

- **Bleeding** — every hit sprays blood and builds a bleed meter. Fill it and the enemy haemorrhages: a burst of damage, then damage over time.
- **Dismemberment** — hits land on a body part. Limbs have their own health and come off, and it matters:
  - sword arm gone: the enemy drops its weapon, hits weaker and shorter
  - both arms gone: it can only bite
  - a leg gone: it crawls
  - open stumps bleed until the enemy dies
- **Executions** — an enemy at low health is *Broken* and kneels. Step close and press `E` to execute it: an instant kill that restores health and pays 50% more ichor. Leave it kneeling too long and it rises in a frenzy.
- **Jumping** — a short hop that clears pouncing hounds and crawling enemies, and lets a swing reach crows in the air. It does not avoid a standing enemy's weapon.
- **Ledges** — every area has scaffolds or galleries to climb, one jump per tier. They are solid from above only, so you jump up through them. Most hold a **reliquary** worth a lot of ichor. Ordinary enemies cannot reach the top tier; pikes, scythes, axes and crows can.
- **Stamina** — attacks, rolls and blocked hits cost stamina. An empty bar means a broken guard.
- **Vigil candles** — rest to refill flasks, set your checkpoint and spend ichor on Vigor, Strength or Endurance. The infected never rest, so more will have wandered in while you did.
- **Death** — you drop your ichor where you fall. Reach the stain to reclaim it; die first and it is gone.

## The infection

The Weeping is a sickness, not a curse. The things on the road are **living people**: infected, sleepless, unable to stop, and left with one want — to kill whoever is still clean. It enters through wounds.

- **Infection meter** — the purple bar under your stamina. Every wound you take raises it. Above half it slows your stamina recovery and the edges of your sight close in.
- **Turning** — when the bar fills you have **45 seconds**. You hit harder while it lasts. If the clock runs out you turn, which counts as a death.
- **Sisters of the Lily** — nuns in black veils and white frills who keep the chapels. A Sister washes the infection out completely and refills your tincture vial. Three keep the great chapel in Brannoc's Hold; one keeps a wayside chapel in every other area.
- **Lily tincture** (`R`) — a vial you carry that knocks the infection back by about half and stops the clock. One to start; a quest earns a second.
- Resting at a candle does **not** cure you. Dying leaves you at half infection at most.
- Wayside Sisters carry swords and fight, but they can be killed — and then that chapel is gone for the rest of that save.

## The world

| Chapter | Area | |
| --- | --- | --- |
| I | The Gallows Road | the long road in, with a wayside chapel near its end |
| II | Brannoc's Hold | a walled town with no enemies: guards, tradesfolk, refugees and the Chapel of the Lily |
| III | The Weeping Fen | black water, hounds and bloats; white lilies grow here |
| IV | Hollowmere | your home village |
| V | Cathedral of Saint Avaric | the source |

## Collectables and tools

**Weeping icons** — fifteen small gilt paintings of the Saint, three in every area. Finding 5 earns a permanent extra flask, 10 a permanent extra tincture vial, and all 15 three points of Vigor. The journal and the HUD show the count.

Not all of them can be reached when you first see them. Three tools open the way, and each is found in a different area from most of the things it unlocks, so it pays to go back:

| Tool | Found | Opens |
| --- | --- | --- |
| Headsman's Greataxe | dropped by Gaunt on the Gallows Road | **barred niches**: break the bars |
| Wind-Step Greaves | dropped by the Drowned Matron in the fen | a **second jump in mid-air**, enough to reach the lone high ledges |
| Lily Lantern | on a ledge at the far end of Hollowmere | **red veils**: its light parts them |

**Wist notices them.** If an icon is still hidden in the area, she lets something slip every minute or two: only a direction from far away, and what is in the way when you are close. The motes around her turn gold when one is near. She says so once when an area is cleared out.

## Quests

Quests are lists of clear steps. The current step of each active quest is tracked in the top-right corner, and the journal (`Tab`) shows every step with what is done, what is next and what failed. A gold `!` marks someone with a quest to give; a gold `?` marks someone a step sends you to.

- **The Ashen Vow** — the main story, start to finish.
- **Cut Him Down**, **Spadework**, **The Lamp Left Lit** — the Gallows Road.
- **The Gate Must Hold**, **A Better Edge**, **Lilies for the Sisters** — given in Brannoc's Hold, carried out beyond it.
- **Three Knocks** — the Weeping Fen.
- **Four Hundred and One**, **Hold the Square**, **The One Who Circles** — Hollowmere.
- **Last Rites** — the cathedral.

Rewards are ichor, a point of Strength, or a permanent extra flask or tincture vial. A quest fails if the person it is for dies.

## The people of Morrowmere

Enemies hunt villagers as well as you, and lean towards the easier prey.

- **Fighters** (Wynn, Ser Oswin, Edda, Ser Rowan, Garrow, the wayside Sisters) draw a weapon, fight beside you and can still be overwhelmed.
- **The helpless** (Marta, Jory, Wenna, the Plague Doctor, Old Tobias, Greta, Brother Anselm) back away and beg. If you do not reach them in time they die.
- **They can turn.** Every wound a villager takes fills a small purple bar under their health. When it fills they have **12 seconds**: stand next to them and press `E` to give them your own tincture, or they become one of the infected and attack you. The Sisters do not turn. Like a death, turning is permanent.
- A death is permanent for that save, and resting does not bring anyone back. Survivors are healed when you rest.
- A few people the story needs, and everyone inside the walls of Brannoc's Hold, cannot be harmed.

## Bestiary

| Enemy | Notes |
| --- | --- |
| Weeping Wretch, Deserter, Flagellant, Knight of the Veil | the infected, in whatever they were wearing when it took them |
| Headsman | huge, slow, cannot be staggered by light hits |
| **Gaunt, the High Headsman** | boss of the Gallows Road; a greataxe and a long charge. His axe is yours when he falls |
| **The Drowned Matron** | boss of the Weeping Fen; calls hounds twice as she weakens and vomits blood that fills your infection bar |
| Carrion Hound | four-legged, fast, pounces; cut a leg off and it drags itself |
| Gallows Crow | flies out of reach and dives; strike as it pulls up, or take a wing |
| Weeping Bloat | bursts over everyone nearby when killed — unless you execute it |
| Rot-Pike | long spear thrust |
| Pale Reaper | tall, wide scythe sweeps |
| **Ser Garrick, the Oathkeeper** | the last boss |

## Wist

A small lavender fairy with white hair follows you as your "guide". She is not on your side. Her advice is mostly bad, she giggles when you bleed, sulks when you heal, and keeps count of every time she watches you die.

## Sound

All audio is synthesised in the browser: a music theme per area (title, road, village, cathedral, boss), weather and room ambience, and effects for combat, footsteps, enemies, dialogue and the fairy.

## Story

Five chapters told through characters you meet, notes you find, a boss who used to be your friend, and a final choice with two endings.

Progress saves at vigil candles (browser local storage).

## Project layout

| File | Purpose |
| --- | --- |
| `js/engine.js` | input, blood / gib particles |
| `js/audio.js` | synthesised sound effects, ambience and music |
| `js/fairy.js` | Wist: lines, behaviour and drawing |
| `js/sprites.js` | hand-placed pixel sprites for the hound, the crow and Wist |
| `js/chibi.js` | chibi pixel sprites for every humanoid, pixel gibs, and the vector-to-pixel helper |
| `js/npc.js` | villagers: fighting, fleeing, dying |
| `js/quests.js` | quest definitions and the quest log |
| `js/data.js` | weapons, enemy types, levels, all story text |
| `js/render.js` | procedural character rig, weapons, backdrops |
| `js/entities.js` | player and enemy logic (combat, limbs, bleeding, AI) |
| `js/ui.js` | title, dialogue, notes, menus |
| `js/game.js` | game state, level flow, HUD, main loop |

## Weapons

You start with the longsword. Three more are lying in the world, each driven into the ground with a glow around it. Take one and it is yours for good; press `C` (or tap the weapon name on touch) to change between those you own.

| Weapon | Where | Character |
| --- | --- | --- |
| Knight's Longsword | start | balanced three-hit combo |
| Headsman's Greataxe | the Gallows Road, dropped by Gaunt | slow, heavy, every blow breaks poise and severs limbs easily |
| Fen-Warden Spear | the Weeping Fen | long reach, thrusts only, weak at severing |
| Penitent's Flail | Hollowmere | fast, light, builds bleeding quickly, rarely severs |

Weapons are plain data in `G.WEAPONS` (`js/data.js`): a light combo, a heavy attack, reach, bleed build-up and a sever multiplier per move. To add one, add an entry there, a pixel drawing for it in `js/chibi.js`, and an item with `weapon: '<id>'` in a level.
