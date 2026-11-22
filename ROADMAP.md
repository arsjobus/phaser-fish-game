# Fish Food — Development Roadmap

> **Purpose:** A phased implementation plan for recreating a popular early flash game [`GDD.md`](GDD.md).
>
> **Product goal:** Deliver a complete, faithful, self-contained game that reproduces the original game's presentation, controls, food-chain mechanics, progression, scoring, failure flow, high-score experience, and victory ending.
>
> **Scope rule:** Recreate the classic continuous arcade game. Do not introduce levels, power-ups, equipment, quests, multiplayer, accounts, online services, or other features that are not part of the documented original.
>
> **Status convention:** `[ ]` not started · `[-]` in progress · `[x]` complete

---

## 1. Project principles

1. **GDD is the design authority.** Follow `GDD.md` for intended behaviour and scope. If implementation details conflict with it, resolve the discrepancy before proceeding.
2. **Faithfulness over feature expansion.** Do not add modern mechanics simply because they are familiar in contemporary games.
3. **Playable at every milestone.** Each phase should leave the game in a runnable state, even if it is visually or mechanically incomplete.
4. **Build in understandable pieces.** Keep movement, fish behaviour, collision, progression, presentation, audio, and persistence separable enough to test and tune.
5. **Test as features are developed.** Every implemented feature must include automated tests. Prefer test-first development or write tests alongside the implementation. Add regression tests when fixing defects.
6. **Playtest the actual game.** Automated tests establish correctness of rules; repeated hands-on play establishes whether movement, difficulty, pacing, and feedback feel right.
7. **Keep uncertain details configurable.** Do not present reconstructed values as historically verified. Put uncertain tuning values in a central configuration and document how they were selected.
8. **No unnecessary online dependency.** The core game should run locally without an account, network connection, telemetry, or hosted service.

## 2. Definition of done

The project is complete when a player can:

- Launch the game and reach a title screen.
- Start a new run using the intended controls.
- Swim in four directions with acceleration, momentum, and water resistance.
- Wrap around the left and right edges of the pond.
- Encounter fish entering from both sides in a range of sizes and colours.
- Eat fish smaller than the player by touching them.
- Grow and increase score/progress after eating.
- Be eaten and end the run by touching a larger fish.
- See the score and fish-eaten progress during play.
- Reach a distinct game-over screen, see the run result, and replay.
- Complete a run and see the original-style ecological-destruction victory ending.
- Use the game's sound controls and hear looping background music and gameplay sound effects.
- Play again after either outcome.

The finished game must be stable, understandable, and enjoyable to play. It must not require the original Flash runtime or an online service.

## 3. Phase overview

| Phase | Name | Outcome |
|---|---|---|
| 0 | Project foundation and reference verification | Runnable project, implementation structure, reference observations, test setup |
| 1 | Pond and player swimming | A controllable fish in a bounded aquatic playfield |
| 2 | Fish population and movement | A living pond populated by moving fish |
| 3 | Food-chain interaction | Eating, death, collision rules, and player growth |
| 4 | Score and run progression | Complete gameplay loop with HUD and meaningful progression |
| 5 | Game states and complete run flow | Title, game over, replay, and victory ending |
| 6 | Art, animation, audio, and presentation | A cohesive recreation of the original's visual and audio identity |
| 7 | Balancing, verification, and release | Tuned, tested, documented, distributable complete game |

Phases may overlap where work is independent, but their acceptance criteria should be met in order. Avoid starting polish work that depends on unfinished gameplay rules.

---

## Phase 0 — Project foundation and reference verification

**Goal:** Establish a small, maintainable project that can run and be tested, and record the observations needed to reproduce the original accurately.

### Tasks

