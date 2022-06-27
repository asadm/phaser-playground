// const EventEmitter = require("events");
class SuperEventEmitter extends EventEmitter {
  on(eventName, fn) {
    super.on(eventName, fn);
    return () => {
      this.off(eventName, fn);
    };
  }
}
