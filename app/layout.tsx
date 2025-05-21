import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { DeliveryProvider } from "@/contexts/delivery-context"
import { AppShell } from "@/components/layout/app-shell"
import { Toaster } from "@/components/ui/toaster"
import { UploadProvider } from "@/contexts/upload-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BeezeTrack - Package Pickup and Delivery Service",
  description: "Fast and reliable package pickup and delivery service",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <DeliveryProvider>
              <UploadProvider>
                <Toaster />
                <AppShell>{children}</AppShell>
              </UploadProvider>
            </DeliveryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}