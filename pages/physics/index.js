import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect, useState, useCallback } from 'react'
import { Button, Spacer, Row } from "@nextui-org/react";
import FS from "../../common/fs";
import {useDropzone} from 'react-dropzone'

export default function CollisionEditor() {
  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
      // Do whatever you want with the file contents
        const binaryStr = reader.result
        FS.writeArrayBufferToFile("/assets", file.name, binaryStr).then((fileName)=>{
          console.log("file saved", fileName);
          window.location.href = "/collision/" + fileName;
        });
      }
      reader.readAsArrayBuffer(file)
    })
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/jpeg': ['.jpg', '.jpeg'],
    }
  })


  return (
    <div>
      <Head>
        <title>Physics Editor</title>
        <meta name="description" content="Physics editor for Phaser" />
        <meta property="og:video" content="/physics.mp4" />
        <meta property="og:image" content="/favicon.png" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="collision-editor-uploader">
      <Row>
      <video width="1280" height="720" autoPlay loop muted playsInline preload="auto" webkit-playsinline="true" id="video-screenshot">
          <source src="/physics.webm" />
          <source src="/physics.mp4" />
        </video>
      </Row>
      <hr/>
      <Row justify='center'>
        <img src='/favicon.png'/>
      </Row>
      <Row justify='center'>
        <h1>Physics Editor for Phaser</h1>
      </Row>
        <Row justify='center'>
          <h3>Choose a sprite to begin. (.png and .jpg allowed)</h3>
        </Row>
        <Spacer />
        <Row justify='center'>
        <div style={{
          padding: "20px",
          border: "2px dashed"
        }} {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here...</p> :
          <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
      }
    </div>
        {/* <input type="file" id="input-button" onChange={(e)=>{
          const file = e.target.files[0];
          debugger;
          const fileExt = file.name.split('.').pop().toLowerCase();
          if (fileExt === "png" || fileExt === "jpg"){
            console.log(file);
            const fileEntry = {file: (callback) => {
              callback(file)
            }, name: file.name};
            FS.write("/assets", fileEntry).then((fileName)=>{
              console.log("file saved", fileName);
              window.location.url = "/collision/" + fileName;
            });
          }
          else{
            alert("Only a .png or a .jpg file is allowed");
          }
          }} /> */}
        </Row>
      </div>
    </div>
  )
}