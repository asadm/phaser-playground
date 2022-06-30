// import Editor from 'react-simple-code-editor';
// import { highlight, languages } from 'prismjs/components/prism-core';
// import 'prismjs/components/prism-clike';
// import 'prismjs/components/prism-javascript';
// import 'prismjs/components/prism-json';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { useState, useEffect } from 'react';
import FS from '../fs';

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
    <CodeMirror
      value={code}
      theme='dark'
      // height="200px"
      extensions={[javascript({ jsx: true })]}
      onChange={(newCode) => {
        setCode(newCode);
        const dir = FS.path.dirname(filename);
        const file = FS.path.basename(filename);
        FS.writeTextFile(dir, file, newCode);
      }}
    />
    // <Editor
    //   value={code}
    //   onValueChange={code => {
    //     setCode(code);
    //     const dir = FS.path.dirname(filename);
    //     const file = FS.path.basename(filename);
    //     FS.writeTextFile(dir, file, code);
    //   }}
    //   onKeyDown={e => {
    //     // override: prevent custom things on Cmd+Enter
    //     if (e.metaKey && e.key === 's') {
    //       e.preventDefault();
    //       if (window.reloadGame) window.reloadGame();
    //     }
    //    }}
    //   highlight={code => highlight(code, filename.endsWith(".js")? languages.js : languages.json)}
    //   padding={10}
    //   style={{
    //     fontFamily: '"Fira code", "Fira Mono", monospace',
    //     fontSize: 15,
    //     borderRadius: 10,
    //     marginTop: 10,
    //     marginBottom: 10,
    //     border: "1px solid #333"
    //   }}
    // />
  );
}