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

Ten **side areas** branch off the main road. Neither is needed to finish the game; each is reached by a stair at the roadside that needs a tool, so they are worth coming back for:

| Side area | Way in | Needs | |
| --- | --- | --- | --- |
| The Wreck of the Sun | a cliff path near the start of the Gallows Road | Moth Wings | the Long Battalion's ship, run aground in the shallows. Drowned deckhands and knights of your own battalion, the Bosun who rowed you home, the ship's log, and the battalion roll with your name torn out of it. Boss: **the Standard-Bearer**, who still guards the colours at the stern |
| The Lily Convent | a chained causeway in the middle of the Weeping Fen | Headsman's Greataxe | the mother house of the Sisters, on an island of lilies. Weeping Novices, Sister Petra (she cleanses), the Rule of the House and the infirmary tally. Boss: **Abbess Severine, the Lily Rotted**, who drank the wash-water so her Sisters would not have to |
| The Pilgrims' Pass | a goat path near Hollowmere's third candle | Moth Wings | a snowbound mountain road to the Windcallers' monastery, swept by **gusts that push you back down it** (see below). Frozen Pilgrims, White Wolves and Cairn Wardens; Sigrun the Guide, Bram the Woodcutter (who fights beside you) and Brother Aldous. Boss: **Brother Hask, the Windcaller** |
| The Gloamwater | an old causeway east out of the Weeping Fen, past where the Matron fell | nothing: and you must go, for the wings | a drowned mire where the sickness first came up out of the ground. **Slowing water** (see below), boardwalks on stilts, Bloodflies, Weeping Moths and the Mire-Drowned; Osk the Ferryman, Hagge Wren the Mire-Wife, and Ser Pell of the Long Battalion. Boss: **the Lamplight Mother** |
| The Under-Hold | a grate behind the chapel in Brannoc's Hold | nothing | the town's catacombs: rats as big as dogs, Catacomb Ghouls, the torn-out death ledgers, and Brother Quill the archivist, who knows where the muster book went. Mini-boss: **the Gravewarden of Brannoc** |
| The Ashfall Orchard | Hollowmere's first lane | nothing (one relic wants the wings) | the burnt orchard, still warm: Ash-Pickers with coal-bright eyes, and Teodor, who lit it with his wife inside. Mini-boss: **the Charcoal Widow** |
| The Hanging Wood | behind the last gibbet of the Gallows Road, past Gaunt | nothing | a wood where every tree is a gibbet: Noosed Dead swinging their ropes, crows, and Wilm, Gaunt's son, who cut the hanged down at night and knows all seventy-one names. Mini-boss: **the Carrion King** |
| The Frozen Chapel | a side-path off the Pilgrims' Pass | nothing (the wind still blows) | a choir frozen mid-hymn and still singing, and Gerd the blind bell-ringer. Mini-boss: **Abbot Ulric, the Frozen**, who calls the wind down the nave |
| The Lost Battlegrounds | an old shield-road north out of the Weeping Fen, before the Matron's arena | nothing | the field where King Edmar broke the Marcher lords forty years ago: nine thousand dead, buried together under blank stones, in fog so thick you can hear it. Rows of headstones, swords left standing as markers, torn banners, a wrecked trebuchet. **The dead climb out of their graves** as you pass (watch for the heaped earth; they cannot be hurt until they stand): the Fallen of the Marches and the Halberdiers of King Edmar. Tamsin the Stonecutter has carved 3,112 of the names back (quest: *Nine Thousand Stones*). At the edge of the field Elsie Annet, born eleven days before her father marched, asks you to pick five of the red poppies that have grown there since the battle and lay one on each of the five graves of his line: Piers, Hob, Will, Ned and Gil the drummer (quest: *Flowers for the Fallen*; the reward is her father's locket, and with it the infection takes hold of you 15% more slowly). Boss: **Lord-Marshal Aldous Vane**, who yielded, was hanged anyway, and has held the hill since |
| The Fane of the Dawn | walk west from where you wake, to a gorge where the bridge fell; a normal jump falls short and the fall kills you; double-jump and glide to cross | the wings | a ruined temple on the sea cliffs under a dawn that never quite comes. Faceless Sentinels and Dawn-Moths, Old Bettany who sweeps it and does not know whose house it was, votive tablets of vows kept. Boss: **the Oathwarden**, a great statue that holds every oath. It leaves the **Dawnbrand** (art: Dawnfire) |
| The Ossuary | a stair halfway through the cathedral nave | Lily Lantern | the bone vaults under Saint Avaric. Sister Amabel hides here (she cleanses), and the bishop who cut the Saint is chained at the bottom. Boss: **Malvern, the Unmade Bishop** |

