import Script from 'next/script'
export default function Scripts() {
  return (
    <>
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
    </>
  );
}