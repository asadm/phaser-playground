import { useEffect, useState } from "react";
import generateGameCode from "./templates";
import { Grid, Collapse, Text, Container, Row, Button, Dropdown, Modal, Switch, Spacer} from "@nextui-org/react";
import defaultProperties from "../AssetProperties/defaultCodes";
import defaultGameConfigCodes from "../../defaultGameConfigCodes";
import FS from "../../fs";

const debounce = (func, wait) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
async function editorDragHandler (filename, x, y, playerData) {
  const dir = "/properties";
  console.log("editorDragHandler", filename, x, y);
  const fullPath = FS.path.join(dir, filename + ".json");
  let exists = await FS.exists(fullPath);
  let properties = JSON.parse(defaultProperties.image);
  if (exists) {
    properties = JSON.parse(await FS.getFileAsText(dir, filename + ".json"));
  }
  properties.startX = parseInt(x);
  properties.startY = parseInt(y);
  await FS.writeTextFile(dir, filename + ".json", JSON.stringify(properties, null, 2));

  if (playerData){
    console.log("playerdata", playerData)
    const configDir = "/configs";
    const configPath = FS.path.join(configDir, "playersConfig.json");
    let config = JSON.parse(defaultGameConfigCodes["playersConfig.json"]);
    exists = await FS.exists(configPath);
    if (exists) {
      config = JSON.parse(await FS.getFileAsText(configDir, "playersConfig.json"));
    }
    if (config[playerData.index]){
      config[playerData.index].startX = parseInt(x);
      config[playerData.index].startY = parseInt(y);
    }
    await FS.writeTextFile(configDir, "playersConfig.json", JSON.stringify(config, null, 2));
  }
}

export default function GameView(){
  const [previewMode, setPreviewMode] = useState(false);
  function createGame(skipIfCreated){
    if (skipIfCreated && window.gameCreated) return;
    // destroy existing game
    if (window.game) {
      window.game.destroy();
      window._multiplayer.destroy();
      document.getElementById("game-canvas-container").innerHTML = "";
    }
    window.gameCreated = true;
    const isPreviewMode = document.querySelector('.preview-mode-check input').checked;
    console.log("create game", isPreviewMode);
    generateGameCode(isPreviewMode).then((code) => {
      console.log(code);
      eval(code);
    });
  }

  useEffect(() => {
    // createGame(true);
    Mousetrap.bind(['command+s', 'ctrl+s'], function(e) {
        createGame();
        return false;
    });
    window.reloadGame = createGame;
    window.editorDragHandler = debounce(editorDragHandler, 100);
  }, []);
  return (
    <div style={{width: "100%"}}>
      <Row><Switch className="preview-mode-check" checked={previewMode} onChange={(e)=>{
        setPreviewMode(e.target.checked);
        setTimeout(() => {
          createGame();
        }, 300);
      }} /><Spacer x={1}/><h4>Edit/Play</h4></Row>
      <br/>
      {/* <h1>GameView</h1>
      <Button onClick={()=>{
        createGame();
      }}>Play (CMD+S)</Button> */}
      <div id="game-canvas-container"></div>
    </div>
  );
}