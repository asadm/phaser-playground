import { useEffect } from "react";
import generateGameCode from "./templates";

export default function GameView(){
  function createGame(skipIfCreated){
    if (skipIfCreated && window.gameCreated) return;
    // destroy existing game
    if (window.game) {
      window.game.destroy();
      document.getElementById("game-canvas-container").innerHTML = "";
    }
    window.gameCreated = true;
    generateGameCode().then((code) => {
      console.log(code);
      eval(code);
    });
  }
  useEffect(() => {
    createGame(true);
    Mousetrap.bind(['command+s', 'ctrl+s'], function(e) {
        createGame();
        return false;
    });
    window.reloadGame = createGame;
  }, []);
  return (
    <div style={{width: "100%"}}>
      <h1 onClick={()=>{
        createGame();
      }}>GameView</h1>
      <div id="game-canvas-container"></div>
    </div>
  );
}