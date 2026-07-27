import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNIBEN Compass AI",
  description: "AI chatbot assistant for University of Benin inquiries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

