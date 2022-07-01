import { Grid, Collapse, Text, Container, Row, Button, Dropdown, Modal} from "@nextui-org/react";
import FS from "../fs";
import { useState, useEffect } from 'react'
import CodeEditor from "./CodeEditor";
import DefaultCodes from '../defaultGameConfigCodes';
const GAMECONFIGFILES = Object.keys(DefaultCodes);
// const GAMECONFIGFILES = [
//   'gameConfig.json', 
//   'createScene.js',
//   'updatePlayer.js',
// ];

export default function FileTree({onProperties}){
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [configEditorFile, setConfigEditorFile] = useState(null);
  
  useEffect(()=>{
    const endWatch = FS.watchDir("/assets", files => setFiles(files))
    window.editorOnAssetSelect = (file)=>{
      console.log("editorOnAssetSelect", file)
      onProperties(file);
    }
    return endWatch;
  },[])

  return (
    <Container>
      <Collapse.Group accordion={false}>
        <Collapse expanded={files && files.length>0} title="Assets">
          <div id='dropzone' 
            onDragOver={(event)=>{
                event.preventDefault();
          }}
          onDrop={(event)=>{
            let items = event.dataTransfer.items;
            event.preventDefault();
            for (let i=0; i<items.length; i++) {
              let item = items[i].webkitGetAsEntry();
              
              if (item) {
                FS.write("/assets", item);
              }
            }
          }}>
            <div id="boxtitle">
              Drop Images + MP3s here
            </div>
          </div>
          <ul>
            {files.map((item, index)=>{
              return (
                <Dropdown key={item}>
                  <Dropdown.Button light className='file-button'>
                    {item}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    onAction={(key)=>{
                      if (key==="preview"){
                        FS.getFileAsDataURL("/assets", item).then((blob)=>{
                          setPreview({name: item, src: blob, type: FS.getAssetType(item)});
                        }).catch(err=>{
                          console.log(err);
                        })
                      }
                      if (key==="properties"){
                        onProperties(item);
                      }
                      if (key === "delete") {
                        var con = confirm("Are you sure you want to delete this asset?");
                        if (con) {
                          FS.remove("/assets", item);
                        }
                      }
                    }}
                    variant="light"
                    aria-label="Actions"
                  >
                    <Dropdown.Item key="preview">Preview</Dropdown.Item>
                    <Dropdown.Item key="properties">Properties</Dropdown.Item>
                    {/* {FS.getAssetType(item)==="image" && <Dropdown.Item key="collision">Collision Editor</Dropdown.Item>} */}
                    <Dropdown.Item key="delete" color="error" withDivider>
                      Delete file
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )
            })}
          </ul>
        </Collapse>
        <Collapse expanded title="Code">
          {GAMECONFIGFILES.map((file)=>{
            return <Button light className='file-button' onPress={()=> setConfigEditorFile(file)}>{file}</Button>
          })}
        </Collapse>
      </Collapse.Group>
      <Modal
        width="50vw"
        scroll
        closeButton
        aria-labelledby="modal-title"
        open={preview !== null}
        onClose={()=> setPreview(null)}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            {preview ? preview.name:""}
            </Text>
        </Modal.Header>
        <Modal.Body>
          {preview && preview.type=="image" && <img src={preview.src} />}
          {preview && preview.type=="audio" && <audio autoPlay controls src={preview.src} />}
        </Modal.Body>
      </Modal>

      <Modal
        width="50vw"
        scroll
        closeButton
        aria-labelledby="modal-title"
        open={configEditorFile !== null}
        onClose={()=> setConfigEditorFile(null)}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            {configEditorFile ? configEditorFile:""}
            </Text>
            {/* <Button light onPress={()=>{
              FS.writeTextFile("/configs", configEditorFile, DefaultCodes[configEditorFile]);
              setConfigEditorFile(null);
            }}>Reset</Button> */}
        </Modal.Header>
        <Modal.Body>
          {configEditorFile && <CodeEditor filename={"/configs/" + configEditorFile} defaultCode={DefaultCodes[configEditorFile]} />}
        </Modal.Body>
      </Modal>
      
    </Container>
  )
}