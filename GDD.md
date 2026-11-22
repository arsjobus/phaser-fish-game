# Fish Food — Game Design Document

> **Document purpose:** A design-level reconstruction of a Flash game!* This document describes the original classic-style game, not later remakes or the later level-based variant.
>
> **Evidence note:** Core rules, controls, presentation, and the existence of a real ending are documented by primary or contemporary sources. Exact numeric growth formulas, spawn distributions, fish speeds, collision radii, score increments, and timing constants are not published in the sources reviewed. Those are deliberately specified as unknown rather than fabricated. Where this GDD proposes implementation detail, it is labelled as a reconstruction or recommendation.

## 1. Game overview

| Field             | Description                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Title             | Fish Food                                                                                               |
| Genre             | Single-player arcade survival / skill-collect                                                            |
| Perspective       | Side-on, 2D aquatic playfield                                                                            |
| Core fantasy      | Begin as a tiny fish in a pond and grow into the dominant creature by eating everything smaller than you |
| Session structure | Continuous, score-driven survival run with a definitive completion ending                                |
| Input             | Keyboard arrow keys                                                                                      |
| Primary objective | Eat smaller fish, avoid larger fish, grow, and ultimately consume the pond's fish population             |

*Fish Food* is an extremely compact arcade game built around a readable food-chain rule: **eat smaller fish; do not touch bigger fish**. The player starts as a small orange fish among fish of many sizes. Every successful meal increases the player's size and score, changing which other fish are edible. The same growth that makes more prey available also makes the player larger and potentially harder to manoeuvre around threats.

There are no levels to select, equipment systems, upgrades, dialogue, quests, or complex menus in the classic presentation. The central experience is the moment-to-moment decision of whether to pursue a meal, wait for a safer opening, or evade a predator.

## 2. Design pillars

1. **One rule understood immediately.** Relative size determines who eats whom; the game communicates its premise without a lengthy tutorial.
2. **Growth changes the world.** The player does not acquire new abilities. Instead, the same pond becomes progressively less dangerous as the player's size changes the food-chain relationships.
3. **Risk is always visible.** Fish are visible moving through the playfield, and their relative sizes communicate danger and opportunity.
4. **Simple controls, demanding movement.** Four-directional swimming is easy to understand, but acceleration, deceleration, and inertia make precise evasion a skill.
5. **A complete arcade run.** A run can end in failure, but the original game also has a real victory ending rather than an endless score loop alone.
6. **Minimal presentation.** A single aquatic environment, simple fish art, a short music loop, and a small set of sound effects keep attention on movement and size relationships.

## 3. Player experience and intended audience

The intended experience is immediately approachable, lightly humorous, tense during the early game, and increasingly empowering as the player grows. Early play is primarily evasive: the player is prey to much of the pond. Mid-game play becomes a balance of hunting and threat assessment. Late play can become a feeding frenzy as more and more fish fall below the player's size.

The game suits short casual sessions and replay-driven high-score chasing. Its challenge comes from reading moving traffic and managing momentum, not from learning a large ruleset.

## 4. Core gameplay loop

1. Observe fish entering and crossing the pond.
2. Compare their sizes with the player's fish.
3. Identify a fish that is smaller than the player.
4. Swim into it while avoiding fish larger than the player.
5. On a successful collision, consume the smaller fish.
6. Increase the player's size and score; update the number of fish eaten.
7. Re-evaluate which fish are now prey and which remain threats.
8. Continue until the player is eaten or reaches the game's completion condition.

This loop repeats continuously. There are no discrete combat encounters; the pond itself is the encounter.

## 5. Controls and movement

### 5.1 Keyboard controls

| Input | Action |
|---|---|
| Up Arrow | Swim upward |
| Down Arrow | Swim downward |
| Left Arrow | Swim left |
| Right Arrow | Swim right |

No separate attack, bite, or eat button is required. Eating is automatic when the player collides with an eligible smaller fish. The reviewed original descriptions identify arrow-key movement; no native gamepad support is documented for the original Newgrounds build.

### 5.2 Movement model

