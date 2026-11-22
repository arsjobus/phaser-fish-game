export const GAME_STATES = Object.freeze({
  title: 'title',
  playing: 'playing',
  gameOver: 'game-over',
  victory: 'victory',
});

export function createGameState() {
  return {
    status: GAME_STATES.title,
  };
}

export function transitionGameState(state, event) {
  if (event === 'start' && state.status === GAME_STATES.title) {
    state.status = GAME_STATES.playing;
  } else if (event === 'dead' && state.status === GAME_STATES.playing) {
    state.status = GAME_STATES.gameOver;
  } else if (event === 'victory' && state.status === GAME_STATES.playing) {
    state.status = GAME_STATES.victory;
  } else if (event === 'replay') {
    if (
      state.status === GAME_STATES.gameOver ||
      state.status === GAME_STATES.victory
    ) {
      state.status = GAME_STATES.playing;
    }
  }
  return state;
}
