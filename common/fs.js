const Filer = require('filer');

const fs = new Filer.FileSystem();
var sh = new fs.Shell();
const fsPromises = fs.promises;
const path = Filer.path;

var ROOTDIRHANDLE = null;

function errorHandler(err){
  console.log("error", err)
  alert("Error requesting permission for filesystem!");
}


async function writeFile(dir, file){
  return new Promise((resolve, reject) => {
    const fullPath = path.join(dir, file.name);
    file.file(async (fileItself)=>{
      const ex = await exists(fullPath);
      if (ex){
        await removeFile(dir, file.name);
      }
      await mkdirp(dir);
      await fsPromises.writeFile(fullPath, fileItself);
      resolve();
    })
  })
}

async function mkdirp(path){
  return new Promise((resolve, reject) => {
    sh.mkdirp(path, resolve);
  });
}

async function exists(path){
  return new Promise((resolve, reject) => {
    fs.exists(path, resolve);
  });
}

async function listAllFiles(dir) {
  const ex = await exists(dir);
  if (ex){
    return await fsPromises.readdir(dir);
  }
  return [];
}

function watchDir(dir, onChange){
  const watcher = fs.watch(dir, {recursive: true}, ()=>{
    listAllFiles(dir).then(onChange);
  });
  listAllFiles(dir).then(onChange);
  return ()=>{
    watcher.close();
  }
}

async function clearStorage(){
  const files = await listAllFiles("/assets");
  for(let i=0; i<files.length; i++){
    await fsPromises.unlink(path.join("/assets", files[i]));
  }
}

async function removeFile(dir, filename){
  await fsPromises.unlink(path.join(dir, filename));
}

export default {
  clear: clearStorage,
  write: writeFile,
  list: listAllFiles,
  remove: removeFile,
  watchDir
}