Contemporary descriptions report inertia and resistance: the fish takes time to accelerate to full speed, and it slows down and eventually stops after input is released. This means the player cannot instantly change direction or halt. Momentum is part of the challenge, particularly when a large fish approaches.

A faithful implementation should therefore avoid instantaneous, grid-like movement. The fish should accelerate in the direction of input, retain some velocity when input is released, and decelerate through water resistance. Opposite-direction input should counter existing momentum rather than teleport the fish to a new heading.

**Unknown original values:** acceleration, maximum speed, drag/deceleration, diagonal normalization, and whether movement parameters change with player size have not been verified from source code.

### 5.3 Playfield boundaries

The pond is a bounded rectangular screen. Contemporary descriptions of the classic game report horizontal wraparound: leaving the left edge causes the fish to reappear at the right edge, and vice versa. Vertical movement remains constrained by the top and bottom of the playfield; no vertical wraparound is documented.

## 6. The food-chain rules

### 6.1 Relative-size rule

- If the player touches a fish smaller than the player, the player eats it.
- If the player touches a fish larger than the player, the player is eaten and the run ends.
- The relative-size relationship is the primary interaction rule. The direction a fish faces and which part of its body is touched do not appear to matter; collision is based on overlap/contact.
- Fish that are not smaller than the player are unsafe to touch. The original sources describe smaller-versus-bigger relationships; exact equality handling is not specified.

### 6.2 Consumption

Eating is automatic on contact. There is no aiming, projectile, bite animation, or separate attack action documented. Contemporary descriptions note that the original has no dedicated fish-eating animation: the smaller fish disappears as the collision resolves.

A short wet/burp-like sound effect accompanies successful eating. The player visibly grows after consuming prey.

### 6.3 Growth

The player grows after eating smaller fish. Growth is the main progression mechanic and changes the set of fish the player can consume. Fish in the pond do not need to grow in response; the player becomes capable of eating fish that were previously too large.

The player's fish remains recognizably the same player fish as it scales up. The game does not appear to use a series of unlockable fish characters or a branching evolution tree.

**Unknown original values:** the exact size increment per meal, whether growth is proportional to prey size, any maximum size, and the exact threshold at which each visual fish size becomes edible are not established by the available documentation.

### 6.4 Death and restart

Touching any fish larger than the player ends the run immediately. The classic game has no health bar, damage accumulation, extra lives, or continue system documented by contemporary reviews. The failure state leads to a score/high-score presentation and an opportunity to play again.

## 7. Fish population and spawning

Fish populate the pond in multiple sizes and colours. They enter from the left and right edges and travel horizontally across the screen. Their movement creates a stream of moving opportunities and hazards that the player must read and navigate.

The fish are not described as intelligent pursuers. Their primary behaviour is to swim across the playfield, with the danger they pose determined by size and collision.

### 7.1 Size classes

The game uses a range of fish sizes rather than a single uniform enemy. Small fish are edible early; medium fish become edible as the player grows; the largest fish remain lethal until the player reaches a sufficient size. The artwork uses different colours and scales of a common basic fish design to distinguish individuals and size.

The available sources do not establish a definitive named taxonomy or exact number of size tiers. Any implementation should treat size as a continuous or tiered gameplay value and derive the eatability comparison from that value.

### 7.2 Spawn and movement characteristics

Documented behaviour:

- Fish appear from both horizontal edges of the screen.
- Fish travel horizontally through the pond.
- Fish vary in size and therefore in threat/prey status.
- The mix of fish creates a changing, partly unpredictable survival challenge.

Not verified:

- Exact spawn intervals and maximum population.
- Probability distribution of sizes.
- Whether spawn rates or size distributions change over time or player growth.
- Whether fish move at different speeds based on size.
- Whether fish can reverse direction after entering.
- Whether the game uses explicit fairness checks to prevent impossible spawn patterns.

A contemporary review reports that fish traffic can sometimes form dense, difficult-to-evade arrangements. This suggests that the original experience allows substantial randomness and does not guarantee a safe route through every wave.

## 8. Scoring and progression

The game tracks score and the total number of fish eaten. Eating fish increases the player's score, and the displayed eaten count communicates progress through the pond. The original update notes explicitly state that a high-score feature was added in the February 21, 2003 update.