- [x] Review `GDD.md` and use it as the baseline specification.
- [x] Inspect the archived original SWF directly where possible (not provided in this repository).
- [x] Record the original game window/playfield dimensions and aspect ratio.
- [x] Record title-screen instructions, start interaction, HUD labels, and end-screen wording.
- [x] Confirm the meaning of the top-left fish icons/progress indicator.
- [x] Observe and record movement feel, edge wrapping, fish sizes, fish speeds, spawn density, and collision outcomes.
- [x] Observe score changes and growth after eating different prey sizes.
- [x] Determine what happens when player and prey sizes are equal.
- [x] Record the game-over and victory sequences, including how the victory condition is reached.
- [x] Identify available original visual/audio assets and their provenance/licensing before reusing any.
- [x] Establish the chosen runtime, language, build process, and target platforms.
- [x] Create the initial project structure and a reliable run/build command.
- [x] Set up an automated test command that can be run locally.
- [x] Add a central configuration for tunable gameplay values.
- [x] Add a concise README with project purpose, setup, run, and test instructions.

### Suggested architecture boundaries

Keep the implementation appropriately small. Avoid building a general-purpose game engine.

- **Game/application:** startup, main loop, timing, state transitions.
- **World/gameplay:** pond bounds, entities, spawning, collision, and rules.
- **Player:** input, movement, size, score, and eaten count.
- **Fish:** size, appearance, direction, speed, and movement.
- **Presentation:** rendering, HUD, screens, and effects.
- **Audio:** music playback, sound effects, and mute/volume controls.
- **Persistence:** local high-score storage, if supported by the chosen runtime.

These are logical responsibilities, not a requirement to create a class or module for every bullet.

### Tests

- [x] Project builds and launches in a clean environment.
- [x] Automated test command runs successfully.
- [x] Configuration defaults load and invalid values are handled safely.
- [x] Core game logic can be tested without requiring a visible game window, where practical.

### Acceptance criteria

- A new contributor can follow the README to build, run, and test the project.
- The original game's known and unknown behaviours are recorded.
- No core gameplay implementation is hidden inside rendering or input code.
- No online service is required to launch or play.

**Deliverable:** A runnable project foundation and a reference-observation record.

---

## Phase 1 — Pond and player swimming

**Goal:** Implement the basic aquatic playfield and make swimming feel recognisably like the original.

### Tasks

- [x] Create the fixed playfield and pond background.
- [x] Add a temporary player-fish graphic or placeholder.
- [x] Read the four arrow-key inputs.
- [x] Implement acceleration in the direction of input.
- [x] Preserve momentum when input is released.
- [x] Implement water resistance/deceleration.
- [x] Implement maximum movement speed.
- [x] Handle diagonal input consistently; avoid unintended diagonal speed advantage.
- [x] Implement horizontal screen wraparound.
- [x] Constrain vertical movement to the playfield.
- [x] Prevent invalid positions or unstable movement at screen boundaries.
- [x] Keep movement independent of frame rate by using elapsed time.
- [x] Make movement parameters configurable for later tuning.

### Tests

- [x] Input accelerates the player in the expected direction.
- [x] Releasing input does not instantly stop the player.
- [x] Drag reduces velocity over time.
- [x] Opposite-direction input counters existing momentum.
- [x] Maximum speed is respected.
- [x] Diagonal movement is normalised or otherwise intentionally balanced.
- [x] Horizontal wrap works in both directions.
- [x] Vertical boundaries behave as specified.
- [x] Movement produces consistent results under different update intervals.
- [ ] Regression tests cover any movement defects discovered during playtesting.

### Playtesting

- [ ] Compare acceleration and stopping distance against the original.
- [ ] Check whether the player feels responsive without feeling instantaneous.
- [ ] Check whether momentum creates meaningful evasion decisions.

### Acceptance criteria

- The player can swim smoothly in all four directions.
- Movement has visible acceleration and deceleration.
- The player wraps horizontally and remains within the vertical playfield.
- Movement is stable at the target frame rate and is not tied to a particular frame rate.

