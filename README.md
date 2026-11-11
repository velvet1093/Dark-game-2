# Ashen Vow

A dark, bloody, story-driven 2D action game set in a dark age consumed by an infection.
You are a **nameless knight of the Long Battalion**: seven hundred knights who gave up their names at the muster and marched east for King Osric. You are the one who came home, seven years later, carrying a relic meant to save a kingdom that no longer exists. Only your sister still remembers what you were called.

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

**Keys can be rebound** from Pause → Controls; the bindings are saved in your browser. Menus can be driven with the arrow keys and Enter.

**Controllers** work with the standard layout: A jump, B roll, X slash, Y heavy, LB interact, RB block, LT flask, RT tincture, D-pad up change weapon, D-pad down drop, Select quests, Start pause, left stick or D-pad to move. Prompts show controller buttons once you use one.

On touch devices: two move keys on the left; Slash, Heavy, Block and Roll on the right; a Use button that appears only when there is something to speak to, read, gather or execute. Tap the flask or tincture icons in the HUD to drink. A Drop button appears while you stand on a ledge. Quests, full screen and pause sit at the top centre. The pad hides while a menu or dialogue is open.

## Mechanics

- **Bleeding** — every hit sprays blood and builds a bleed meter. Fill it and the enemy haemorrhages: a burst of damage, then damage over time.
- **Dismemberment** — hits land on a body part. Limbs have their own health and come off, and it matters:
  - sword arm gone: the enemy drops its weapon, hits weaker and shorter
  - both arms gone: it can only bite
  - a leg gone: it crawls
  - open stumps bleed until the enemy dies
- **Executions** — an enemy at low health is *Broken* and kneels. Step close and press `E` to execute it: an instant kill that restores health and pays 50% more ichor. Leave it kneeling too long and it rises in a frenzy.
- **Jumping** — a short hop that clears pouncing hounds and crawling enemies, and lets a swing reach crows in the air. It does not avoid a standing enemy's weapon.
- **Ledges** — every area has scaffolds or galleries to climb, one jump per tier. They are solid from above only, so you jump up through them. Most hold a **reliquary** worth a lot of ichor. Lighter enemies (wretches, deserters, flagellants, knights, pikes, reapers, hounds) jump up after you, one tier at a time, and drop back down when you do; the Headsmen, bloats and bosses stay on the ground.
- **Pits** — stakes on the road and in Hollowmere, black water in the fen, a broken floor over the crypt in the cathedral. Jump them. Falling in costs health and infection and puts you back at the edge you came from. The infected will not walk into a pit, but a hard enough blow can knock them in, and that kills them.
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

Three **side areas** branch off the main road. Neither is needed to finish the game; each is reached by a stair at the roadside that needs a tool, so they are worth coming back for:

| Side area | Way in | Needs | |
| --- | --- | --- | --- |
| The Wreck of the Sun | a cliff path near the start of the Gallows Road | Wind-Step Greaves | the Long Battalion's ship, run aground in the shallows. Drowned deckhands and knights of your own battalion, the Bosun who rowed you home, the ship's log, and the battalion roll with your name torn out of it. Boss: **the Standard-Bearer**, who still guards the colours at the stern |
| The Lily Convent | a chained causeway in the middle of the Weeping Fen | Headsman's Greataxe | the mother house of the Sisters, on an island of lilies. Weeping Novices, Sister Petra (she cleanses), the Rule of the House and the infirmary tally. Boss: **Abbess Severine, the Lily Rotted**, who drank the wash-water so her Sisters would not have to |
| The Ossuary | a stair halfway through the cathedral nave | Lily Lantern | the bone vaults under Saint Avaric. Sister Amabel hides here (she cleanses), and the bishop who cut the Saint is chained at the bottom. Boss: **Malvern, the Unmade Bishop** |

An archway at the near end of each side area climbs back to the stair you came down.

## Collectables and tools

**Weeping icons** — twenty-nine small gilt paintings of the Saint: three in every area (side areas included), four inside buildings, and one somewhere secret. Finding 5 earns a permanent extra flask, 10 a permanent extra tincture vial, and all 29 three points of Vigor. The journal and the HUD show the count.

