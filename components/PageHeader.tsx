"use client";

import Link from "next/link";

import DarkModeToggle from "./DarkModeToggle";
import FoundationLogo from "./FoundationLogo";

interface PageHeaderProps {
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}

export default function PageHeader({
  subtitle = "SECURE • CONTAIN • PROTECT • GENERATE",
  showBackButton = false,
  backButtonText = "← BACK TO COLLECTION",
  backButtonHref = "/",
}: PageHeaderProps) {
  return (
    <header className="shadow-sm border-b border-scp-card-dark transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-2">
        {showBackButton ? (
          <div className="flex justify-between items-center">
            <Link
              href={backButtonHref}
              className="text-scp-accent dark:text-scp-accent-dark hover:text-red-800 dark:hover:text-red-400 font-mono text-sm font-semibold transition-colors">
              {backButtonText}
            </Link>
            <DarkModeToggle />
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <Link href="/">
                <FoundationLogo />
              </Link>
            </div>
            <div className="text-center flex-1">
              {/* <h1 className="text-2xl md:text-3xl font-bold text-scp-text dark:text-scp-text-dark font-mono transition-colors duration-200">
                {title}
              </h1> */}
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-200 hidden md:block">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="ml-4">
              <DarkModeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
