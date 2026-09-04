import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aetheris AI Teacher - The Autonomous Multimodal Professor",
  description: "An adaptive human-like AI educator that teaches through synchronized video, live smartboard, and Socratic misconception remediation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" crossOrigin="anonymous" />
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js" crossOrigin="anonymous" defer></script>
      </head>
      <body className="bg-background text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
