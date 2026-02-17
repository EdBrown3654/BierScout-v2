import type { Metadata } from "next";
import { LocaleProvider } from "@/lib/i18n-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "BIERSCOUT \u2014 BIER REGIERT DIE WELT",
  description:
    "Hopfen, Humor und Harte Rabatte. Entdecke Biere aus aller Welt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
