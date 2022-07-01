import { Button } from "@nextui-org/react";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import {autocompletion} from '@codemirror/autocomplete';
import { useState, useEffect } from 'react';
import globalJavaScriptCompletions from "./autocomplete";
import FS from '../../fs';


export default function CodeEditor({ filename, defaultCode }) {
  const [code, setCode] = useState("");

  useEffect(() => {
    console.log("editor onload", filename);
    const dir = FS.path.dirname(filename);
    const file = FS.path.basename(filename);
    FS.exists(filename).then((exists) => {
      if (exists){
        FS.getFileAsText(dir, file).then((text) => {
          try{
            if (file.endsWith(".json")){
              const json = JSON.parse(text);
              setCode(text);
            }
            else{
              setCode(text);
            }
          }
          catch(e){
            setCode(defaultCode);
            FS.writeTextFile(dir, file, defaultCode);
          }
        });
      }
      else{
        setCode(defaultCode);
        FS.writeTextFile(dir, file, defaultCode);
      }
    })
  }, [filename]);

  return (
    <div className="code-editor">
    <Button onPress={()=>{
      const dir = FS.path.dirname(filename);
      const file = FS.path.basename(filename);
      FS.writeTextFile(dir, file, code).then(()=>{
        if (window.reloadGame) window.reloadGame();
      });
    }} size="xs">Save</Button>
    {defaultCode && <Button onPress={()=> setCode(defaultCode)} size="xs">Reset</Button>}
    <CodeMirror
      value={code}
      theme='dark'
      // height="200px"
      extensions={[
        // autocompletion({override: [myCompletions]}),
        javascript({ jsx: true }),
        // globalJavaScriptCompletions,
        // autocompletion({override: globalJavaScriptCompletions})]}
      ]}
      onChange={(newCode) => {
        setCode(newCode);
      }}
    />
    </div>
  );
}