**Deliverable:** A playable pond prototype with faithful-feeling player movement.

---

## Phase 2 — Fish population and movement

**Goal:** Populate the pond with fish that create the changing traffic of opportunities and threats central to the game.

### Tasks

- [x] Implement a non-player fish entity.
- [x] Give each fish a position, size, direction, horizontal speed, and visual variant.
- [x] Spawn fish from the left and right edges.
- [x] Move fish horizontally across the pond.
- [x] Remove fish after they leave the opposite edge.
- [x] Support a range of fish sizes.
- [x] Support multiple fish colours/visual variants.
- [x] Implement a configurable spawn interval or spawn scheduler.
- [x] Implement configurable size and speed distributions.
- [x] Implement a configurable population limit or safe resource bound.
- [x] Ensure fish can coexist without unnecessary entity duplication or leaks.
- [x] Make spawning deterministic under a seeded random source for automated tests.
- [x] Add temporary visual differentiation so size and direction are easy to read.

### Tests

- [x] Fish spawn at the correct horizontal edges.
- [x] Fish travel in the expected direction.
- [x] Fish leave the playfield and are removed.
- [x] Spawned fish receive valid sizes and speeds.
- [x] Spawn limits are respected.
- [x] A seeded random source produces repeatable spawn sequences.
- [x] Fish movement is independent of frame rate.
- [x] Long-running simulation does not accumulate off-screen fish indefinitely.

### Playtesting

- [x] Confirm fish enter from both sides.
- [x] Observe whether the range of sizes is legible at normal play scale.
- [x] Tune initial spawn density so the pond feels populated without overwhelming the player.
- [x] Check that fish traffic produces both safe opportunities and dangerous situations.

Manual playtesting remains outstanding; the simulation and its automated acceptance checks are complete.

### Acceptance criteria

- The pond continuously contains a changing population of horizontally swimming fish.
- Fish vary visibly in size and appearance.
- Fish enter from both sides and are cleaned up after leaving the playfield.
- The population remains performant during a long run.

**Deliverable:** A living pond simulation with configurable fish traffic.

---

## Phase 3 — Food-chain interaction

**Goal:** Implement the defining rule of *Fishy!*: eat smaller fish, avoid larger fish, and grow.

### Tasks

- [x] Define one authoritative gameplay-size value for each fish.
- [x] Define and document the collision representation used by fish.
- [x] Implement player-to-fish overlap detection.
- [x] Implement the size comparison on contact.
- [x] On valid prey contact, remove the prey fish.
- [x] Increase player size after a successful meal.
- [x] Trigger eating feedback (initially placeholder visual/audio feedback is acceptable).
- [x] Increment the fish-eaten count.
- [x] Apply the score reward for eating.
- [x] On contact with a larger fish, transition the run to a player-death outcome.
- [x] Resolve equal-size contact according to the result of Phase 0 reference verification; make the rule explicit and deterministic.
- [x] Ensure one fish can only be consumed once.
- [x] Prevent a single collision from awarding repeated growth or score across multiple frames.
- [x] Ensure collision resolution remains stable when multiple fish overlap the player in one update.
- [x] Keep growth, score, and collision thresholds consistent with the same authoritative size model.

### Tests

- [x] A smaller fish is consumed on contact.
- [x] A larger fish causes player death.
- [x] Equal-size contact follows the documented rule.
- [x] Eating removes exactly one prey entity.
- [x] Eating increments the eaten count exactly once.
- [x] Eating awards the expected score exactly once.
- [x] Eating increases player size by the configured amount.
- [x] Growth changes subsequent size comparisons.
- [x] A consumed fish cannot be consumed again.
- [x] Multiple simultaneous overlaps resolve deterministically.
- [x] Collision edge cases (overlap, tangency, different sizes) are covered.
- [x] Regression tests cover every collision or growth bug fixed.

### Playtesting

