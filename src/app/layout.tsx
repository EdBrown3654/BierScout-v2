import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BIERSCOUT — BIER REGIERT DIE WELT",
  description:
    "Hopfen, Humor und Harte Rabatte. Entdecke Biere aus aller Welt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
