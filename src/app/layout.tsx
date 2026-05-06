import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "RPG Lab — Laboratório de Fichas",
  description:
    "Laboratório digital de fichas de personagem para múltiplos sistemas de RPG. D&D 5e, Call of Cthulhu, Tormenta 20 e muito mais.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${cinzel.variable}`}>
      <body suppressHydrationWarning><Providers>{children}</Providers></body>
    </html>
  );
}