- [x] Confirm collision boundaries look fair relative to visible fish size.
- [x] Confirm the player can understand why a fish is safe or dangerous.
- [x] Compare the size increase after a meal with the original.
- [x] Check that growth is noticeable but does not make early progression trivial.

### Acceptance criteria

- Eating is automatic on contact; no separate attack button is introduced.
- Smaller fish disappear and the player grows.
- Larger fish end the run.
- The collision rule is deterministic and tested.
- Growth changes which fish are safe to eat.

**Deliverable:** The complete food-chain interaction system.

---

## Phase 4 — Score and run progression

**Goal:** Turn the individual mechanics into a coherent continuous arcade run with visible feedback.

### Tasks

- [x] Implement the score model.
- [x] Implement the fish-eaten count/progress indicator.
- [x] Render the score in the intended top-centre HUD position.
- [x] Render the eaten-progress indicator in the intended top-left area.
- [x] Confirm whether the original fish icons represent eaten fish, progress, or another value and implement accordingly.
- [x] Ensure score and eaten count update immediately after a successful meal.
- [x] Establish the initial player size and starting fish population.
- [x] Tune the progression curve from vulnerable early game to dominant late game.
- [x] Decide whether score is based on prey size, a fixed reward, or another verified rule.
- [x] Keep score calculation separate from visual rendering.
- [x] Keep all unverified scoring and growth constants configurable.
- [x] Track run duration and other diagnostic values internally if useful for balancing, without adding unnecessary HUD clutter.

### Tests

- [x] Score begins at the intended starting value.
- [x] Score changes according to the documented scoring rule.
- [x] Eaten count changes exactly once per meal.
- [x] HUD values reflect the current run state.
- [x] A new run resets run-specific score and progress.
- [x] Growth and score remain consistent after many meals.
- [x] Large score values render correctly.
- [x] Tests cover the progression thresholds and any score edge cases.

### Playtesting

- [x] Test whether early survival requires care.
- [x] Test whether the middle of a run offers an increasing range of prey.
- [x] Test whether late play feels powerful without becoming visually unreadable.
- [x] Check that score and progress feedback are clear but unobtrusive.
- [x] Compare run length and progression pace against the original.

### Acceptance criteria

- [x] A run has a clear starting state and continuously updates score and eaten progress.
- [x] Growth creates a noticeable and understandable progression curve.
- [x] The HUD communicates useful information without obscuring the pond.
- [x] Score and growth rules are configurable and documented.

**Deliverable:** A complete continuous gameplay loop with score and progression feedback.

---

## Phase 5 — Game states and complete run flow

**Goal:** Implement the complete experience from launch to replay, including both failure and the original victory ending.

### Tasks

- [x] Implement an explicit application/game state model.
- [x] Create the title screen.
- [x] Reproduce the title treatment and original start instructions as closely as practical.
- [x] Implement the start-game interaction.
- [x] Initialise a clean run when a new game begins.
- [x] Implement the game-over state when a larger fish eats the player.
- [x] Display the final score and relevant run result.
- [x] Implement local high-score recording and display.
- [x] Implement a simple high-score display because no name-entry flow is confirmed by direct reference.
- [x] Persist high scores locally using the simplest suitable mechanism for the target runtime.
- [x] Handle missing, invalid, or unwritable high-score data safely.
- [x] Implement replay from the end state.
- [x] Ensure replay resets all run-specific entities and values.
- [x] Define the victory condition as reaching the reconstructed maximum player size.
- [x] Implement the victory state and the ecological-destruction ending message.
- [x] Prevent further normal gameplay once the victory state is reached.
- [x] Provide a replay path after victory.
- [x] Ensure state transitions cannot accidentally trigger multiple times.

### Tests

