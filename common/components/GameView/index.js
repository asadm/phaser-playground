import { useEffect, useState } from "react";
import generateGameCode from "./templates";
import { Grid, Collapse, Text, Container, Row, Button, Dropdown, Modal, Switch, Spacer} from "@nextui-org/react";
import defaultProperties from "../AssetProperties/defaultCodes";
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
async function editorDragHandler (filename, x, y) {
  const dir = "/properties";
  console.log("editorDragHandler", filename, x, y);
  const fullPath = FS.path.join(dir, filename + ".json");
  let exists = await FS.exists(fullPath);
  let properties = JSON.parse(defaultProperties.image);
  if (exists) {
    let cc = await FS.getFileAsText(dir, filename + ".json")
    console.log(cc)
    properties = JSON.parse(await FS.getFileAsText(dir, filename + ".json"));
    console.log("exists", properties)
  }
  properties.startX = parseInt(x);
  properties.startY = parseInt(y);
  console.log("final properties", properties);
  await FS.writeTextFile(dir, filename + ".json", JSON.stringify(properties, null, 2));
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
    console.log("create game", previewMode);
    // no idea why previewMode is inverted here, but works
    generateGameCode(!previewMode).then((code) => {
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
      <Row><Switch checked={previewMode} onChange={(e)=>{
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