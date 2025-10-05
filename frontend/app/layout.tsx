import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { BlogNav } from "@/components/blog-nav"
import { Providers } from "@/lib/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "BlogApp - Share Your Stories",
  description: "A modern blogging platform built with Next.js and GraphQL",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Providers>
          <BlogNav />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
