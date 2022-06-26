import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { createTheme } from '@nextui-org/react';
import '../styles/globals.css'
import "../styles/editor.scss"
import "../styles/physicsEditor.scss"
import '../styles/prism-shade-of-purple.css';


export const lightTheme = createTheme({
  type: 'light',
  className: 'ui-light'
});

export const darkTheme = createTheme({
  type: 'dark',
  className: 'ui-dark'
});



function MyApp({ Component, pageProps }) {
  return (
    <NextThemesProvider
      defaultTheme="system"
      attribute="class"
      value={{
        light: lightTheme.className,
        dark: darkTheme.className
      }}
    >
  <NextUIProvider >
      <Component {...pageProps} />
  </NextUIProvider>
  </NextThemesProvider>
  )
}

export default MyApp
