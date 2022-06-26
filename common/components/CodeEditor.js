import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import { useState } from 'react';

export default function CodeEditor({ filename }) {
  const [code, setCode] = useState(
    JSON.stringify({name: filename}, null, 2)
  );
  return (
    <Editor
      value={code}
      onValueChange={code => setCode(code)}
      highlight={code => highlight(code, languages.json)}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 15,
      }}
    />
  );
}