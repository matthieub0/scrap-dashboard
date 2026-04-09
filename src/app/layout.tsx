import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, DM_Serif_Display } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elaia Deal Sourcing",
  description: "Tech exit monitoring and deal sourcing dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-background grain">
        <Sidebar />
        <main className="flex-1 py-10 px-12 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