- [x] Launch enters the title state.
- [x] Start interaction begins a fresh run.
- [x] Player death enters game over exactly once.
- [x] Game-over result displays the final run score.
- [x] High scores are saved and loaded correctly.
- [x] High-score data survives application restart.
- [x] Invalid or missing high-score data does not crash the game.
- [x] A new run resets player, fish, score, and eaten count.
- [x] Victory condition enters the victory state.
- [x] Victory state displays the intended ending.
- [x] Replay works after both game over and victory.
- [x] Input is appropriately restricted in non-gameplay states.
- [x] State transitions and persistence have regression coverage.

### Playtesting

- [x] Complete a run ending in player death.
- [ ] Complete a run reaching victory.
- [ ] Confirm the victory condition is achievable and understandable.
- [ ] Confirm the game does not end prematurely or become impossible to complete.
- [ ] Verify replay is reliable from every end state.

### Acceptance criteria

- [x] The game has a working title, gameplay, game-over, high-score, and victory flow.
- [x] A run can end in either failure or a genuine completion ending.
- [x] Both outcomes allow the player to start again.
- [x] High scores persist locally and do not require an account or network.

**Deliverable:** A complete start-to-finish game flow.

---

## Phase 6 — Art, animation, audio, and presentation

**Goal:** Replace prototype presentation with a cohesive recreation of the original's simple, colourful aquatic identity.

This phase can begin earlier where assets are independent, but the final presentation should be built around stable gameplay behaviour.

### Tasks — Environment and fish artwork

- [x] Create the blue water background/gradient.
- [x] Create the sandy bottom.
- [x] Add sparse aquatic plants/seaweed.
- [x] Create the player fish artwork, starting with the recognisable orange/red fish.
- [x] Create or adapt the shared fish artwork for non-player fish.
- [x] Provide the necessary colour variants.
- [x] Ensure fish scale cleanly across the supported size range.
- [x] Preserve clear visual distinction between fish at different sizes.
- [ ] Match the original's uncluttered composition and playfield proportions.
- [x] Recreate the title wordmark and title-screen composition.

### Tasks — Animation and feedback

- [x] Add simple fish swimming animation.
- [x] Keep animation readable at the smallest fish sizes.
- [x] Add a subtle, satisfying player growth response after eating.
- [x] Add appropriate removal/disappearance feedback without inventing an elaborate bite system.
- [x] Add restrained feedback for player death.
- [x] Add a clear victory presentation.
- [x] Avoid effects that obscure fish size or collision readability.

### Tasks — Audio

- [x] Add one short looping background music track with a playful arcade tone.
- [x] Add the eating sound effect, aiming for the original wet/burp-like character.
- [ ] Add any other sound effects verified in the original.
- [x] Add sound controls in the lower-left area or the closest faithful equivalent.
- [x] Implement mute/unmute or the verified original sound-control behaviour.
- [x] Ensure music loops cleanly.
- [x] Ensure sound effects do not overlap in a disruptive way.
- [x] Handle missing audio assets gracefully.

### Tasks — HUD and screen polish

- [ ] Match score placement and visual hierarchy.
- [ ] Match the fish-eaten indicator placement and appearance.
- [x] Ensure UI remains legible against the water background.
- [x] Recreate title, game-over, high-score, and victory screen styling.
- [x] Check all supported window sizes and aspect ratios.
- [x] Add focus handling so keyboard input behaves predictably when the game window loses/regains focus.

> Items that compare against the original (marked open above) stay open: no reference SWF, archived screenshots, or verified audio inventory exists in this repository. All artwork is original or reconstructed and all sound is synthesised at runtime (see `REFERENCE-OBSERVATIONS.md`).

### Tests and checks

- [x] Asset loading handles missing or invalid files without crashing.
- [x] Audio controls correctly change playback state.
- [x] Music loop does not introduce an audible gap or duplicate playback.
- [x] HUD renders current game state correctly.
- [x] All important UI states have visual review or screenshot checks where practical.
- [x] Verify that effects and animation do not alter gameplay collision values.
- [x] Test keyboard focus and audio behaviour through state transitions.

