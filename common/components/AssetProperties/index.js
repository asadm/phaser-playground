import { Grid, Collapse, Text, Container, Row, Button, Checkbox, Modal, Spacer } from "@nextui-org/react";
import CodeEditor from "../CodeEditor";
import FS from "../../fs";
import { useState } from "react";
import CollisionEditor from '../CollisionEditor';
import DefaultCodes from './defaultCodes';
import { useEffect } from "react";

const FSPREFIX = "/properties/";

export default function AssetProperties({ filename, onClose, reloadGame }) {
  const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [collisionEditConfig, setCollisionEditConfig] = useState(null);

  useEffect(()=>{
    FS.exists(FSPREFIX + filename + ".physics.json").then((exists)=>{
      setPhysicsEnabled(exists);
    });
  }, [filename])
  return (
    <div>
      <Row justify="center">
        <Button.Group>
        {/* <Button onPress={()=>{
          FS.remove(FSPREFIX, filename + ".physics.json");
          FS.remove(FSPREFIX, filename + ".json");
          onClose();
        }}>Reset</Button> */}
          <Button onPress={onClose}>Close</Button>
        </Button.Group>
      </Row>
      <h3>Properties</h3>
      <h4>{filename}</h4>
      
      
      
      <h4>General</h4>
      <Row>
        <CodeEditor filename={FSPREFIX + filename + ".json"} defaultCode={FS.getAssetType(filename)==="image"?DefaultCodes.image:DefaultCodes.audio} />
      </Row>

      {FS.getAssetType(filename)==="image" && <Checkbox isSelected={physicsEnabled} onChange={(checked)=>{
        setPhysicsEnabled(checked);
        if (!checked) {
          FS.remove(FSPREFIX, filename + ".physics.json");
          FS.remove(FSPREFIX, filename + ".shape.json");
        }
      }}>Enable Physics</Checkbox>}
      {physicsEnabled && (
      <>
        <h4>Physics (<a href="https://newdocs.phaser.io/docs/3.52.0/Phaser.Types.Physics.Matter#MatterBodyConfig" target="_blank">docs</a>)</h4>
        <Row>
          <CodeEditor filename={FSPREFIX + filename + ".physics.json"} defaultCode={DefaultCodes.physics} />
        </Row>
        <Spacer />
        <Button onPress={()=>{
          setCollisionEditConfig({name: filename});
        }}>Collision Shape Editor</Button>
      </>)}
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
    </div>
  );
}