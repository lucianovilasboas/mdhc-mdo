import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister"
import { CORES_MARCA } from "@/types"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Envelhecer nos Territórios — Dashboard",
  description: "Dashboard de acompanhamento do Projeto Envelhecer nos Territórios — MDHC",
  applicationName: "Envelhecer nos Territórios",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Envelhecer nos Territórios",
    statusBarStyle: "default",
  },
  icons: [
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
}

export const viewport: Viewport = {
  themeColor: CORES_MARCA.marrom,
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-muted/30">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
