export default function(varName, filename, previewModeConfig) {
return `
const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'matter',
    matter: {
      debug: true
    }
  }
};

var game = new Phaser.Game(config);

function preload() {
  //  Load the sprite image
  ${!previewModeConfig?`this.load.image("${varName}", 'assets/${filename}');`:``}
  ${previewModeConfig?`this.textures.addBase64("${varName}", "${previewModeConfig.imageData}");`:``}
  //  Load body shape from JSON file generated using the editor
  ${!previewModeConfig?`this.load.json('${varName}-shape', 'assets/${varName}-shape.json')`:`// Preloaded`};
}

function create() {
  this.matter.world.setBounds(0, 0, 800, 600);

  var shape = ${!previewModeConfig?`this.cache.json.get('${varName}-shape');`:`${previewModeConfig.shapeConfig.split("\n").slice(1).join("\n")}`};
  
  ${!previewModeConfig?`this.matter.add.image(100, 100, '${varName}', null, { shape: shape });`:`
  setTimeout(() => {
    this.matter.add.image(100, 100, '${varName}', null, { shape: shape });
  }, 1000);
  `}

  // Create more sprites on mouse click
  this.input.on('pointerdown', function (pointer) {
    this.matter.add.image(pointer.x, pointer.y, '${varName}', null, { shape: shape });
  }, this);
}
`
}