An archway at the near end of each side area climbs back to the stair you came down.

## Collectables and tools

**Weeping icons** — forty-nine small gilt paintings of the Saint: three in every area (side areas included), four inside buildings, one at the far end of each trial, and one somewhere secret. Finding 5 earns a permanent extra flask, 10 a permanent extra tincture vial, and all 49 three points of Vigor. The journal and the HUD show the count.

Not all of them can be reached when you first see them. Three tools open the way, and each is found in a different area from most of the things it unlocks, so it pays to go back:

| Tool | Found | Opens |
| --- | --- | --- |
| Headsman's Greataxe | dropped by Gaunt on the Gallows Road | **barred niches**: break the bars |
| Moth Wings | torn from the Lamplight Mother in the Gloamwater, east of the fen | a **second jump in mid-air**, and a **glide**: hold jump while falling. The wings show on your back when you use them |
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

## The Bestiary in the game

Press `B` (or choose **Bestiary** in the pause menu) to open it. It has three tabs:

- **Foes**: every kind of enemy, added the first time you see one, with a description, a tip and how many you have slain.
- **Bosses**: each boss, added once you have faced them, and whether they are defeated.
- **People**: Misery, Ysolde and the people who matter on the road, added once you have met them.

Every entry has a portrait drawn from the character's own sprite. Some entries grow as you learn more: Misery's after the Lantern Court and after you remember your name, Ysolde's after Hagge Wren tells you about the spring, Ser Pell's once you know your number. The key can be rebound under Settings → Controls.

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
| Frozen Pilgrim | slow, heavy club blows; the wind barely moves it |
| White Wolf | a fast pack hunter, low to the ground, so the wind hardly touches it |
| Cairn Warden | a tall spearman of the pass; poise, long reach, rooted against the wind |
| **Brother Hask, the Windcaller** | boss of the Pilgrims' Pass; an axe, a long lunge, and a horn that throws a gust straight at you. His hobnailed boots are yours when he falls |
| Bloodfly | small, fast and in swarms; dives in to drink, and what it leaves behind is the sickness |
| Weeping Moth | flies high and slow, then sweeps down and shakes its wings over you; the dust fills your infection bar |
| Mire-Drowned | at home in the water: the mire does not slow it |
| **The Lamplight Mother** | boss of the Gloamwater; a human-sized moth girl, queen of the moths, drawn to light (and Misery glows). Long dives, clouds of weeping dust, Weeping Moths called in all through the fight, and swarms of bloodflies as she weakens. Strike her as she dives, or jump |
| **Ser Garrick, the Oathkeeper** | the last boss |

## Misery

A small lavender fairy with white hair follows you as your "guide". She glows faintly and lights the dark around her, and if you stand still long enough she sits on your helm. She is not on your side. Her advice is mostly bad, she giggles when you bleed, sulks when you heal, and keeps count of every time she watches you die.

## The water of the Gloamwater

- **Shallow water** (to the ankle) halves your pace and takes the spring out of your jump.
- **Deep water** (red bubbles rise from it) slows you to a crawl, barely lets you jump, and **fills your infection bar** while you stand in it. On Unfair it is slower still and weeps into you faster.
- **Boardwalks on stilts** keep you dry, but they are broken, and the flies can reach you there.
- Enemies wade slowly too, except the Mire-Drowned. Fliers do not care.

**Hagge Wren** asks for three black lilies from the deep pools (reward: a permanent extra flask). She also starts **The Black Spring**: the weeping came up out of a spring under the drowned chapel of Saint Hild's before it ever reached Ysolde. If the spring can be stopped, nobody has to be the well. The chapel door at the far end of the mire is bound in black roots that do not give yet. This is the road toward cleansing the infection for good, still to come.

## The wind on the Pass

On the Pilgrims' Pass the wind comes in gusts. First it **howls** (snow thickens and the words THE WIND HOWLS appear), then for a few seconds it blows down the mountain and pushes you back the way you came. Then there is a lull.

- **Standing stones** give shelter: stand on their downwind side and the gust cannot touch you.
- **Raise your guard** and you are pushed less than half as far. Walking into a gust is slow; standing in the open you slide.
- **In the air** you are pushed hardest, so never jump a crevasse in a gust. Wait for the lull.
- Enemies are pushed too, but wolves, pilgrims and wardens are heavy or low and hardly move. Misery is very light.
- **Brother Hask** has no wind of his own in his arena. He blows his horn for it, straight at you.
- **Hobnailed Boots** (from Hask) halve the push, and more than halve it on the ground.