Not all of them can be reached when you first see them. Three tools open the way, and each is found in a different area from most of the things it unlocks, so it pays to go back:

| Tool | Found | Opens |
| --- | --- | --- |
| Headsman's Greataxe | dropped by Gaunt on the Gallows Road | **barred niches**: break the bars |
| Wind-Step Greaves | dropped by the Drowned Matron in the fen | a **second jump in mid-air**, enough to reach the lone high ledges |
| Lily Lantern | on a ledge at the far end of Hollowmere | **red veils**: its light parts them |

Each tool is also needed once on the main path, so none of them can be skipped:

- **The Fen Gate** out of Brannoc's Hold is chained; it takes the greataxe. If you left the axe lying where Gaunt fell, go back for it.
- **A collapsed wall** blocks the lane through Hollowmere; it takes the double jump.
- **A red veil** chokes the hill path at the end of Hollowmere; it takes the lantern, found on a ledge just before it.

**Misery notices them.** If an icon is still hidden in the area, she lets something slip every minute or two: only a direction from far away, and what is in the way when you are close. The motes around her turn gold when one is near. She says so once when an area is cleared out.

## Buildings

Six buildings can be entered. Walk up to the door and press the interact key. The street outside waits exactly as you left it, and anything you kill inside stays dead until you rest or travel.

| Area | Building | Inside |
| --- | --- | --- |
| Gallows Road | The Cooper's Cottage | the cooper, who never left; a note from his wife; an icon on a shelf |
| Brannoc's Hold | The Drowned Lamb | Maren the innkeeper and two regulars; an icon up in the loft |
| Brannoc's Hold | Dunstan's Forge | Dunstan, his furnace and his trade |
| Weeping Fen | The Eel-Catcher's Hovel | flooded, and not empty; a reliquary on the loft |
| Hollowmere | The Old Mill | your family's home, still turning; Ysolde's ledger; an icon in the loft |
| Cathedral | The Sacristy | the Bishop's seven knives, two guards, a reliquary and an icon |

Misery counts icons behind a door when she hints, and tells you when one is indoors.

## A secret

There is a seventh place, behind no door. Somewhere in the game a child's rhyme says where to look and what to do; it takes no tool, only patience. What waits there are the other kind of fairy, who remember Misery by an older name. The ring lets in whatever the still one carries, so Misery comes in with you. They are not pleased to see her, and she is not pleased to be seen; she has something to say to nearly all of them.

## Trade in Brannoc's Hold

Ichor also buys things in town, which is a reason to travel back to it.

| Who | Sells |
| --- | --- |
| Dunstan the Smith (in his forge) | reforges any weapon you own, up to +3; each level adds 15% damage (300, 700, 1300 ichor) |
| Fenwick the Peddler | lily tincture to refill a vial (140), two spare flasks for good (900, 1600), one spare tincture vial for good (1400) |

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
| Drowned Deckhand, Drowned Knight of the Battalion | the crew and passengers of the Sun, in the Wreck |
| **The Standard-Bearer of the Long Battalion** | boss of the Wreck of the Sun; a greatsword, long lunges and an overhead slam. His sword is yours when he falls |
| **Malvern, the Unmade Bishop** | boss of the Ossuary; a crozier-spear, a censer that fills your infection bar, and flagellants he calls twice as he weakens. He leaves the Seventh Knife |
| Weeping Novice | a young Sister gone over; quick knife thrusts, and she weeps on you |
| **Abbess Severine, the Lily Rotted** | boss of the Lily Convent; a long scythe, a lunging reap, tears that fill your infection bar, and novices she calls twice. Her scythe is yours when she falls |
| **Ser Garrick, the Oathkeeper** | the last boss |

## Misery

A small lavender fairy with white hair follows you as your "guide". She glows faintly and lights the dark around her, and if you stand still long enough she sits on your helm. She is not on your side. Her advice is mostly bad, she giggles when you bleed, sulks when you heal, and keeps count of every time she watches you die.

## Resting

