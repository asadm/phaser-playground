
export async function exportFS(){
  const projectName = prompt("Project name", "game");
  const Dexie = require("dexie").default;
  const download = require("downloadjs");
  require('dexie-export-import');

  // let db = new Dexie('local');
  var db = new Dexie('local');
  db.version(0.1).stores({
    files: ''
  });
  const blob = await db.export({prettyJson: true});
  download(blob, projectName+".json", "application/json");
}

export async function importFS(file){
  const Dexie = require("dexie").default;
  const download = require("downloadjs");
  require('dexie-export-import');
  var db = new Dexie("local");
  db.version(0.1).stores({
    files: ''
  });
  
  await db.files.clear();

  try {
    if (!file) throw new Error(`Only files can be dropped here`);
    console.log("Importing " + file.name);
    
    // await db.delete();
    db = await Dexie.import(file);
    console.log("Import complete");
    window.location.reload();
    // await showContent();
  } catch (error) {
    console.error(''+error);
  }
}