On **Unfair** the howl is short and sometimes silent, gusts are stronger and longer, lulls are shorter, and one gust in three blows **up** the mountain, toward the next crevasse.

Sigrun the Guide has a quest: her brother went up with a rope a year ago.

## Trials

Past the boss of each side area there is an optional **trial**: a long spike pit crossed on hanging ledges that do not all behave. Fall in and you are impaled and put back at the start. Misery counts your falls and enjoys every one. At the far side wait a weeping icon and a bundle of three thorns for Misery.

| Trial | Where | Needs | What is in it |
| --- | --- | --- | --- |
| The Rigging of the Sun | past the Standard-Bearer, in the Wreck | double jump | a moving yard, crumbling planks, a false plank, a swinging block, a plank that gives way the moment you land (Unfair) |
| The Bone Bridge | past Malvern, in the Ossuary | double jump | the longest jumps, falling bone spikes, two scythes on chains, a false slab |
| The Drowned Garth | past the Abbess, in the Lily Convent | single jumps only | stepping stones, a moving stone, swinging bells, a falling spike, a false stone over a low one |

What waits in the pits:

- **Crumbling ledges** give way a moment after you land on them, and come back a few seconds later.
- **False ledges** are not there at all.
- **Moving ledges** carry you with them.
- **Swinging blades and bells** knock you off whatever you are standing on.
- **Bone spikes** drop when you pass beneath.

The difficulty setting decides how fair they are. **Fair (hard):** false ledges shimmer, crumbling ledges show cracks and settle again if you step off, spikes shake before they drop, and blades keep a steady beat. **Unfair:** none of those tells. Ledges crumble twice as fast, blades change speed, spikes drop just ahead of you as you run, one last ledge in two of the trials gives way the instant you touch it (jump over it), and crows come for you mid-jump.

## Transitions

Every ordinary change of place (through a door, an archway, down a side passage, off the end of a road, between two screens of one place) is a quick dip to black and back. Story moments are kept for what matters: the cards between the chapters of the main road, and a short description the first time you enter a side area, shown while it is dark.

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

## Remembrances

The Battalion took the knight's name. Five memories bring it back, one at a time and in any order, wherever the world shakes them loose:

| Remembrance | Comes back |
| --- | --- |
| The Mill | resting at the first candle on the Gallows Road |
| The Muster | reading the roll of the Long Battalion, in the Wreck of the Sun |
| The Blessing | when Malvern falls, in the Ossuary |
| The Letter | when the Abbess falls, in the Lily Convent |
| The Sun | when the Windcaller falls, on the Pilgrims' Pass |

The journal counts them. With all five you remember your name. After that Garrick and Ysolde speak to you by it, and the choice at the end has a **third option: put the Tear to your own eye** (ending: *The Well Moved*). How Misery takes that ending depends on whether you ever brought her to the Lantern Court, where they still remember what she used to be called.

## Project layout

| File | Purpose |
| --- | --- |
| `js/engine.js` | input, blood / gib particles |
| `js/audio.js` | synthesised sound effects, ambience and music |
| `js/interiors.js` | the buildings you can enter: rooms, furniture and street fronts |
| `js/traps.js` | the trials: crumbling, false and moving ledges, swinging blades, falling spikes |
| `js/mountain.js` | the Pilgrims' Pass: its people, enemies, boss, quest and the wind |
| `js/story.js` | the Remembrances, the knight's name, and the third ending |
| `js/swamp.js` | the Gloamwater: slowing water, the flying enemies and their sprites, its people, boss and quests |
| `js/bestiary.js` | the in-game Bestiary: entries, sprite portraits and the screen |
| `js/nell.js` | after the Lamplight Mother: Nell, the root scene, Saint Hild's Undercroft and the Seven Hundred Names |
| `js/skills.js` | Weapon Arts: marks, the per-weapon trees, the new moves and each weapon's art |
| `js/optional.js` | the Under-Hold and the Ashfall Orchard, and the relics in the trials |
| `js/wardrobe.js` | the Wardrobe: knight, weapon, wing and Misery skins, their unlocks and the screen |
| `js/executions.js` | the executions: choreography per kind of foe and per boss |
| `js/optional2.js` | the Hanging Wood and the Frozen Chapel |
| `js/battlegrounds.js` | the Lost Battlegrounds: the war dead rising from their graves, Tamsin, Lord-Marshal Vane and his execution |
| `js/voice.js` | Aurelle, the goddess only the knight can hear |
| `js/fane.js` | the Fane of the Dawn and Aurelle's statues |
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

