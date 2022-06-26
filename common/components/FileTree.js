import { Grid, Collapse, Text, Container, Row, Button, Dropdown, Modal} from "@nextui-org/react";
import FS from "../fs";
import { useState, useEffect } from 'react'
import CollisionEditor from './CollisionEditor';

function isImage(filename){
  return !filename.endsWith(".mp3");
}

export default function FileTree({onProperties}){
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [collisionEditConfig, setCollisionEditConfig] = useState(null);
  useEffect(()=>{
    const endWatch = FS.watchDir("/assets", files => setFiles(files))
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
                          setPreview({name: item, src: blob, type: isImage(item)?"image":"audio"});
                        }).catch(err=>{
                          console.log(err);
                        })
                      }
                      if (key==="properties"){
                        onProperties(item);
                      }
                      if (key==="collision"){
                        FS.getFileAsDataURL("/assets", item).then((blob)=>{
                          setCollisionEditConfig({name: item, src: blob});
                        }).catch(err=>{
                          console.log(err);
                        })
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
                    {isImage(item) && <Dropdown.Item key="collision">Collision Editor</Dropdown.Item>}
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
          <Text>
            asdas
          </Text>
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
        width="70vw"
        closeButton
        aria-labelledby="modal-title"
        open={collisionEditConfig !== null}
        onClose={()=> {
          setCollisionEditConfig(null);
          delete window.collisionEditorLoaded; // hack to reload the editor
        }}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            {collisionEditConfig ? collisionEditConfig.name:""}
            </Text>
        </Modal.Header>
        <Modal.Body>
          {collisionEditConfig && <CollisionEditor imageName={collisionEditConfig.name} />}
        </Modal.Body>
      </Modal>
    </Container>
  )
}