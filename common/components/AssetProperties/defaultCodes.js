const image = {
  order: 0,
  isPlayer: false,
  autoCreate: true,
  startX: parseInt(Math.random() * 900),
  startY: parseInt(Math.random() * 500),
  scale: 1,
  originX: 0.5,
  originY: 0.5
}

const physics = {
  "isStatic": false,
  "density": 0.1,
  "restitution": 0.1,
  "friction": 0.1,
  "frictionAir": 0.01,
  "frictionStatic": 0.5,
  "bounce": 0
}

const audio = {
  what: "audio"
}
export default {
  image: JSON.stringify(image, null, 2),
  physics: JSON.stringify(physics, null, 2),
  audio: JSON.stringify(audio, null, 2)
}