## The Lamplight Mother's wings

When the Lamplight Mother breaks, the first prompt is **Tear out her wings**. It always comes before the choice to execute or spare, so the wings are always yours. The knight steps out to her wingtip, takes it in both hands and hauls on it in jerks while she shakes and the wing-root stretches. Then it tears. He flings it away, the other one falls loose, and he steps back. Without her wings she **cowers**: curled up in the mud with her hands over her head, eyes shut, trembling. They give you the **Moth Wings**: a second jump in mid-air, and a **glide** (hold jump while falling, and you drift down slowly). Her wings show on your back while you glide or double-jump. They unfold as they appear and fold up and fade, shedding a little moth-dust, when you land or let go. If you spare her she **does not fight back**: she drags herself away into the reeds on her hands, and the moths go with her.

The wall in Hollowmere needs them, so the Gloamwater is on the way: from the fen, go east before going on to Hollowmere. (The Drowned Matron no longer carries the old Wind-Step Greaves. Saves that already have the double jump keep it, glide included.)

## After the Lamplight Mother: Nell, the roots and the first well

**If you spared her**, she is waiting at Hagge Wren's hut in the Gloamwater, wingless, wrapped in a blanket. Her name is **Nell**: a girl of drowned Hildsmere, nineteen the summer the water came up warm. She cowers until you speak to her. She tells you the spring is not water but crying, and that her moths could eat the black roots off Saint Hild's door, if a light went in front of them. Misery glows. Misery says no. (Quest: *The Moths and the Light*.) When you first speak to her you choose what becomes of her: **leave her be**, or **bind her to your service**. Bound, she wears an iron collar and **follows you as a companion** through every area; the chain stays at the hut. Every few seconds she raises both hands, gathering her moths in a pale glow, then thrusts one arm out and sends the swarm at whatever is fighting you (it builds bleeding; against bosses it does less). Speak to her on the road to send her back to Wren's hut, where she waits chained to a stake until you call her along again. She calls you master, and her Weeping Moths and Bloodflies no longer attack you. At the chapel door her moths eat the roots at your word, with no light needed. Misery is thrilled, and Aurelle says she will keep even a vow taken in iron.

**At the door**, choose *Call the moths to the roots*. Misery refuses, then gives in. If you took her to the Lantern Court, she tells you why Mercy stopped leading the dying into the dark: *"Because they always went."* Then she drifts to the roots, and the moths follow her in a white storm and eat the door open. **If you executed Nell**, her orphaned moths can still be led; it is only colder.

**Beneath it** is **Saint Hild's Undercroft**, and **Saint Hild** herself: the *first* well. Three hundred years ago she drank the spring so it would not reach Hildsmere. She wept once, and that tear is the Saint's Tear. She says the Tear only moves the weeping from one well to the next, and that the spring is **grief**: the weeping of every dead thing nobody named. The Long Battalion's seven hundred struck-out names have fed it like a river. To end the weeping, **name them**. The priests wrote every name in a muster book before they struck them out. This starts the quest **Seven Hundred Names**, the road toward cleansing the infection for good. Its next step is still to come.

## The knight wears down

The infection shows on the knight as the story goes on, whatever harness he wears. With every boss that falls (and when he remembers his name) it gets worse:

| Stage | After | Look |
| --- | --- | --- |
| clean | the start | bright steel, a red plume |
| the rust sets in | 2 bosses | duller steel, rust spots, a faded plume |
| the weeping begins | 6 | darker still, red tears running from the visor, a crack across the helm, old blood on the legs, a darker cape |
| more of it than of you | 10 | blackened harness, and a red glow behind the eye-slit |

A banner and a word from Misery mark each new stage.

## Wardrobe

Skins, chosen at any vigil candle or from the pause menu. Each tab shows a live preview. Locked skins appear as silhouettes with the way to earn them.

