import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoViz — Algorithm Visualizer",
  description: "Paste your LeetCode algorithm code and watch it come alive with beautiful step-by-step visualizations powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">
        <div className="animated-bg" />
        <div className="grid-overlay" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
