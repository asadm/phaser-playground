const gameConfig = {
  matter: {
    runner: {
      fps: 15,
      isFixed: true,
    },
    gravity: {
      y: 1,
    },
    debug: true,
  },
  players: 0
}

const updatePlayerJs = `
/* 
Do updates for each player here (if needed)
playerId: string - id of player
sprite: Phaser.GameObjects.Sprite - sprite of player
state: PlayerState - game state of player (see playerState.js)
*/

updatePlayer(playerId, sprite, state) {
  // if (state.isKeyDown("b1")) {
  //   sprite.setVelocityY(-15);
  // }
}`

export default {
  "gameConfig.json": JSON.stringify(gameConfig, null, 2),
  "updatePlayer.js": updatePlayerJs,
}