| | Skins (how to unlock) |
| --- | --- |
| **Knight** | Harness of the Long Battalion · Headsman's Black (Gaunt) · Red of the Marches (Lord-Marshal Vane) · Gilded Sun of Osric (Standard-Bearer) · Knight of the Lily (the lily quest) · Pilgrim of the Pass (Windcaller) · Moth-Knight (Lamplight Mother) · The Weeping Knight (die ten times) · Corin, Bareheaded (remember your name) |
| **Weapon** (chosen per weapon) | Plain Steel · Bloodied (a hundred kills) · Gilded (fifteen icons) · Bone (Malvern) · Rimed (Windcaller) · Moth-Dust (Lamplight Mother) · Oathkeeper's Black (Ser Garrick) |
| **Wings** | Lamplight · Luna (find Nell) · Ghost (the Lantern Court) · Ember (Charcoal Widow) · Death's-Head (Gravewarden) · Seraph (thirty icons) |
| **Misery** | Misery · Mercy, As She Was (the Court, and your name) · Crimson (die twenty-five times) · Moonmoth (lead the moths to the roots) · Thorned (give her every gift) |

Defeating or sparing a boss both count.

## Weapon Arts

Every weapon has its own skill tree, bought at a vigil candle (**Weapon arts**) with **Marks of Martyrdom**. The screen shows the weapon itself painted at the root of its tree, two branches of skills growing up from it, and its art at the crown. Gold lines light up as you learn, and the next skills you can afford pulse. Move between nodes with the arrow keys or the mouse; the panel beside the tree describes the one you are on. A meter under your weapon name fills with every death you cause; a full meter is a mark, and every boss gives one outright. Skills belong to the weapon they were bought for. Switch weapons with the arrows at the bottom of the screen.

| | Left branch | Right branch |
| --- | --- | --- |
| 1 mark | **Keen Edge**: +15% damage | **Light Hand**: attacks cost a quarter less stamina |
| 2 marks | **Bloodletter**: builds bleeding 60% faster | **Plunging Blow**: in the air, hold down and attack to drive the blade down and strike everything where you land |
| 3 marks | **Final Blow**: one more attack at the end of the combo, a guard-breaking finisher | **Gathered Strength**: hold heavy to charge, release for double damage that breaks any guard |

