// const Mousetrap = require('mousetrap');
// import SuperEventEmitter from "./superEventEmitter";
// import PlayerState from "./playerState";
// import PlayersConfig from "./playersConfig";

class MultiplayerClass extends SuperEventEmitter {
  constructor() {
    super();
    this.isHost = false;
    this.connection = false;
    this.currentRoom = false;
    this.isConnected = false;
    this.players = {};
    this.emit("connected");
    this.state = {};

    // Mousetrap.bind("enter", () => {
    //   this._addPlayer();
    // })
    // Mousetrap.bind("backspace", () => {
    //   if (Object.keys(this.players).length >= 1) {
    //     const victim = Object.keys(this.players)[0];
    //     this.players[victim].disconnect();
    //     delete this.players[victim];
    //   }
    // })
  }

  isRenderServer() {
    return true
  }

  addPlayer() {
    const newPlayerConfig = PlayersConfig[Object.keys(this.players).length];
    if (!newPlayerConfig) return;

    this.players[newPlayerConfig.id] = new PlayerState({
      id: newPlayerConfig.id,
      keys: newPlayerConfig.keys,
      initialState: {
        profile: {
          name: newPlayerConfig.name,
          color: newPlayerConfig.color
        }
      }
    });
  }
  
  on(eventName, handler) {
    if (eventName === "joined" && this.connection) {
      Object.keys(this.connection.playerStates).forEach((key) => {
        handler(this.connection.playerStates[key]);
      });
    }
    if (eventName === "players" && this.connection) {
      handler(this.connection.playerStates);
    }
    return super.on(eventName, handler);
  }

  getState(key) {
    if (key) return this.state[key];
    else return this.state;
  }

  setState(key, newState) {
    this.state[key] = newState;
    this.emit("state", this.state, key);
  }

  getMyPlayerState() {
    throw new Error("getMyPlayerState is not defined in shim class");
  }

  getPlayers() {
    return this.players;
  }
}

function Multiplayer() {
  if (!window._multiplayer) {
    window._multiplayer = new MultiplayerClass();
  }

  return window._multiplayer;
}