The score is therefore both a performance measure and a replay incentive. The game does not require the player to complete a sequence of missions or earn currency.

**Unknown original values:** exact score awarded per fish, whether score depends on prey size, whether the score is identical to a growth variable, score formatting, and persistence/storage details of the high-score table.

### 8.1 Progression phases (descriptive, not formal levels)

| Phase | Player state | Typical experience |
|---|---|---|
| Early | Very small | Most fish are dangerous; hunt only the smallest prey and prioritize evasion |
| Developing | Larger than the starting fish | More prey becomes available; the player can take calculated risks |
| Mid-game | Medium-sized | A growing share of the pond becomes edible; successful hunting becomes easier |
| Late | Very large | Many or most fish can be eaten; the player can move more aggressively through the pond |
| Completion | Dominant / sufficiently large | The player consumes the remaining pond population and receives the game's ending |

These phases describe the natural change in play, not a documented level-selection system. A later XGen version was described as adding levels, but that is not the classic continuous version specified here.

## 9. Win condition and ending

The original game has a real ending. The creator's February 21, 2003 update explicitly announces that an ending was added. Contemporary player reports describe the completion message as:

> You ate everything and completely destroyed the pond eco-system.

The ending is reached after the player grows sufficiently large and consumes the pond's remaining fish. It is a deliberately comic payoff: the player's survival and growth culminate in the destruction of the ecosystem that sustained the run.

The precise internal completion trigger and whether it is based on eating every spawned fish, reaching a size threshold, reaching a score threshold, or a combination are not confirmed by the sources reviewed. The observed/reported end message should be treated as the canonical outcome; the exact implementation condition remains unknown.

## 10. Game modes and menus

The documented original experience is a single-player arcade run. The game includes a title screen and a gameplay screen, followed by a failure/high-score flow or a victory ending.

The original update notes establish a high-score feature. The sources reviewed do not establish multiplayer, selectable difficulty, separate campaigns, custom settings, or a level select in the classic build.

### Expected screen flow

1. **Title screen:** displays the *! Fish Food !* title and begins the game.
2. **Gameplay:** the pond, player fish, other fish, score/progress indicators, and sound controls are presented.
3. **Game over:** reached when a larger fish eats the player; score/high-score handling is available.
4. **Victory ending:** reached when the player completes the food-chain progression and consumes the pond population.
5. **Replay:** allows another run.

The exact wording and layout of all menu buttons and end-state controls should be checked against the SWF during implementation; not all screen copy is captured in the archived text record.

## 11. HUD and interface

The archived gameplay screenshot shows a minimal HUD over the playfield:

- A numeric score is displayed prominently near the top centre.
- A small row of fish icons appears at the top left, serving as a progress/eaten indicator in the captured frame.
- The aquatic playfield fills the remainder of the screen.
- Small sound-related controls/icons appear in the lower-left corner in the captured gameplay image.

The game prioritizes visibility of fish and their relative sizes. HUD elements are sparse and do not obscure the playfield.

**Visual evidence:** the Internet Archive gameplay screenshot (`00_B.png`) shows a blue water background, a sandy bottom, aquatic plants, fish in multiple sizes/colours, a score of `180` at the top centre, and small HUD icons. The title screenshot (`00_A.png`) shows the hand-drawn-style *! FISHY !* wordmark against a blue background.

## 12. Art direction and visual presentation

### 12.1 Overall style

The game uses simple, colourful 2D cartoon artwork with a deliberately uncluttered composition. The pond is shown side-on. The water is a bright blue gradient, with a sandy brown floor and sparse seaweed/aquatic plants. Fish are stylized, horizontally oriented creatures with expressive eyes and simple fin details.

### 12.2 Fish design

- A common basic fish silhouette is reused across the population.
- Fish are differentiated primarily through scale and colour.
- The player begins as a small orange/red fish; the player remains visually identifiable as it grows.
- Other fish include blue, purple, orange, and other colour variations in the archived gameplay image.
- The fish are visually legible against the water background.

The use of a shared base design keeps production scope small and makes relative size immediately readable.

