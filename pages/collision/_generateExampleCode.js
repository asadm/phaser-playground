export default function(varName, filename) {
return `
const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 600,
  height: 800,
  scene: {
    preload: preload,
    create: create
  },
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
  this.load.image("${varName}", 'assets/${filename}');

  //  Load body shape from JSON file generated using the editor
  this.load.json('${varName}-shape', 'assets/${varName}-shape.json');
}

function create() {
  this.matter.world.setBounds(0, 0, 600, 800);

  var shape = this.cache.json.get('${varName}-shape');

  this.matter.add.image(100, 100, '${varName}', null, { shape: shape });

  // Create more sprites on mouse click
  this.input.on('pointerdown', function (pointer) {
    this.matter.add.image(pointer.x, pointer.y, '${varName}', null, { shape: shape });
  }, this);
}
`
}