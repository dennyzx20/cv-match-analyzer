import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Match Analyzer | Analizza il tuo CV",
  description:
    "Analyze your CV against a job description with an ATS-style score and practical AI recommendations.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
