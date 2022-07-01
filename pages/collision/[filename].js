import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect, useState } from 'react'
import { Button, Spacer, Row } from "@nextui-org/react";
import FS from "../../common/fs";
// import sampleImage from "./sample.png"
var getImageOutline = require('image-outline/browser');

export default function CollisionEditor() {
  const router = useRouter()
  const imageName = router.query.filename;
  const [zoom, setZoom] = useState(1);
  const [simplifyThreshold, setSimplifyThreshold] = useState(10);
  const [editor, setEditor] = useState(null);
  const [image, setImage] = useState(null);
  const [polygons, setPolygons] = useState([]);

  function addPolygon(editor, threshold) {
    var polygon = getImageOutline(window.__editorImageEl, { simplifyThreshold: threshold });
    setPolygons(polygon);
    editor.addShapeJson({
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
    const options = {}
    var image = new Image();
    window.__editorImageEl = image;



    image.onload = function () {
      setImage({ width: image.width, height: image.height, src: image.src, filename: imageName });
      var shapeManager = new ShapeManager("shapesCanvas",
        image.width, image.height,
        options);
      setEditor(shapeManager);
      // read file if exists and load it
      const shapeFile = imageName + ".shape.json";
      FS.exists(FS.path.join("/properties", shapeFile)).then((exists) => {
        if (!exists) {
          addPolygon(shapeManager, simplifyThreshold);
          return;
        }
        FS.getFileAsText("/properties", shapeFile).then((text) => {
          try {
            const json = JSON.parse(text);
            shapeManager.setShapesJson(json);
          }
          catch (e) {
            console.error(e);
            addPolygon(shapeManager, simplifyThreshold);
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
      <Script src="/js/raphael.js" strategy="beforeInteractive" />
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
        <div className='image-super-wrapper'>
          <div className='image-wrapper'>
            {image && <img src={image.src} alt="sample"
              style={{ width: image.width * zoom, height: image.height * zoom }} />}
            <div id="shapesCanvas" style={image ? { width: image.width * zoom, height: image.height * zoom } : {}}></div>
          </div>
        </div>
        <Row justify='center'>
          <Button.Group>
            <Button onPress={() => {
              editor.deleteAllShapes();
            }}>Clear</Button>
            <Button onPress={() => {
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
                "y": 10,
                "x": 10
              })
            }}>Add Circle</Button>
</Button.Group>

<Button.Group>
            <Button onPress={() => {
              editor.deleteAllShapes();
              const newThreshold = simplifyThreshold + 10;
              setSimplifyThreshold(newThreshold);
              addPolygon(editor, newThreshold);
            }}>-</Button>
            <Button disabled>{polygons.length}</Button>
            <Button onPress={() => {
              editor.deleteAllShapes();
              const newThreshold = simplifyThreshold - 10;
              setSimplifyThreshold(newThreshold);
              addPolygon(editor, newThreshold);
            }}>+</Button>
</Button.Group>

<Button.Group>
            <Button onClick={() => {
              const shapes = editor.getShapesJson()
              FS.writeTextFile("/properties", imageName + ".shape.json", JSON.stringify(shapes));
            }}>Save</Button>
</Button.Group>

<Button.Group>
            <Button onPress={() => {
              if (zoom <= 0.1) return;
              const newZoom = zoom - 0.1;
              setZoom(newZoom);
              editor.setZoom(parseInt(newZoom * 100));
            }}>Zoom-</Button>
            <Button disabled>{parseInt(zoom * 100)}</Button>
            <Button onPress={() => {
              if (zoom >= 10) return;
              const newZoom = zoom + 0.1;
              setZoom(newZoom);
              editor.setZoom(parseInt(newZoom * 100));
            }}>Zoom+</Button>
          </Button.Group>
        </Row>
      </main>
    </div>
  )
}