### 12.3 Environment

The game takes place in one pond/aquarium-like underwater scene. The environment includes:

- Blue water background with a subtle gradient.
- Sandy bottom along the lower edge.
- Sparse green aquatic plants/seaweed.
- No complex parallax, destructible scenery, or interactive environmental objects documented.

The scenery provides context and visual charm but does not appear to affect the core food-chain rules.

### 12.4 Animation and effects

Fish swim horizontally. The original presentation is intentionally restrained: contemporary documentation notes no special eating animation and no underwater particle effects such as ripples or bubbles. The disappearance of an eaten fish and the player's size increase carry the feedback.

Exact swim-cycle frames, animation timing, and player growth tweening are not documented.

## 13. Audio direction

The original uses:

- A single short music loop that plays throughout the game.
- A small set of sound effects.
- A distinctive wet/burp-like sound when the player eats a fish.
- Sound controls/icons visible in the gameplay screenshot.

The music is repetitive by design and contributes to the light, playful arcade tone. Audio is supportive rather than cinematic; there is no evidence of a large adaptive soundtrack or location-specific music system.

Exact track duration, instruments, sound file formats, and the full sound-effect inventory are not established by the available sources.

## 14. Difficulty and balance

Difficulty comes from three interacting factors:

1. **Relative size:** the player must distinguish safe prey from lethal threats.
2. **Movement inertia:** momentum makes last-second avoidance difficult and rewards anticipation.
3. **Traffic uncertainty:** fish enter from both sides, and their size and timing create changing situations.

The early game is the most vulnerable period because the player is smaller than much of the population. Growth gradually reverses the balance. However, the player must still avoid fish larger than itself until the final stage.

The player's increasing size also increases its collision footprint, which can make tight evasion more difficult even as more fish become edible. This creates a useful tension: growth increases power but can reduce available manoeuvring space.

A faithful recreation should preserve meaningful risk in the early game and a satisfying power curve toward the ending. It should not make the player invulnerable merely because the run has become long; the original rule remains size-based until the completion condition.

## 15. Game over, replayability, and retention

A run ends abruptly when the player touches a larger fish. The player is encouraged to try again and improve the score. The high-score feature gives the otherwise simple survival loop a persistent competitive objective.

Replayability comes from:

- Different sequences of fish sizes and movement.
- The changing opportunities created by player growth.
- The challenge of surviving the vulnerable early game.
- Score chasing and high-score comparison.
- The goal of reaching the rare/longer-term completion ending.

No account, online service, unlock tree, or live content is required by the documented core game.

## 16. Technical and production profile

| Area | Original profile |
|---|---|
| Runtime | Adobe Flash / SWF |
| Distribution | Browser game, originally uploaded to Newgrounds; archived by Internet Archive |
| Input | Keyboard arrows |
| Rendering | 2D side-on sprites and a static/simple aquatic background |
| Audio | Looping background music plus sound effects |
| Player count | Single-player |
| Network dependency | None documented for the core run; high-score submission/storage details are not verified |
| Save data | High-score feature documented; exact storage mechanism unknown |

The Internet Archive item identifies the creator as XGen Studios, the publication date as 2003-02-02, and the emulator as Ruffle SWF. The archived item is approximately 353 KB.

## 17. Feature inventory

| Feature | Status in classic game | Notes |
|---|---|---|
| Player-controlled fish | Confirmed | Arrow-key movement |
| Inertial swimming | Confirmed by contemporary review | Acceleration and water resistance |
| Horizontal screen wrap | Confirmed by contemporary review | Left/right edges connect |
| Fish entering from both sides | Confirmed | Horizontal movement across pond |
| Variable fish sizes | Confirmed | Determines prey/threat relationship |
| Eat smaller fish on contact | Confirmed | Automatic collision-based consumption |
| Die on contact with larger fish | Confirmed | Immediate game over |
| Player growth | Confirmed | Growth follows eating |
| Score display | Confirmed | Numeric score visible in archived screenshot |
| Fish-eaten counter/indicator | Confirmed | Creator/wiki descriptions and screenshot indicator |
| High scores | Confirmed | Added in 2003-02-21 update |
| Background music loop | Confirmed | One short loop throughout |
| Eating sound effect | Confirmed | Wet/burp-like sound |
| Victory ending | Confirmed | Added in 2003-02-21 update |
| Multiple levels in classic build | Not established | Later variant reportedly introduced levels; excluded here |
| Multiplayer | Not documented | Treat as absent unless direct build inspection proves otherwise |
| Power-ups / weapons | Not documented | Not part of the described core design |

