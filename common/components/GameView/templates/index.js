import generateScene from "./scene";
import fs from "../../../fs";
import defaultGameConfigCodes from "../../../defaultGameConfigCodes";

const defaultPhysicsConfig = {
  default: "matter",
  gravity: {
    x: 0,
    y: 0
  },
  debug: true
}

const gameConfig = (physicsConfig) => `{
  type: Phaser.AUTO,
  parent: 'game-canvas-container',
  width: 1170 * (19.5 / 9),
  height: 1170,
  scale: {
    mode: Phaser.Scale.FIT,
  },
  scene: MyGame,
  physics: ${JSON.stringify(physicsConfig, null, 2)},
}`;

export default async function generateGameCode(previewMode) {
  // we assume global helper classes exists, like CommonGameClass, Multiplayer, etc.
  let curGameConfig = JSON.parse(defaultGameConfigCodes['gameConfig.json']);
  const gameConfigExists = await fs.exists("/configs/gameConfig.json");
  if (gameConfigExists) {
    curGameConfig = JSON.parse(await fs.getFileAsText("/configs", "gameConfig.json"));
  }

  const sceneClass = await generateScene(curGameConfig, previewMode);
  return `
  ${sceneClass};

  // Start the game
  const config = ${gameConfig(!previewMode ? { ...defaultPhysicsConfig, matter: { debug: true } } : { ...defaultPhysicsConfig, matter: curGameConfig.matter })};
  const game = new Phaser.Game(config);
  window.game = game;
  `;
}