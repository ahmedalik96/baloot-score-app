import type { Metadata } from "next";
import "./globals.css";
import SWRegister from "./sw-register";

export const metadata: Metadata = {
  title: "Card Game Calculator",
  description: "تسجيل نقاط لعبة البلوت",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Card Game Calculator",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <SWRegister />
        {children}
      </body>
    </html>
  );
}