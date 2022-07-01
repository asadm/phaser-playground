import {convertToPhaserMatterConfig} from "../../common/components/GameView/templates/scene";
var beautify = require("json-beautify");

const physicsConfig = {
  "type": "fromPhysicsEditor",
  "isStatic": false,
  "density": 0.8,
  "restitution": 0.1,
  "friction": 0.1,
  "frictionAir": 0.001,
  "frictionStatic": 0.5,
  "collisionFilter": {
    "group": 0,
    "category": 1,
    "mask": 255
  }
}

export default function(varName, filename, shapes, applyConvexHull) {
  return `
// assets/${varName}-shape.json
${beautify(convertToPhaserMatterConfig(filename, physicsConfig, shapes, applyConvexHull), null, 2, 80)}`
}
