const decomp = require('poly-decomp');
import FS from "../../../../common/fs";

const generatePreloadFunc = async () => {
  const files = await FS.list("/assets");
  let preloadLines = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const type = FS.getAssetType(file);
    const fileData = await FS.getFileAsDataURL("/assets", file);
    if (type === "image") {
      preloadLines.push(`this.textures.addBase64("${file}", "${fileData}");`);
    }
    if (type === "audio") {
      // preloadLines.push(`this.load.audio("${file}", "${fileData}");`);
    }
  }

  return `
  preload() {
    ${preloadLines.join("\n")}
  }`;
}

const getConvexHullVerticesFromPolygon = (polygon) => {
  // console.log("getConvexHullVerticesFromPolygon", convexhull.makeHull(polygon));
  // console.log("getConvexHullVerticesFromPolygon2", getConvexHullVerticesFromPolygon2(polygon));
  // return [convexhull.makeHull(polygon)];
  return getConvexHullVerticesFromPolygon2(polygon);
}

const getConvexHullVerticesFromPolygon2 = (polygon) => {
  let polygonArr = polygon.map((el)=> [el.x, el.y]);
  decomp.makeCCW(polygonArr);
  const convexHull = decomp.quickDecomp(polygonArr);
  return convexHull.map((el)=> {
    return el.map((point) => {
      return {x: point[0], y: point[1]}
    })
  });
}

const getSortedPolygon = (polygon) => {
  let polygonArr = polygon.map((el)=> [el.x, el.y]);
  decomp.makeCCW(polygonArr);
  return polygonArr.map((point) => (
    {x: point[0], y: point[1]}
    ));
}

const convertShapesToFixtures = (filename, shapes, applyConvexHull) => {
  console.log("convertShapesToFixtures", filename, shapes);
  const formatted = shapes.map(s => {
    if (s.type === "Polygon"){
      return {
        type: "polygon",
        points: s.points.split(" ").map(p => {
          const [x, y] = p.split(",");
          return {x: parseInt(x), y: parseInt(y)}
        })
      }
    }
    else if (s.type === "Ellipse"){
      return {
        type: "circle",
        x: s.x,
        y: s.y,
        radius: Math.max(s.radiusX, s.radiusY)
      }
    }
  });
  return formatted.map((shape, i) => {
    if (shape.type === "polygon"){
      return {
				"label": `${filename}-fixture-${i}`,
				"isSensor": false,
        "vertices": applyConvexHull? getConvexHullVerticesFromPolygon(shape.points): [shape.points]
			}
    }
    else if (shape.type === "circle"){
      return {
        "label": `${filename}-fixture-${i}`,
        "isSensor": false,
        "circle": {
          "x": shape.x,
          "y": shape.y,
          "radius": shape.radius
        }
      }
    }
  });
  
}

export const convertToPhaserMatterConfig = (filename, physicsOptions, shape, applyConvexHull) => {
  return {
    ...physicsOptions,
    "type": "fromPhysicsEditor",
		"label": filename,
		// "isStatic": false,
		// "density": 0.7999999999999999,
		// "restitution": 0.1,
		// "friction": 0.10000000149011612,
		// "frictionAir": 0.009999999776482582,
		// "frictionStatic": 0.5,
		"collisionFilter": {
			"group": 0,
			"category": 1,
			"mask": 255
		},
		"fixtures": convertShapesToFixtures(filename, shape, applyConvexHull)
  }
}

const generateSpriteWithPhysics = async (file, previewMode) => {
  let codeLines = [`// ${file}`];
  const exists = await FS.exists(`/properties/${file}.json`);
  let properties = {startX: 100, startY: 200*Math.random(), autoCreate: true};
  if (exists){
    const json = await FS.getFileAsText("/properties", `${file}.json`);
    properties = JSON.parse(json);
  }
  const varName = FS.getFilenameWithoutExt(file);
  const physicsExists = await FS.exists(`/properties/${file}.physics.json`);
  const physicsShapeExists = await FS.exists(`/properties/${file}.shape.json`);
  if (!physicsExists){
    codeLines.push(`const ${varName} = this.add.image(${properties.startX}, ${properties.startY}, "${file}");`);
  }
  else{
    const physicsJson = await FS.getFileAsText("/properties", `${file}.physics.json`);
    const physics = JSON.parse(physicsJson);
    if (physicsShapeExists){
      const shapeJson = await FS.getFileAsText("/properties", `${file}.shape.json`);
      const shape = JSON.parse(shapeJson);
      console.log("convertToPhaserMatterConfig(file, physics, shape, true)", file, shape, convertToPhaserMatterConfig(file, physics, shape, true));
      codeLines.push(`const ${varName} = this.matter.add.image(${properties.startX}, ${properties.startY}, "${file}", null, {shape: ${JSON.stringify(convertToPhaserMatterConfig(file, physics, shape, true))}});`);
    }
    else{
      codeLines.push(`const ${varName} = this.matter.add.image(${properties.startX}, ${properties.startY}, "${file}", null, {shape: ${JSON.stringify(physics)}});`);
    }

    if (physics.bounce){
      codeLines.push(`${varName}.setBounce(${physics.bounce});`);
    }
    codeLines.push(`this.${varName} = ${varName};`);
  }

  if (properties.scale){
    codeLines.push(`${varName}.setScale(${properties.scale});`);
  }
  if (properties.originX || properties.originY){
    codeLines.push(`${varName}.setOrigin(${properties.originX || 0.5}, ${properties.originY || 0.5});`);
  }

  if (!previewMode){
    codeLines.push(`${varName}.setInteractive();`);
    codeLines.push(`this.input.setDraggable(${varName});`)
    codeLines.push(`${varName}.setData("filename", "${file}");`);
    codeLines.push(`${varName}.on('pointerup', ()=> window.editorOnAssetSelect("${file}"));`);

    console.log(codeLines)
  }
  return {properties, order: properties.order || 0, code: codeLines.join("\n")};
}