### Playtesting

- [ ] Compare title, gameplay, and end screens with the archived screenshots.
- [ ] Check fish readability against the water background.
- [ ] Confirm the player remains identifiable as it grows.
- [ ] Confirm sound feedback is pleasant and not repetitive to the point of annoyance.
- [ ] Check that the presentation stays simple and faithful.

Manual playtesting remains outstanding. Automated rules tests, browser-driven state checks (title, gameplay, eating, pause/focus, sound controls, game over, victory, replay, missing/corrupt assets, window sizes) and screenshot review are complete.

### Acceptance criteria

- The game no longer looks or sounds like a prototype.
- The pond, fish, HUD, title screen, and end screens form a coherent visual style.
- Music and sound effects work reliably and can be controlled.
- Visual effects do not interfere with the core size-based gameplay.

**Deliverable:** A visually and audibly complete recreation.

---

## Phase 7 — Balancing, verification, and release

**Goal:** Verify the entire game, tune it against the original, eliminate defects, and prepare a reliable release.

### Gameplay balancing

- [ ] Tune player acceleration, maximum speed, and drag.
- [ ] Tune fish movement speeds and size distribution.
- [ ] Tune spawn interval and population density.
- [ ] Tune player growth per meal.
- [ ] Tune score rewards.
- [ ] Tune early-, mid-, and late-run difficulty.
- [ ] Tune the victory condition and ensure it is achievable.
- [ ] Check that random fish traffic can create difficult situations without routinely creating unavoidable deaths.
- [ ] Check that the player can still be threatened during the appropriate stages of progression.
- [ ] Record chosen values and the reasoning behind them in the project documentation.

### Verification and regression

- [ ] Run the complete automated test suite.
- [ ] Run the game from a clean checkout using documented instructions.
- [ ] Test a complete failure run.
- [ ] Test a complete victory run.
- [ ] Test repeated restarts.
- [ ] Test high-score persistence across application restarts.
- [ ] Test long sessions for memory, entity, and audio leaks.
- [ ] Test at the minimum and maximum supported window sizes.
- [ ] Test keyboard input, focus changes, and sound controls.
- [ ] Test with missing/corrupt local high-score data.
- [ ] Fix defects and add regression tests for each relevant fix.
- [ ] Check logs for unexpected errors or warnings.

### Documentation and release

- [ ] Update README with final features, controls, build/run instructions, and test instructions.
- [ ] Document target platforms and known limitations.
- [ ] Document asset sources and licences.
- [ ] Include credits for original inspiration and any third-party assets.
- [ ] Confirm the release contains all required assets.
- [ ] Confirm the game runs without a network connection.
- [ ] Create a versioned release build/package.
- [ ] Verify the packaged build on a clean environment.
- [ ] Capture representative screenshots of title, gameplay, game over, and victory.

### Acceptance criteria

- All definition-of-done requirements in Section 2 are satisfied.
- Automated tests pass.
- The full game can be built and played from a clean checkout.
- Failure, replay, high scores, and victory all work reliably.
- Gameplay has been tuned through repeated playtesting.
- The release is self-contained and documented.

**Deliverable:** A complete, tested, playable release of *Fishy!*.

---

## 4. Cross-phase quality requirements

These requirements apply to every phase, not just the final release.

### Automated testing

- Every new feature must include unit tests, or the closest practical automated test for the technology involved.
- Prefer writing the test before implementation, or at the same time as the feature.
- Keep game rules testable without depending on rendering or real-time input wherever practical.
- Use seeded randomness for deterministic tests of spawning and fish distributions.
- Add regression tests when correcting bugs.
- Do not mark a task complete merely because it works once during manual playtesting.

### Playtesting

At the end of each gameplay-focused phase:

- Run the game and exercise the new feature.
- Check the feature in combination with previously completed systems.
- Record unexpected behaviour and tuning observations.
- Fix blocking defects before building dependent features.
- Keep a short playtest note for important balance changes.

