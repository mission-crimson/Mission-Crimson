# 🚀 MISSION:CRIMSON

A browser game for kids aged 7–12: no account, no install.
You are an astronaut stranded on Mars. Find the 6 pieces of your spaceship, keep your oxygen, energy and health alive, get past the Martian traps by answering yes/no questions, take shelter from real solar storms, and fly back to Earth.

## How to play

| Key | Action |
|---|---|
| ← ↑ → ↓ or W A S D | Move |
| Shift | Run (uses twice the oxygen) |
| E | Scanner: points to the nearest piece (−10 ⚡) |
| Space | Base menu / launch the ship |
| Y / N | Yes / No |
| P | Pause |

On tablets and phones, on-screen buttons appear.

## Rules in short

- **🫁 Oxygen** runs out outside the base. You can make more at the base, but it **costs energy** (like MOXIE on Perseverance).
- **⚡ Energy** charges at the base **only in daylight**. It is needed for the scanner, for oxygen and for disarming traps.
- **❤️ Health** drops with wrong answers and radiation. Resting at the base restores it, but time passes.
- **👾 Martian traps** ask a yes/no question. A correct answer costs −10 ⚡ to disarm the trap. A wrong answer costs oxygen, energy or health and brings the 👽 Martian one step closer.
- **🔧 Spaceship parts** also ask a yes/no question. A correct answer costs −5 ⚡ to collect the part and pushes the Martian back one step.
- **👽 The Martian** has 5 steps. If it catches you, you return to the base and lose one collected part. Three correct answers in a row push it back one step.
- **Mission failed**: if oxygen or health reaches zero, the mission ends.
- **☀️ Solar storms** are real events from NASA DONKI. You have a few seconds to get into the base or a cave.
- **Sol**: one day on Mars (24 hours and 40 minutes), 3 minutes in the game. Solar panels don't charge at night.
- Every game has a **new map**: regions, pieces, traps and storms change.

## NASA data

| Dataset | How it is used |
|---|---|
| [NASA DONKI](https://kauai.ccmc.gsfc.nasa.gov/DONKI/) (Space Weather Database) | The game's solar storms are real archived events (flares, CMEs, particle storms). |
| [NASA Open APIs](https://api.nasa.gov/): DONKI FLR | When online, the game fetches the strongest solar flare of the last 30 days live and puts it in the game. Offline, it uses only archived events and says so on screen. |
| [Curiosity RAD: May 2024 solar storm](https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm) | 8,100 micrograys on May 20, 2024 (≈30 chest X-rays), compared with ≈210 on a normal day. |
| [NASA Mars Exploration](https://science.nasa.gov/mars/) | Gravity (38%), sol length, temperature, atmosphere, water/ice, moons, Olympus Mons, Valles Marineris. |
| [Perseverance: MOXIE](https://science.nasa.gov/mission/mars-2020-perseverance/) | Oxygen from CO₂ using electricity: that is why oxygen costs energy. |
| [Opportunity](https://science.nasa.gov/mission/mer-opportunity/) & InSight | Dust storms and dust on solar panels: energy on Mars is never guaranteed. |
| [NASA OSDR](https://osdr.nasa.gov/) | Astronaut health (bone, muscle) and plants in space. |

The Earth–Mars communication delay for each storm is estimated from the positions of the two planets on the date of the event.
