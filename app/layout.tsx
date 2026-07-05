import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TanStackProvider } from "./providers/tanstack_query";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from './providers/tool_tip'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Persona Chat",
  description: "Chat with Hitesh Sir or Piyush Sir",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TanStackProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster position="top-center" />
        </TanStackProvider>
      </body>
    </html>
  );
}
