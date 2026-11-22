import { describe, expect, it } from 'vitest';
import {
  createGameState,
  GAME_STATES,
  transitionGameState,
} from './gameState.js';

describe('application game states', () => {
  it('starts on the title screen', () => {
    expect(createGameState().status).toBe(GAME_STATES.title);
  });

  it('transitions through a run exactly once', () => {
    const state = createGameState();
    transitionGameState(state, 'start');
    transitionGameState(state, 'dead');
    transitionGameState(state, 'victory');

    expect(state.status).toBe(GAME_STATES.gameOver);
  });

  it('replays after game over and victory', () => {
    for (const status of [GAME_STATES.gameOver, GAME_STATES.victory]) {
      const state = { status };
      transitionGameState(state, 'replay');
      expect(state.status).toBe(GAME_STATES.playing);
    }
  });
});
