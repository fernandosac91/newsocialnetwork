import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "../lib/auth/provider";
import { CommunityProvider } from "@/lib/context/CommunityContext";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Social Network",
  description: "Connect with your community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <CommunityProvider>
            <Navbar />
            <main className="min-h-screen pt-4 pb-10 bg-gray-50">
              {children}
            </main>
          </CommunityProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