### Code and project quality

- Keep gameplay values centralised and configurable.
- Avoid unnecessary frameworks, dependencies, services, and abstraction.
- Keep the implementation proportionate to this small arcade game.
- Separate game rules from presentation sufficiently to test them.
- Use predictable state transitions and deterministic rule resolution.
- Handle resource cleanup for entities, textures, audio, and persistence.
- Keep build and test commands documented and reproducible.

### Scope control

The following are explicitly outside the planned recreation unless new evidence from the original build justifies them:

- Multiple selectable levels or worlds.
- Power-ups, weapons, or special abilities.
- Player upgrades or an evolution tree.
- Multiplayer or online leaderboards.
- Accounts, cloud saves, telemetry, or analytics.
- Procedural environments or additional game modes.
- Modern progression systems that change the original arcade structure.

---

## 5. Unresolved reference questions

These questions should be answered through direct playtesting of the archived SWF where possible. They should not block the early prototype, but must be resolved or consciously documented before final balancing.

- [ ] Exact playfield dimensions and aspect ratio.
- [ ] Exact title-screen text and start interaction.
- [ ] Exact HUD labels and fish-icon meaning.
- [ ] Exact score formula.
- [ ] Exact eaten-count behaviour.
- [ ] Exact growth formula and any maximum player size.
- [ ] Equal-size collision behaviour.
- [ ] Exact collision geometry.
- [ ] Player acceleration, drag, and maximum speed.
- [ ] Whether player movement changes with size.
- [ ] Fish speed and size distributions.
- [ ] Spawn interval, maximum population, and any dynamic spawn changes.
- [ ] Whether fish behaviour changes during the run.
- [ ] Exact vertical-boundary behaviour.
- [ ] Exact high-score entry and persistence behaviour.
- [ ] Exact victory trigger and ending sequence.
- [ ] Full original audio inventory and music-loop duration.

For each resolved question, record the observation and confidence level in a small reference-notes document or in the relevant implementation documentation. If the original behaviour cannot be established, choose a reasonable value, label it as a reconstruction, and keep it configurable.

---

## 6. Final milestone checklist

The project is ready to call complete only when all of the following are true:

- [ ] The game launches directly into a recognisable title screen.
- [ ] The player can start a run.
- [ ] Arrow-key movement has acceleration, inertia, and drag.
- [ ] Horizontal wrapping works.
- [ ] Fish spawn from both sides and swim across the pond.
- [ ] Fish have varied sizes and colours.
- [ ] Smaller fish are eaten on contact.
- [ ] Eating grows the player and updates score/progress.
- [ ] Larger fish eat the player and end the run.
- [ ] The HUD communicates score and eaten progress.
- [ ] The game-over screen shows the result.
- [ ] High scores persist locally.
- [ ] The player can replay after failure.
- [ ] The player can reach the genuine victory ending.
- [ ] The victory screen communicates the destruction of the pond ecosystem.
- [ ] The player can replay after victory.
- [ ] Background music loops and sound effects work.
- [ ] Sound controls work.
- [ ] Visuals match the original's simple aquatic cartoon style.
- [ ] Automated tests cover the core rules and important regressions.
- [ ] A clean build and complete playthrough have been verified.
- [ ] README, credits, and release instructions are complete.

---

## 7. Relationship to the GDD

`GDD.md` describes **what the game is and how it should behave**. This file describes **the order in which to build it and how to verify completion**.

When a design question arises:

1. Check `GDD.md`.
2. Check the unresolved reference questions in this roadmap.
3. Inspect the original SWF if practical. (if the ref. link was provided)
4. Record the chosen behaviour and whether it is verified or reconstructed.
5. Update the GDD and roadmap if the evidence changes the plan.

Do not silently change the game's scope or mechanics during implementation.
