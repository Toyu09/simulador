import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Viabilidad360 | Simulador de emprendimientos",
  description: "Simulador financiero para evaluar la viabilidad de pequeños emprendimientos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
    <body className="min-h-full flex flex-col">{children}</body>
  </html>;
}
