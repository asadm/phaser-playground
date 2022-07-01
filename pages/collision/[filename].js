import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect, useState } from 'react'
import { Button, Modal, Row, Text, Grid, Checkbox, Tooltip, Spacer } from "@nextui-org/react";
import FS from "../../common/fs";
import addPointToPolygon from '../../common/collisionEditorHelpers/_addPointToPolygon';
import removePointClosest from '../../common/collisionEditorHelpers/_removePointClosest';
import convertToPhaserMatterConfig from '../../common/collisionEditorHelpers/_generateJSON';
import generateGameCode from '../../common/collisionEditorHelpers/_generateExampleCode';

// import sampleImage from "./sample.png"
var getImageOutline = require('image-outline/browser');
import CodeEditor from '../../common/components/CodeEditor';

const autoTraceShapeID = "autoShapePolygon";

export default function CollisionEditor() {
  const router = useRouter()
  const imageName = router.query.filename;
  const saveMode = router.query.save;
  const [zoom, setZoom] = useState(1);
  const [applyConvexHull, setApplyConvexHull] = useState(true);
  const [showJSON, setShowJSON] = useState(null);
  const [simplifyThreshold, setSimplifyThreshold] = useState(10);
  const [editor, setEditor] = useState(null);
  const [image, setImage] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [autoShapePolygonExists, setAutoShapePolygonExists] = useState(false);
  const [previewMode, setPreviewMode] = useState(null);

  function addPolygon(editor, threshold) {
    var polygon = getImageOutline(window.__editorImageEl, { simplifyThreshold: threshold });
    setPolygons(polygon);
    setAutoShapePolygonExists(true);
    editor.addShapeJson({
      "id": autoTraceShapeID,
      "type": "Polygon",
      "points": polygon.map(p => p.x + "," + p.y).join(" "),
      "strokeColor": "#FF00FF",
      "strokeWidth": 2
    });
  }

  useEffect(() => {
    if (window.collisionEditorLoaded || !imageName) return;
    window.collisionEditorLoaded = true;



    // const {width, height, src} = image;
    const options = {
      onClick: function (event, x, y, selectedShapes, editor) {
        if (selectedShapes && selectedShapes.length > 0 && selectedShapes[0].toJson().type === 'Polygon') {
          const isLeftClick = event.which === 1;
          const polygon = selectedShapes[0];
          console.log("selectedShapes", polygon._id, polygon.toJson(), x, y, isLeftClick);
          const polygonPoints = polygon.toJson().points.split(" ").map(p => {
            const [x, y] = p.split(",");
            return { x: parseInt(x), y: parseInt(y) }
          });
          if (isLeftClick) {
            // add a point and sort polygons
            const newPolygon = addPointToPolygon(polygonPoints, { x, y });
            const polygonFormatted = newPolygon.map(p => p.x + "," + p.y).join(" ");
            console.log(polygonPoints, newPolygon);
            editor.deleteShapesByIds([polygon._id]);
            const newShape = editor.addShapeJson({
              "id": polygon._id,
              "type": "Polygon",
              "points": polygonFormatted,
              "strokeColor": "#FF00FF",
              "strokeWidth": 2
            });
            editor.selectShapesById(newShape._id);
          }
          else {
            // remove point from polygon
            const newPolygon = removePointClosest(polygonPoints, { x, y });
            const polygonFormatted = newPolygon.map(p => p.x + "," + p.y).join(" ");
            console.log(polygonPoints, newPolygon);
            editor.deleteShapesByIds([polygon._id]);
            const newShape = editor.addShapeJson({
              "id": polygon._id,
              "type": "Polygon",
              "points": polygonFormatted,
              "strokeColor": "#FF00FF",
              "strokeWidth": 2
            });
            editor.selectShapesById(newShape._id);
          }
        }
      }
    }
    var image = new Image();
    window.__editorImageEl = image;



    image.onload = function () {
      setImage({ width: image.width, height: image.height, src: image.src, filename: imageName });
      var shapeManager = new ShapeManager("shapesCanvas",
        image.width, image.height,
        options);
      setEditor(shapeManager);

      // set default Zoom
      const maxSideOfImage = Math.max(image.width, image.height);
      const screenWidthToFit = window.innerWidth / 2;
      const newZoom = screenWidthToFit / maxSideOfImage
      setZoom(newZoom);
      shapeManager.setZoom(parseInt(newZoom * 100));

      // read file if exists and load it
      const shapeFile = imageName + ".shape.json";
      FS.exists(FS.path.join("/properties", shapeFile)).then((exists) => {
        if (!exists) {
          // addPolygon(shapeManager, simplifyThreshold);
          return;
        }
        FS.getFileAsText("/properties", shapeFile).then((text) => {
          try {
            const json = JSON.parse(text);
            console.log(json)
            setAutoShapePolygonExists(json && json.length && json.find(p => p.id === autoTraceShapeID) !== undefined);
            shapeManager.setShapesJson(json);
          }
          catch (e) {
            console.error(e);
            // addPolygon(shapeManager, simplifyThreshold);
          }
        })
      })


    }

    FS.getFileAsDataURL("/assets", imageName).then((blob) => {
      image.src = blob;
    });

  }, [imageName]);

  return (
    <div className="physics-editor">
      <Head>
        <title>Collision Editor - Phaser Playground</title>
      </Head>
      <Script src="/js/jquery-1.11.3.min.js" strategy="beforeInteractive" />
      <Script src="/js/raphael.min.js" strategy="beforeInteractive" />
      <Script src="/js/shapes/line.js" strategy="beforeInteractive" />
      <Script src="/js/shapes/ellipse.js" strategy="beforeInteractive" />
      <Script src="/js/shapes/rect.js" strategy="beforeInteractive" />
      <Script src="/js/shapes/polygon.js" strategy="beforeInteractive" />
      <Script src="/js/shapeManager.js" strategy="beforeInteractive" />

      <Script src="/gamecode/lib/phaser.min.js" strategy="beforeInteractive" />
      <Script src="/gamecode/lib/mousetrap.min.js" strategy="beforeInteractive" />
      <Script src="/gamecode/lib/eventemitter.js" strategy="beforeInteractive" />
      <Script src="/gamecode/superEventEmitter.js" strategy="beforeInteractive" />
      <Script src="/gamecode/playersConfig.js" strategy="beforeInteractive" />
      <Script src="/gamecode/playerState.js" strategy="beforeInteractive" />
      <Script src="/gamecode/multiplayer.js" strategy="beforeInteractive" />
      <Script src="/gamecode/gamescene.js" strategy="beforeInteractive" />
      <main>
        <div className='image-super-wrapper' onContextMenuCapture={(ev) => {
          ev.preventDefault();
          // alert('success!');
          return false;
        }}>
          <div className='image-wrapper' >
            {image && <img src={image.src} alt="sample"
              style={{ width: image.width * zoom, height: image.height * zoom }} />}
            <div id="shapesCanvas" style={image ? { width: image.width * zoom, height: image.height * zoom } : {}}></div>
          </div>
        </div>
        <Spacer />
        <Row justify='center'>
          <Text style={{ marginTop: "12px", marginRight: "50px" }} weight="bold" >{imageName}</Text>

          <Text style={{ marginTop: "12px", marginRight: "10px" }}>Zoom: </Text>
          <Button.Group>
            <Button onPress={() => {
              if (zoom <= 0.1) return;
              const newZoom = zoom - (zoom >= 2 ? 1 : 0.1);
              setZoom(newZoom);
              editor.setZoom(parseInt(newZoom * 100));
            }}>-</Button>
            <Button disabled>{parseInt(zoom * 100)}%</Button>
            <Button onPress={() => {
              if (zoom >= 30) return;
              const newZoom = zoom + (zoom >= 2 ? 1 : 0.1);
              setZoom(newZoom);
              editor.setZoom(parseInt(newZoom * 100));
            }}>+</Button>
          </Button.Group>

          <Button.Group>
            <Button onPress={() => {
              editor.deleteAllShapes();
              setAutoShapePolygonExists(false);
            }}>Clear</Button>
            <Button onPress={() => {
              const isAutoTraceSelected = editor.getSelectedShapes().find(s => s._id === autoTraceShapeID) !== undefined;
              if (isAutoTraceSelected) {
                setAutoShapePolygonExists(false);
              }
              console.log(isAutoTraceSelected, editor.getSelectedShapes());
              editor.deleteSelectedShapes();
            }}>Delete Selected</Button>
          </Button.Group>

          <Button.Group>
            <Button onPress={() => {
              editor.addShapeJson({
                "type": "Ellipse",
                "strokeColor": "#FF00FF",
                "radiusY": 30,
                "radiusX": 30,
                "strokeWidth": 2,
                "y": Math.random()* 50 + image.width/2,
                "x": Math.random()* 50 + image.height/2
              })
            }}>Add Circle</Button>
            
            <Button onPress={() => {
              const offX = Math.random()* 50 + image.width/2;
              const offY = Math.random()* 50 + image.height/2;
              const polygon = editor.addShapeJson({
                "type": "Polygon",
                "points": [[10+offX,10+offY], [10+offX,30+offY], [30+offX,30+offY]].map(p => p.join(",")).join(" "),
                "strokeColor": "#FF00FF",
                "strokeWidth": 2
              })

              editor.selectShapesById([polygon.id]);
            }}>
              <Tooltip content={<b>Adds a polygon shape.<br/><br/>Select polygon and left-click outside the polygon to add a new point there.<br/><br/>Select polygon and right-click on any point of the polygon to delete that point.</b>}>Add Polygon</Tooltip></Button>
            
            {!autoShapePolygonExists && <Button onPress={() => {
              addPolygon(editor, simplifyThreshold);
            }}>Auto-trace Border</Button>}
          </Button.Group>

          {autoShapePolygonExists && (
            <Button.Group>
              <Button disabled>Tweak Auto-trace</Button>
              <Button onPress={() => {
                editor.deleteShapesByIds([autoTraceShapeID]);
                const newThreshold = simplifyThreshold + 10;
                setSimplifyThreshold(newThreshold);
                addPolygon(editor, newThreshold);
              }}>-</Button>
              <Button disabled>{polygons.length} points</Button>
              <Button onPress={() => {
                editor.deleteShapesByIds([autoTraceShapeID]);
                const newThreshold = simplifyThreshold - 10;
                setSimplifyThreshold(newThreshold);
                addPolygon(editor, newThreshold);
              }}>+</Button>
            </Button.Group>)}


            

          

          {!saveMode &&
            <div style={{ margin: "12px" }} >
              <Checkbox isSelected={applyConvexHull} onChange={() => {
                setApplyConvexHull(!applyConvexHull);
              }} size="sm">
                Apply Convex Hull
                <Tooltip content={<b>Phaser doesn&apos;t like it if your polygon is not convex-shaped.<br />Untick this if it messes with your shape too much!</b>}>
                  <small style={{ fontWeight: "bold", marginLeft: "5px", color: "#0072F5" }}>
                    (what?)
                  </small>
                </Tooltip>
              </Checkbox>
            </div>
          }

<Button.Group>
              <Button onClick={async () => {
                const shapes = editor.getShapesJson()
                const fullConfig = convertToPhaserMatterConfig(FS.getFilenameWithoutExt(imageName), imageName, shapes, applyConvexHull).trim();
                const imageData = await FS.getFileAsDataURL("/assets", imageName);
                const generatedCode = generateGameCode(FS.getFilenameWithoutExt(imageName), imageName, {shapeConfig: fullConfig, imageData});
                setPreviewMode(true);
                setTimeout(() => {
                  // destroy existing game
                  if (window.game) {
                    window.game.destroy();
                    document.getElementById("phaser-example").innerHTML = "";
                  }
                  // create new game
                  eval(generatedCode);
                }, 500);
              }}>Preview</Button>
            </Button.Group>

            {saveMode &&
            <Button.Group color='success'>
              <Button onClick={() => {
                const shapes = editor.getShapesJson()
                FS.writeTextFile("/properties", imageName + ".shape.json", JSON.stringify(shapes));
              }}>Save</Button>
            </Button.Group>}

          {!saveMode &&
            <Button.Group color='success'>
              <Button onClick={() => {
                const shapes = editor.getShapesJson()
                FS.writeTextFile("/properties", imageName + ".shape.json", JSON.stringify(shapes));
                const fullConfig = convertToPhaserMatterConfig(FS.getFilenameWithoutExt(imageName), imageName, shapes, applyConvexHull).trim();
                setShowJSON(fullConfig);
              }}>Show JSON</Button>
            </Button.Group>}

            

        </Row>

        <Modal
          width="95vw"
          scroll
          closeButton
          aria-labelledby="modal-title"
          open={showJSON !== null}
          onClose={() => setShowJSON(null)}
        >
          <Modal.Header>
            <Text id="modal-title" size={18}>
              Phaser + Matter Physics JSON
            </Text>
          </Modal.Header>
          <Modal.Body>
            <Grid.Container gap={2} justify="center">
              <Grid xs={6}>
                {showJSON && <CodeEditor className="full-width" readOnly defaultCode={showJSON} />}
              </Grid>
              <Grid xs={6}>
                <div style={{ width: "100%" }}>
                  <Row>
                    <h3>Usage</h3>
                  </Row>
                  <p>
                    Save the JSON file on left and then load it in your Phaser + Matter game as follows:
                  </p>
                  <Row>
                    {showJSON && <CodeEditor className="full-width" readOnly defaultCode={generateGameCode(FS.getFilenameWithoutExt(imageName), imageName)} />}
                  </Row>
                </div>
              </Grid>
            </Grid.Container>
          </Modal.Body>
        </Modal>
        <Modal
          width="900px"
          css={{minHeight: "600px"}}
          scroll
          closeButton
          aria-labelledby="modal-title"
          open={previewMode !== null}
          onClose={() => setPreviewMode(null)}
        >
          <Modal.Header>
            <Text id="modal-title" size={18}>
              Phaser + Matter Physics Preview
            </Text>
          </Modal.Header>
          <Modal.Body>
            <center>
            <div id="phaser-example"></div>
            </center>
          </Modal.Body>
        </Modal>
      </main>
    </div>
  )
}
