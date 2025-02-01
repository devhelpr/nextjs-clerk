import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

function NavMenu() {
  return (
    <div className="relative">
      {/* Mobile menu button using checkbox hack */}
      <label htmlFor="menu-toggle" className="md:hidden cursor-pointer">
        <div className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <svg
            className="w-6 h-6 menu-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </div>
      </label>
      <input type="checkbox" id="menu-toggle" className="hidden peer" />

      {/* Desktop menu */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/"
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          Dashboard
        </Link>
        <Link
          href="/ask-question"
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          Ask Question
        </Link>
        <Link
          href="/chat"
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          Chat
        </Link>
        <Link
          href="/profile"
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          Profile
        </Link>
        <UserButton />
        <SignOutButton>
          <button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 text-white rounded">
            Sign out
          </button>
        </SignOutButton>
      </div>

      {/* Mobile menu dropdown */}
      <div
        className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-xl z-50 md:hidden
                    opacity-0 scale-95 -translate-y-2 pointer-events-none
                    peer-checked:opacity-100 peer-checked:scale-100 peer-checked:translate-y-0 peer-checked:pointer-events-auto
                    transition-all duration-200 origin-top"
      >
        <Link
          href="/"
          className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Dashboard
        </Link>
        <Link
          href="/ask-question"
          className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Ask Question
        </Link>
        <Link
          href="/chat"
          className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Chat
        </Link>
        <Link
          href="/profile"
          className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Profile
        </Link>
        <div className="px-4 py-2">
          <UserButton />
        </div>
        <div className="px-4 py-2">
          <SignOutButton>
            <button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 text-white rounded">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="light">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-black dark:text-white`}
        >
          <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
            <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 h-14">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                <div className="flex justify-between items-center w-full">
                  <h1 className="text-xl font-semibold">
                    <Link href="/">Devhelpr test app</Link>
                  </h1>
                  <SignedOut>
                    <SignInButton>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                        Sign in
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <NavMenu />
                  </SignedIn>
                </div>
              </div>
            </header>

            <main className="pt-14 h-[calc(100vh-3.5rem)]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                {children}
              </div>
            </main>

            <footer className="border-t border-gray-200 dark:border-gray-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <p className="text-center text-gray-500 dark:text-gray-400">
                  © {new Date().getFullYear()} Devhelpr. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
