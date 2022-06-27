// import SuperEventEmitter from "./superEventEmitter";
// const Mousetrap = require('mousetrap');

class PlayerState extends SuperEventEmitter {
  constructor({
    id,
    keys,
    initialState
  }) {
    super();
    this.id = id;
    this.state = initialState || {};
    this.inputState = {};
    this.keys = keys;
    this.attachController()
  }

  // used for local players
  attachController() {
    this.detachController();
    const keys = this.keys;
    // arrow keys
    Mousetrap.bind(keys[0], this.handleKeyDown.bind(this, "up"), 'keydown');
    Mousetrap.bind(keys[0], this.handleKeyUp.bind(this, "up"), 'keyup');
    Mousetrap.bind(keys[1], this.handleKeyDown.bind(this, "left"), 'keydown');
    Mousetrap.bind(keys[1], this.handleKeyUp.bind(this, "left"), 'keyup');
    Mousetrap.bind(keys[2], this.handleKeyDown.bind(this, "down"), 'keydown');
    Mousetrap.bind(keys[2], this.handleKeyUp.bind(this, "down"), 'keyup');
    Mousetrap.bind(keys[3], this.handleKeyDown.bind(this, "right"), 'keydown');
    Mousetrap.bind(keys[3], this.handleKeyUp.bind(this, "right"), 'keyup');

    // buttons
    Mousetrap.bind(keys[4], this.handleKeyDown.bind(this, "b1"), 'keydown');
    Mousetrap.bind(keys[4], this.handleKeyUp.bind(this, "b1"), 'keyup');
    Mousetrap.bind(keys[5], this.handleKeyDown.bind(this, "b2"), 'keydown');
    Mousetrap.bind(keys[5], this.handleKeyUp.bind(this, "b2"), 'keyup');
  }

  detachController() {
    this.keys.forEach((key) => {
      Mousetrap.unbind(key, 'keyup');
      Mousetrap.unbind(key, 'keydown');
    });
  }

  handleKeyDown(key) {
    this.handleInput({ keydown: key });
  }

  handleKeyUp(key) {
    this.handleInput({ keyup: key });
  }

  // handleDpad(value) {
  //   this.handleInput({ dpad: value });
  // }

  // handle the input, pass it to subscribers (usually the game logic which will use this to move players in engine)
  handleInput(data) {
    Object.keys(data).forEach((i) => {
      const key = data[i];
      if (i === "keydown") this.inputState[key] = true;
      if (i === "keyup") delete this.inputState[key];
      if (i === "dpad") this.inputState["dpad"] = data.dpad;
    });
    // we just emit the input event
    this.emit("input", data);
  }

  isKeyDown(key) {
    return this.inputState[key];
  }

  on(name, fn) {
    if (name === "profile") {
      fn(this.state["profile"]);
    }
    return super.on(name, fn);
  }

  getState(key) {
    if (!key) return this.state;
    return this.state[key];
  }

  // public method to change state object (used by host only or to change my own state). This is then synced with all clients.
  setState(key, newState) {
    // only set / send if the values are different
    if (JSON.stringify(this.state[key]) === JSON.stringify(newState)) return;

    this.state[key] =  newState;
    this.emit("state", key, newState);
      if (key === "profile") {
        this.emit("profile", newState);
      }
  }

  disconnect() {
    this.detachController();
    this.isDestroyed = true;
    this.emit("quit");
  }
}