const generateCreateFunc = async (gameConfig, previewMode) => {
  const files = await FS.list("/assets");
  const playerSprite = await getPlayerSpriteAndProperties();
  let createLines = [];
  for (let i = 0; i < files.length; i++) {
    if (playerSprite && playerSprite.file === files[i]) continue; // skip player sprite
    const file = files[i];
    const type = FS.getAssetType(file);
    if (type === "image") {
      console.log(`Generating sprite for ${file}`);
      const line = await generateSpriteWithPhysics(file, previewMode);
      if (line.properties && line.properties.autoCreate){
        createLines.push(line);
      }
    }
  }
  return `
  create() {
    super.create();
    ${!previewMode? `this.matter.pause()`:``}
    this.matter.world.setBounds(0, 0, this.sys.game.scale.gameSize.width, this.sys.game.scale.gameSize.height);
    // wait for image loads
    ${!previewMode?`
    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
        // console.log(gameObject.x, gameObject.y, gameObject.getData('filename'));
        if (window.editorDragHandler) {
          window.editorDragHandler(
            gameObject.getData('filename'), 
            gameObject.x, 
            gameObject.y, 
            gameObject.getData('playerId') ?
              {id: gameObject.getData('playerId'), index: gameObject.getData('playerIndex')}
              :null
          );
        }
    });
    `:''}
    setTimeout(() => {
      ${createLines.sort((a,b)=> a.order-b.order).map((el)=> el.code).join("\n")}

      // add any players
      
      for (let i = 0; i < ${gameConfig.players||0}; i++) {
        this.multiplayer.addPlayer && this.multiplayer.addPlayer();
      }
    }, 100);
    
  }`;
}

const getPlayerSpriteAndProperties = async () => {
  const files = await FS.list("/assets");
  let playerFileAndProperties = null;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const type = FS.getAssetType(file);
    if (type === "image") {
      const properties = await FS.getFileAsText("/properties", `${file}.json`);
      if (!properties) continue;
      const json = JSON.parse(properties);
      if (json.isPlayer){
        playerFileAndProperties = {file, properties};
        break;
      }
    }
  }

  return playerFileAndProperties;
}

const generateAddPlayerSprite = async () => {
  const playerSprite = await getPlayerSpriteAndProperties();
  if (playerSprite){
    const varName = FS.getFilenameWithoutExt(playerSprite.file);
    let createLines = await generateSpriteWithPhysics(playerSprite.file);
    return `
    addPlayerSprite(state, profile, i) {
      ${createLines.code}
      ${varName}.setData("playerId", state.id);
      ${varName}.setData("playerIndex", i);
      if (PlayersConfig && PlayersConfig[i]){
        if (PlayersConfig[i].startX) ${varName}.x = PlayersConfig[i].startX;
        if (PlayersConfig[i].startY) ${varName}.y = PlayersConfig[i].startY;
      }
      return ${varName};
    }
    `
  }
  return ``;
}

const generateUpdatePlayer = async () => {
  const exists = await FS.exists(`/configs/updatePlayer.js`);
  if (exists){
    const code = await FS.getFileAsText("/configs", "updatePlayer.js");
    return code;
  }
  return ``;
}

const generateAfterPlayerCreated = async () => {
  const exists = await FS.exists(`/configs/afterPlayerCreated.js`);
  if (exists){
    const code = await FS.getFileAsText("/configs", "afterPlayerCreated.js");
    return code;
  }
  return ``;
}

const generateScene = async (gameConfig, previewMode) => {
  const preloadFunc = await generatePreloadFunc();
  const createFunc = await generateCreateFunc(gameConfig, previewMode);
  const addPlayerSpriteFunc = await generateAddPlayerSprite();
  const updatePlayerFunc = await generateUpdatePlayer();
  const afterPlayerCreatedFunc = await generateAfterPlayerCreated();

  return `
  /**
   * This is an example game scene that uses CommonGameScene to create a (local) multiplayer game.
   */
  class MyGame extends CommonGameScene {
    constructor() {
      super();
    }
  
    ${preloadFunc}
    ${createFunc}
    ${addPlayerSpriteFunc}
    ${previewMode?updatePlayerFunc:""}
    ${previewMode?afterPlayerCreatedFunc:""}
  }
`
};

export default generateScene;