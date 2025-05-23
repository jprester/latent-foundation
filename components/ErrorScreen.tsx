"use client";

import Link from "next/link";

interface ErrorScreenProps {
  title?: string;
  message?: string;
  showRetryButton?: boolean;
  showBackButton?: boolean;
  onRetry?: () => void;
}

export default function ErrorScreen({
  title = "ERROR",
  message = "AN UNEXPECTED ERROR OCCURRED",
  showRetryButton = false,
  showBackButton = true,
  onRetry,
}: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-scp-bg dark:bg-scp-bg-dark flex items-center justify-center transition-colors duration-200">
      <div className="text-center">
        <div className="text-2xl font-mono text-scp-accent dark:text-scp-accent-dark mb-4 transition-colors duration-200">
          {title}
        </div>
        <div className="text-gray-600 dark:text-gray-400 font-mono mb-8 transition-colors duration-200">
          {message}
        </div>
        <div className="flex gap-4 justify-center">
          {showRetryButton && onRetry && (
            <button
              onClick={onRetry}
              className="bg-scp-accent dark:bg-scp-accent-dark text-white px-6 py-3 font-mono font-semibold hover:bg-red-800 dark:hover:bg-red-600 transition-colors"
            >
              RETRY
            </button>
          )}
          {showBackButton && (
            <Link
              href="/"
              className="inline-block bg-gray-600 dark:bg-gray-700 text-white px-6 py-3 font-mono font-semibold hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              RETURN TO COLLECTION
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
