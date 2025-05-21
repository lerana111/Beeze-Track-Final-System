import type { AppProps } from 'next/app'
import { useEffect } from 'react'

export default function MyApp({ Component, pageProps }: AppProps) {
  // This useEffect ensures we don't attempt to update state during SSR
  useEffect(() => {
    // Set a flag to indicate client-side rendering is active
    window.__isClientSide = true
  }, [])

  return (
    <>
      {/* This ensures no hydration warnings in the console */}
      <div id="__next" suppressHydrationWarning>
        <Component {...pageProps} />
      </div>
    </>
  )
}

// Add global type for window
declare global {
  interface Window {
    __isClientSide?: boolean
  }
} 