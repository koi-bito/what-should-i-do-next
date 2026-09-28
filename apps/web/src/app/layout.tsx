import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "What Should I Do Next?",
    template: "%s | What Should I Do Next?",
  },
  description:
    "A decision engine for people who are stuck, not lazy. Tell us your energy and your time — get one clear next step, every time.",
  keywords: ["productivity", "ai", "decision making", "task management", "focus"],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "What Should I Do Next?",
    description: "Stop deciding. Start doing. AI-powered next action, every time.",
    siteName: "What Should I Do Next?",
  },
  twitter: {
    card: "summary_large_image",
    title: "What Should I Do Next?",
    description: "Stop deciding. Start doing.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
