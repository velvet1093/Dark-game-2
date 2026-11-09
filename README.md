# Ashen Vow

A dark, bloody, story-driven 2D action game set in a plague-ridden dark age.
You are **Ser Aldric Vane**, a knight who comes home after seven years abroad carrying a relic that was meant to save a kingdom that no longer exists.

No build step, no dependencies, no asset files — all art and sound are generated in code.

## Play

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Controls

| Action | Keyboard / mouse |
| --- | --- |
| Move | `A` `D` or arrow keys |
| Slash (3-hit combo) | `J` or left click |
| Heavy attack | `K` or right click |
| Roll (invulnerable) | `Space` |
| Block | `L` or `Shift` |
| Drink flask | `Q` |
| Interact / **Execute** | `E` |
| Quest journal | `Tab` or `T` |
| Pause | `Esc` |
| Mute | `M` |

On-screen buttons appear on touch devices.

## Mechanics

- **Bleeding** — every hit sprays blood and builds a bleed meter. Fill it and the enemy haemorrhages: a burst of damage, then damage over time.
- **Dismemberment** — hits land on a body part. Limbs have their own health and come off, and it matters:
  - sword arm gone: the enemy drops its weapon, hits weaker and shorter
  - both arms gone: it can only bite
  - a leg gone: it crawls
  - open stumps bleed until the enemy dies
- **Executions** — an enemy at low health is *Broken* and kneels. Step close and press `E` to execute it: an instant kill that restores health and pays 50% more ichor. Leave it kneeling too long and it rises in a frenzy.
- **Stamina** — attacks, rolls and blocked hits cost stamina. An empty bar means a broken guard.
- **Vigil candles** — rest to refill flasks, set your checkpoint and spend ichor on Vigor, Strength or Endurance. Resting also returns the dead to their feet.
- **Death** — you drop your ichor where you fall. Reach the stain to reclaim it; die first and it is gone.

## Quests

Quests are lists of clear steps. The current step of each active quest is tracked in the top-right corner, and the journal (`Tab`) shows every step with what is done, what is next and what failed. A gold `!` marks someone with a quest to give; a gold `?` marks someone a step sends you to.

- **The Ashen Vow** — the main story, start to finish.
- **Cut Him Down**, **Spadework**, **The Lamp Left Lit** — the Gallows Road.
- **Four Hundred and One**, **Hold the Square** — Hollowmere.
- **Last Rites** — the cathedral.

Rewards are ichor or a permanent extra flask. A quest fails if the person it is for dies.

## The people of Morrowmere

Enemies hunt villagers as well as you, and lean towards the easier prey.

- **Fighters** (Wynn, Ser Oswin, Edda, Ser Rowan) draw a weapon, fight beside you and can still be overwhelmed.
- **The helpless** (Marta, the Plague Doctor, Old Tobias, Brother Anselm) back away and beg. If you do not reach them in time they die.
- A death is permanent for that save, and resting does not bring anyone back. Survivors are healed when you rest.
- A few people the story needs cannot be harmed.

## Bestiary

| Enemy | Notes |
| --- | --- |
| Weeping Wretch, Deserter, Flagellant, Knight of the Veil | foot soldiers of the plague |
| Headsman | huge, slow, cannot be staggered by light hits |
| Carrion Hound | four-legged, fast, pounces; cut a leg off and it drags itself |
| Gallows Crow | flies out of reach and dives; strike as it pulls up, or take a wing |
| Weeping Bloat | bursts over everyone nearby when killed — unless you execute it |
| Rot-Pike | long spear thrust |
| Pale Reaper | tall, wide scythe sweeps |
| Ser Garrick | the boss |

## Wist

A small lavender fairy with white hair follows you as your "guide". She is not on your side. Her advice is mostly bad, she giggles when you bleed, sulks when you heal, and keeps count of every time she watches you die.

## Sound

All audio is synthesised in the browser: a music theme per area (title, road, village, cathedral, boss), weather and room ambience, and effects for combat, footsteps, enemies, dialogue and the fairy.

## Story

Three chapters — the Gallows Road, Hollowmere, and the Cathedral of Saint Avaric — told through characters you meet, notes you find, a boss who used to be your friend, and a final choice with two endings.

Progress saves at vigil candles (browser local storage).

## Project layout

| File | Purpose |
| --- | --- |
| `js/engine.js` | input, blood / gib particles |
| `js/audio.js` | synthesised sound effects, ambience and music |
| `js/fairy.js` | Wist: lines, behaviour and drawing |
| `js/beasts.js` | hound and crow models |
| `js/npc.js` | villagers: fighting, fleeing, dying |
| `js/quests.js` | quest definitions and the quest log |
| `js/data.js` | weapons, enemy types, levels, all story text |
| `js/render.js` | procedural character rig, weapons, backdrops |
| `js/entities.js` | player and enemy logic (combat, limbs, bleeding, AI) |
| `js/ui.js` | title, dialogue, notes, menus |
| `js/game.js` | game state, level flow, HUD, main loop |

## Adding weapons

The sword is the only weapon for now. Weapons are plain data in `G.WEAPONS` (`js/data.js`): a light combo, a heavy attack, reach, bleed build-up and a sever multiplier per move. Add an entry and set `player.weapon` — combat, animation and drawing all read from that table.

Planned: greataxe (slow, huge sever), flail (fast bleed build-up), spear (reach).