The top of each tree (3 marks, both branches, and a **Martyr's Relic**) is that weapon's own **art**:

| Weapon | Art |
| --- | --- |
| Knight's Longsword | **Oath of the Battalion**: light attacks a third faster |
| Headsman's Greataxe | **Headsman's Due**: every severed limb gives back 6% of your life |
| Penitent's Flail | **Scourge of the Penitent**: a haemorrhage spreads its bleeding to everything near it |
| Fen-Warden Spear | **Warden's Reach**: every blow reaches a quarter further |
| Battalion Greatsword | **Colours of the Sun**: +30% damage while your life is above three quarters |
| The Seventh Knife | **The Seventh Cut**: every seventh hit opens a haemorrhage |
| The Abbess's Scythe | **Harvest**: every kill restores your stamina and 4% of your life |
| Pilgrim's Ice-Axe | **Frostbite**: what you strike is slowed for three seconds |

**Martyr's Relics** (eleven so far: two each in the Hanging Wood, the Frozen Chapel and the Lost Battlegrounds too): two in the Under-Hold and two in the Ashfall Orchard (one of each behind its mini-boss), and one at the far end of each of the three trials.

## Executions

Each kind of foe dies its own way:

| Who | Execution |
| --- | --- |
| hounds, wolves, rats | **pinned**: the blade straight down through them |
| crows, moths, bloodflies | **torn apart**: caught in both hands and pulled in two |
| bloats | **ruptured**: one thrust, then step back from the fountain |
| headsmen, wardens and other big ones | **hamstrung**: a cut behind the knee, then the head while they kneel |
| the rest | a beheading, an impaling, or a flurry of cuts (the Seventh Knife always cuts many times) |

Every boss has its own:

| Boss | Execution |
| --- | --- |
| Gaunt, the Windcaller, the Gravewarden | hamstrung, then beheaded |
| the Drowned Matron | **returned to the water**: the knight drives his sword into the mud, takes her head in both hands and forces her down. **Mash Use (E, or the Use button on touch)** to hold her under while she claws and thrashes up out of the water. Fill the bar before it runs out and she slowly goes under and is still. Fail and **she drowns you instead**: she rises out of the water, takes your head, and holds you under until you die |
| the Standard-Bearer | **relieved of duty**: his greatsword struck spinning from his hands, a salute with the blade, a thrust through, and the Battalion's colours falling over him |
| Abbot Ulric | skewered, lifted high on the blade, then flung down |
| Lord-Marshal Vane | **the last grave**: a blow to the helm drops him to his knees, a thrust through, and the earth takes him back while the fog closes over the place |
| Malvern, the Charcoal Widow | six cuts and a thrust ("SEVEN CUTS") |
| the Carrion King | torn apart |
| Ser Garrick, the Abbess, the Lamplight Mother | a quiet thrust to the heart, kneeling with them ("AT REST") |

**Drinking**: the knight takes the flask off his belt, tips it up under his visor and drinks it down. A glow rises through him when it takes: gold for blessed water, lavender for a lily tincture.

## Aurelle

The knight is guided by **Aurelle of the Dawn, goddess of vows kept**. She kept his vow alive all the long way home, and only he can hear her. Whenever she speaks, **a shaft of gold dawn-light falls on the knight alone**, with motes drifting down it, and a glass note sounds. Her words appear in gold over the play without stopping it, or in a gold dialogue box at the turns of the story.

She speaks:
- before Misery finds him, at the very start ("Rise, little knight... I am Aurelle, of the Dawn.")
- the first time he enters each place
- at his first rest, and when he rises after a death
- sometimes after a boss falls
- before the last choice

**Her statues** stand in the Fane of the Dawn and beside the Chapel of the Lily in Brannoc's Hold: a robed woman with a sun at her back, her face worn smooth. Nobody living remembers whose they are. Kneel before one and she answers, and once between rests her warmth gives back a quarter of your life.

No one else knows of her. Only Misery notices him listening to nothing ("Who are you nodding at? There is nobody there. ...Is there?").

## Execute or spare

When a boss is broken you choose: **Execute** (the old way) or **Spare**. Spared or executed, the boss counts as beaten: the way on opens and any tool they carried is yours. Misery only gets her thorns for an execution, and she hates mercy. But not every boss can bear being pitied:

| Boss | If spared |
| --- | --- |
| Gaunt, the High Headsman | **enraged**: gets up again |
| The Drowned Matron | **enraged** |
| The Standard-Bearer | **yields**: lays down the colours and walks into the sea |
| Malvern, the Unmade Bishop | **enraged** |
| Abbess Severine | **yields**: goes to wash herself at the font |
| Brother Hask, the Windcaller | **yields**: leaves his boots in the snow and walks up into the white |
| The Lamplight Mother | **yields**: wingless and cowering, she drags herself away |
| Ser Garrick | **yields**: "I will hold the door from the other side" |

An **enraged** boss gets back up with nearly half its health, wrapped in a red haze. It hits a third harder, moves faster, and cannot be spared a second time. A boss that **yields** turns away and is gone, leaving some ichor. The Bestiary records who you spared.

## Difficulty

**Bosses are hard and unfair by default.** On **Unfair** they have 60% more health and hit 35% harder; their wind-ups are never the same length twice, so some blows come early and some are held; they follow one blow straight into another; they rush you the moment you drink a flask nearby; they mostly ignore what would stagger them; and in their second phase the armed ones turn light hits aside. The Matron calls one extra hound each time.

If that is too much, switch to **Fair** under Settings (from the title screen or Pause). It changes only the bosses, is remembered by your browser, and can be changed at any time, even mid-fight.

## Weapons

You start with the longsword. Seven more are lying in the world, each driven into the ground with a glow around it. Take one and it is yours for good; press `C` (or tap the weapon name on touch) to change between those you own.

| Weapon | Where | Character |
| --- | --- | --- |
| Knight's Longsword | start | balanced three-hit combo |
| Headsman's Greataxe | the Gallows Road, dropped by Gaunt | slow, heavy, every blow breaks poise and severs limbs easily |
| Fen-Warden Spear | the Weeping Fen | long reach, thrusts only, weak at severing |
| Penitent's Flail | Hollowmere | fast, light, builds bleeding quickly, rarely severs |
| Battalion Greatsword | the Wreck of the Sun, left by the Standard-Bearer | long, heavy two-hit combo; severs well |
| The Abbess's Scythe | the Lily Convent, left by Abbess Severine | wide, long sweeps that bleed well |
| Pilgrim's Ice-Axe | the Pilgrims' Pass, on a frozen climber | short, quick three-hit combo that severs well |
| The Seventh Knife | the Ossuary, left by Malvern | very short and very fast four-hit combo; bleeds like nothing else |

Weapons are plain data in `G.WEAPONS` (`js/data.js`): a light combo, a heavy attack, reach, bleed build-up and a sever multiplier per move. To add one, add an entry there, a pixel drawing for it in `js/chibi.js`, and an item with `weapon: '<id>'` in a level.
