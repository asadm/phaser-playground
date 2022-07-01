const Filer = require('filer');
var slugify = require('slugify')

let fs, sh, fsPromises, path;
if (typeof window !== "undefined"){
  fs = new Filer.FileSystem();
  sh = new fs.Shell();
  fsPromises = fs.promises;
  path = Filer.path;
}

async function writeFile(dir, file){
  return new Promise((resolve, reject) => {
    file.file(async (fileItself)=>{
      const data = await new Response(fileItself).arrayBuffer();
      return writeArrayBufferToFile(dir, file.name, data);
      // const ex = await exists(fullPath);
      // if (ex){
      //   await removeFile(dir, fileName);
      // }
      // await mkdirp(dir);
      // await fsPromises.writeFile(fullPath, Filer.Buffer.from(data));
      // resolve(fileName);
    })
  })
}

async function writeArrayBufferToFile(dir, fileName, arrayBuffer){
  fileName = slugify(fileName, {lower: true, replacement: '_'});
  const fullPath = path.join(dir, fileName);
  const ex = await exists(fullPath);
  if (ex){
    await removeFile(dir, fileName);
  }
  await mkdirp(dir);
  await fsPromises.writeFile(fullPath, Filer.Buffer.from(arrayBuffer));
  return fileName;
}

async function writeTextFile(dir, filename, data) {
  const fullPath = path.join(dir, filename);
  return new Promise(async (resolve, reject) => {
    await mkdirp(path.dirname(fullPath));
    fs.writeFile(fullPath, data, (err)=> {
      resolve();
    });
  });
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
  await clearDirectory("/assets");
  await clearDirectory("/configs");
  await clearDirectory("/properties");
}

async function clearDirectory(dir){
  const files = await listAllFiles(dir);
  for(let i=0; i<files.length; i++){
    await fsPromises.unlink(path.join(dir, files[i]));
  }
}

async function removeFile(dir, filename){
  await fsPromises.unlink(path.join(dir, filename));
}

async function getFileAsText(dir, filename){
  const fullPath = path.join(dir, filename);
  return new Promise((resolve, reject) => {
    fs.readFile(fullPath, 'utf8', (err, data)=> {
      resolve(data);
    });
  })
}

async function getFileAsBlob(dir, filename){
  const fullPath = path.join(dir, filename);
  return new Promise((resolve, reject) => {
    fs.readFile(fullPath, (err, data)=> {
      resolve(new Blob([data]))
    });
  })
}

function getDataURLHeader(filename){
  const ext = path.extname(filename);
  if (ext === ".png") return "data:image/png;base64,";
  if (ext === ".mp3") return "data:audio/mpeg;base64,";
}

async function getFileAsDataURL(dir, filename){
  const blob = await getFileAsBlob(dir, filename);
  var reader = new FileReader();
  reader.readAsDataURL(blob); 
  return new Promise((resolve, reject) => {
    reader.onloadend = function() {
      const dataURL = getDataURLHeader(filename) + reader.result.replace('data:application/octet-stream;base64,', '');
      resolve(dataURL);
    }
  });
}

function getAssetType(filename){
  if (filename.endsWith(".mp3")) return "audio";
  if (filename.endsWith(".png")) return "image";
  return "unknown";
}

function getFilenameWithoutExt(filename){
  return filename.substring(0, filename.lastIndexOf("."));
}

export default {
  clear: clearStorage,
  write: writeFile,
  writeTextFile,
  writeArrayBufferToFile,
  list: listAllFiles,
  remove: removeFile,
  watchDir,
  getFileAsDataURL,
  getFileAsText,
  getAssetType,
  getFilenameWithoutExt,
  exists,
  path
}