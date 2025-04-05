"use client";
import { ThemeProvider } from "next-themes";
import { memo } from "react";
import { Github } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import Link from "next/link";

function ProvidersComponent({ children }: { children: React.ReactNode }) {
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="lg:ml-[25vw]">
        {children}
        <div className="mt-auto px-4 pb-20 lg:hidden">
          <h2 className="text-lg font-bold mb-3">Join Our Community</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Be part of our growing community! Get updates on new features, report bugs, and contribute to make Acadmate better.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="https://github.com/yourusername/acadmate"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="font-medium">Contribute on GitHub</span>
            </Link>
            <Link
              href="https://chat.whatsapp.com/LLycZyCPoY5JZVu0QqR1Nv"
              className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-[#15241b] rounded-lg hover:bg-green-200 dark:hover:bg-[#1a2e22] transition-colors"
            >
              <BsWhatsapp className="w-5 h-5" />
              <span className="font-medium">Join Community</span>
            </Link>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

// Memoize the Providers component to prevent unnecessary re-renders
export const Providers = memo(ProvidersComponent);