At a vigil candle the knight lowers himself to the ground beside the flame, sword held upright, before the candle's menu opens. He stays seated after you close it, and Misery soon settles on his helmet. Move, attack, roll or jump to get up. After a death you wake already sitting at the last candle you rested at.

## Misery fights (for herself)

When something is fighting you, Misery darts in and stings it every couple of seconds, then flits back out. She does not do it to help. You are her seat, and she intends to be the one who watches you die. A sting does little damage and never interrupts anything, unless she has been given Dazzle.

### Misery's gifts

Every execution earns a **thorn** (a boss gives four), shown under your weapon name. Spend thorns at any vigil candle under **Misery's gifts**. Gifts are in three branches, and each needs the one above it:

| | Spite (her sting) | Glow (her light) | Old Name (what Mercy was) |
| --- | --- | --- | --- |
| 1 thorn | **Sharper Needle**: stings do nearly twice the damage | **Brighter Wings**: a wider circle of light | **Sip**: each sting gives you back a little life |
| 2 thorns | **Bleeding Kiss**: stings build bleeding | **Magpie Eye**: icon hints twice as often, with a count and distance | **Fever-Eater**: each sting draws infection out of you |
| 3 thorns | **Jealousy**: twice as many stings in a boss fight | **Dazzle**: stings stagger lesser foes and delay a boss's blow | **Not Yet**: once per rest, a killing blow leaves you at 1 life |

Saves from before the tree start with three thorns for every boss already beaten.

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
| `js/interiors.js` | the buildings you can enter: rooms, furniture and street fronts |
| `js/areas.js` | the three side areas, their enemies, bosses and weapons, and the stairs down to them |
| `js/fairy.js` | Misery: lines, behaviour and drawing |
| `js/sprites.js` | hand-placed pixel sprites for the hound, the crow and Misery |
| `js/chibi.js` | chibi pixel sprites for every humanoid, pixel gibs, and the vector-to-pixel helper |
| `js/npc.js` | villagers: fighting, fleeing, dying |
| `js/quests.js` | quest definitions and the quest log |
| `js/data.js` | weapons, enemy types, levels, all story text |
| `js/render.js` | procedural character rig, weapons, backdrops |
| `js/entities.js` | player and enemy logic (combat, limbs, bleeding, AI) |
| `js/ui.js` | title, dialogue, notes, menus |
| `js/game.js` | game state, level flow, HUD, main loop |

## Difficulty

**Bosses are hard and unfair by default.** On **Unfair** they have 60% more health and hit 35% harder; their wind-ups are never the same length twice, so some blows come early and some are held; they follow one blow straight into another; they rush you the moment you drink a flask nearby; they mostly ignore what would stagger them; and in their second phase the armed ones turn light hits aside. The Matron calls one extra hound each time.

If that is too much, switch to **Fair** under Settings (from the title screen or Pause). It changes only the bosses, is remembered by your browser, and can be changed at any time, even mid-fight.

## Weapons

You start with the longsword. Six more are lying in the world, each driven into the ground with a glow around it. Take one and it is yours for good; press `C` (or tap the weapon name on touch) to change between those you own.

| Weapon | Where | Character |
| --- | --- | --- |
| Knight's Longsword | start | balanced three-hit combo |
| Headsman's Greataxe | the Gallows Road, dropped by Gaunt | slow, heavy, every blow breaks poise and severs limbs easily |
| Fen-Warden Spear | the Weeping Fen | long reach, thrusts only, weak at severing |
| Penitent's Flail | Hollowmere | fast, light, builds bleeding quickly, rarely severs |
| Battalion Greatsword | the Wreck of the Sun, left by the Standard-Bearer | long, heavy two-hit combo; severs well |
| The Abbess's Scythe | the Lily Convent, left by Abbess Severine | wide, long sweeps that bleed well |
| The Seventh Knife | the Ossuary, left by Malvern | very short and very fast four-hit combo; bleeds like nothing else |

Weapons are plain data in `G.WEAPONS` (`js/data.js`): a light combo, a heavy attack, reach, bleed build-up and a sever multiplier per move. To add one, add an entry there, a pixel drawing for it in `js/chibi.js`, and an item with `weapon: '<id>'` in a level.
