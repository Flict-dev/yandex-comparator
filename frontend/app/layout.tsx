import "./globals.css";

import type { Metadata } from "next";
import { Providers } from "../components/ui/Providers";

export const metadata: Metadata = {
  title: "Playlist Overlap",
  description: "Сравнение плейлистов Яндекс.Музыки",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
