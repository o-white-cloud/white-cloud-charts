import type { Metadata } from "next";
import './globals.css';

import { Inter, Onest } from 'next/font/google';

const inter = Inter({ subsets: ["latin"] });
const onest = Onest({ subsets: ["latin"], variable: '--font-onest' });

export const metadata: Metadata = {
  title: "White Cloud charts",
  description: "Tool for creating charts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${onest.variable}`}>{children}</body>
    </html>
  );
}
