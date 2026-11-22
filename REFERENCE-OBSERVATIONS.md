# Reference Observation Record

## Evidence status

The repository contains design documentation but no original SWF, archived screenshots, exported assets, or direct reference URL. The observations below therefore distinguish confirmed design knowledge from reconstructed implementation detail.

## Established from the GDD

- The classic game is a continuous 2D pond arcade run, not a level-based variant.
- The intended playfield is a fixed rectangular side-on pond.
- The player is a small orange/red fish controlled with the four arrow keys.
- Swimming is intended to have acceleration, momentum, and water resistance.
- Left and right pond edges wrap horizontally; top and bottom are bounded.
- Fish enter from both horizontal edges and travel across the pond.
- Smaller fish are eaten on contact; larger fish end the run immediately.
- Equality handling is reconstructed as dangerous: equal-size contact ends the run until direct reference evidence changes it.
- Eating grows the player and increases score/progress.
- The original has a title screen, gameplay, game-over/replay flow, and a victory ending.
- The canonical victory copy is: "You ate everything and completely destroyed the pond eco-system."
- The archived visual identity includes blue water, a sandy floor, sparse plants, a minimal HUD, and a small set of sound controls.

## Unknown and recorded for SWF playtesting

- Playfield dimensions and aspect ratio
- Exact title instructions and start interaction
- Exact HUD labels and fish-icon meaning
- Collision radii and fish-body bounds
- Exact acceleration, drag, top speed, and stopping distance
- Vertical boundary behaviour
- Spawn interval, population cap, and size/speed distributions
- Score increments and prey-size growth relationship
- Equality collision result
- Victory trigger and end-screen sequence
- High-score storage and presentation
- Complete artwork and audio inventory, including provenance/licensing
- Swim animation frames and timing

## Assets and licensing

No original or third-party visual/audio assets are present in this repository. No asset has been incorporated or assumed to be licensed for reuse. Future art and audio must be independently created or obtained with documented provenance and permission.
