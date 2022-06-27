import Head from 'next/head'

import { useEffect, useState } from 'react'
import { Button } from "@nextui-org/react";
import FS from "../../fs";
// import sampleImage from "./sample.png"
var getImageOutline = require('image-outline/browser');

export default function Home({imageName}) {
  const [zoom, setZoom] = useState(100);
  const [simplifyThreshold, setSimplifyThreshold] = useState(10);
  const [editor, setEditor] = useState(null);
  const [image, setImage] = useState(null);
  const [polygons, setPolygons] = useState([]);

  function addPolygon(editor, threshold) {
    var polygon = getImageOutline(window.__editorImageEl, {simplifyThreshold: threshold});
    setPolygons(polygon);
    editor.addShapeJson({"type": "Polygon",
      "points": polygon.map(p => p.x + "," + p.y).join(" "),
      "strokeColor": "#FF00FF",
      "strokeWidth": 2});
  }

  useEffect(() => {
    if (window.collisionEditorLoaded) return;
    window.collisionEditorLoaded = true;
    
    
    
    // const {width, height, src} = image;
    const options = {}
    var image = new Image();
    window.__editorImageEl = image;

    

    image.onload = function() {
      setImage({width: image.width, height: image.height, src: image.src, filename: imageName});
      var shapeManager = new ShapeManager("shapesCanvas",
                                          image.width, image.height,
                                          options);
      setEditor(shapeManager);
      addPolygon(shapeManager, simplifyThreshold);
    }
    FS.getFileAsDataURL("/assets", imageName).then((blob)=>{
      image.src = blob;
    });

  }, []);

  return (
    <div className="physics-editor">
      <main>
        <div className='image-wrapper'>
        {image && <img src={image.src} alt="sample"
          style={{width: image.width, height: image.height}} />}
        <div id="shapesCanvas" style={image?{width: image.width, height: image.height}:{}}></div>
        </div>
        <Button.Group>
        <Button onPress={()=>{
          editor.deleteAllShapes();
        }}>Clear</Button>
        <Button onPress={()=>{
          editor.addShapeJson({"type": "Ellipse",
          "strokeColor": "#FF00FF",
          "radiusY": 30,
          "radiusX": 30,
          "strokeWidth": 2,
          "y": 10,
          "x": 10})
        }}>Add Circle</Button>
        <Button onPress={()=>{
          editor.deleteAllShapes();
          const newThreshold = simplifyThreshold + 10;
          setSimplifyThreshold(newThreshold);
          addPolygon(editor, newThreshold);
        }}>-</Button>
        <Button disabled>{polygons.length}</Button>
        <Button onPress={()=>{
          editor.deleteAllShapes();
          const newThreshold = simplifyThreshold - 10;
          setSimplifyThreshold(newThreshold);
          addPolygon(editor, newThreshold);
        }}>+</Button>
        <Button onClick={()=>{
          const shapes = editor.getShapesJson()
          const formatted = shapes.map(s => {
            if (s.type === "Polygon"){
              return {
                type: "polygon",
                points: s.points.split(" ").map(p => {
                  const [x, y] = p.split(",");
                  return {x: parseInt(x), y: parseInt(y)}
                })
              }
            }
            else if (s.type === "Ellipse"){
              return {
                type: "circle",
                x: s.x,
                y: s.y,
                radius: Math.max(s.radiusX, s.radiusY)
              }
            }
          });
          FS.writeTextFile("/properties", imageName + ".shape.json", JSON.stringify(formatted));
        }}>Save</Button>
      </Button.Group>
      </main>
    </div>
  )
}
