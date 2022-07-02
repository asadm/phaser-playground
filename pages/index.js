import Head from 'next/head'
import Link from 'next/link'
import { Button, Spacer, Row, Grid } from "@nextui-org/react";

export default function CollisionEditor() {

  return (
    <div>
      <Head>
        <title>Physics Editor</title>
      </Head>
      <div className="collision-editor-uploader">
      <Row justify='center'>
        <Grid.Container justify='center' gap={2}>
          <Grid>
          <img src='/favicon.png' width={80}/>
          </Grid>
          <Grid>
          <h1>Physics Editor for Phaser</h1>
          </Grid>
        </Grid.Container>
      </Row>
      <Row justify='center'>
        <Link href="/physics"><Button>Open</Button></Link>
      </Row>
      
        <Spacer y={10}/>
        <Row justify='center'>
          <h3>...more tools soon!</h3>
        </Row>
      </div>
    </div>
  )
}