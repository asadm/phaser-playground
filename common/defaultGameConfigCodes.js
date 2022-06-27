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

const afterPlayerCreatedJs = `
/* 
Do additional things after creation of each player
playerId: string - id of player
sprite: Phaser.GameObjects.Sprite - sprite of player
state: PlayerState - game state of player (see playerState.js)
*/

afterPlayerCreated(playerId, sprite, state) {
  // sprite.setOnCollideWith(this.matter.world.walls.bottom, (pair) => {
  //   state.setState("jumping", false);
  // });
}`

export default {
  "gameConfig.json": JSON.stringify(gameConfig, null, 2),
  "afterPlayerCreated.js": afterPlayerCreatedJs,
  "updatePlayer.js": updatePlayerJs,
}