## 18. Reconstruction notes for a faithful remake

This section is implementation guidance, not a claim about the original source code.

### 18.1 Minimum viable faithful recreation

- One fixed-size 2D pond playfield.
- One player fish controlled with the four arrow keys.
- Inertial movement with acceleration and drag.
- Horizontal screen wrap.
- AI-independent fish that spawn at either horizontal edge and swim across the screen.
- Multiple fish sizes and colours.
- Collision-based size comparison: smaller fish are eaten; larger fish kill the player.
- Player size growth after eating.
- Score and eaten-count HUD.
- One looping music track and a few sound effects.
- Game-over/high-score/replay flow.
- A true completion condition and the ecological-destruction ending.

### 18.2 Suggested data model

A fish entity should minimally contain:

- Position (`x`, `y`).
- Velocity (`vx`, `vy`) or horizontal velocity for non-player fish.
- Size/radius or a comparable collision-size value.
- Direction/facing.
- Visual colour/variant.
- Player/non-player identity.

The player additionally needs score, eaten count, and run state. A fish entity should not need a unique behavioural state machine unless later observation of the SWF demonstrates one.

### 18.3 Suggested collision model

Use a simple overlap test based on fish body bounds or a circular/elliptical approximation. On player/non-player contact:

- If the player is larger, remove the non-player fish, increase player growth and score, and increment the eaten count.
- If the non-player fish is larger, transition to game over.
- If sizes are equal, choose and document a deterministic rule after direct verification; do not silently assume equality is safe.

The original is described as resolving contact by relative size, not by facing direction or a precise bite point.

### 18.4 Tuning priorities

Tune in this order:

1. Player acceleration, top speed, and drag until swimming feels weighty but controllable.
2. Fish speed and size distribution until early survival requires observation and restraint.
3. Growth increments until the player visibly progresses at a satisfying rate.
4. Spawn density and edge-entry timing until the pond feels alive without becoming visually unreadable.
5. Endgame condition so a skilled run reaches a clear, satisfying conclusion.

Because original numeric constants are unavailable, these should be treated as tunable parameters and calibrated by playing against the archived game.

## 19. Acceptance criteria for a faithful implementation

- The player can move in four directions with the arrow keys.
- Movement has perceptible acceleration and deceleration rather than instant directional snapping.
- The player wraps from one horizontal edge to the other.
- Fish enter from both sides and travel horizontally through the pond.
- Fish sizes are visually distinguishable.
- Contact with a smaller fish consumes it and grows the player.
- Contact with a larger fish ends the run.
- The score and eaten progress are visible during play.
- The game has a looping music track and eating feedback sound.
- A failed run exposes the score and allows replay.
- A successful run can reach a distinct victory ending rather than continuing indefinitely.
- The screen remains visually uncluttered, with the fish and their relative sizes as the dominant information.

## 20. Unverified details / questions for direct SWF playtesting

The following should be recorded from a live run before claiming a frame-accurate or formula-accurate remake:

- Exact title-screen instructions and start interaction.
- Exact HUD labels and whether the fish icons represent lives, fish eaten, or another progress measure in every version.
- Exact score formula and eaten-count behaviour.
- Growth amount per prey and whether prey size affects growth.
- Equality collision rule.
- Fish spawn interval, population cap, size distribution, and speed distribution.
- Whether the spawn system changes as the player's size increases.
- Player acceleration, drag, maximum speed, and size-related movement changes.
- Whether top/bottom boundaries clamp, bounce, or use another behaviour.
- Exact game-over and high-score submission interface.
- Exact victory trigger and end-screen sequence.
- Full audio inventory and music-loop length.
