// import Phaser from "phaser";
// import Multiplayer from "./multiplayer";

class CommonGameScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameScene",
    });

    this.players = {};
  }
  create() {
    this.multiplayer = Multiplayer();
    this.handlePlayerJoin = this.handlePlayerJoin.bind(this);
  }

  async handlePlayerJoin(playerState) {
    this.players[playerState.id] = { state: playerState };
    let sprite = await this.addPlayerSprite(
      playerState,
      playerState.getState("profile")
    );
    playerState.on("quit", () => {
      if (this.handlePlayerQuit) this.handlePlayerQuit(playerState);
      if (sprite) sprite.destroy();
      delete this.players[playerState.id];
    });

    this.players[playerState.id] = { state: playerState, sprite };
    if (this.afterPlayerCreated) this.afterPlayerCreated(playerState.id, sprite, playerState);
  }

  async addPlayerSprite() {
    throw new Error("addPlayerSprite is not defined by derived class");
  }

  update() {
    // add any new players
    const players = this.multiplayer.getPlayers();
    Object.keys(players).forEach((playerId) => {
      if (!this.players[playerId]) {
        this.handlePlayerJoin(players[playerId]);
      }
    });

    Object.keys(this.players).forEach((playerId) => {
      const state = this.players[playerId].state;
      const player = this.players[playerId].sprite;
      if (!player) return;

      if (this.updatePlayerHost)
          this.updatePlayerHost(playerId, player, state);

      if (this.updateCommon) this.updateCommon(playerId, player, state);
      if (this.updatePlayer) this.updatePlayer(playerId, player, state);
    });
  }
}
