"use client";

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export default function LoadingScreen({
  title = "LOADING...",
  subtitle = "ACCESSING SECURE DATABASE",
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-scp-bg dark:bg-scp-bg-dark flex items-center justify-center transition-colors duration-200">
      <div className="text-center">
        <div className="text-2xl font-mono text-scp-text dark:text-scp-text-dark mb-4 transition-colors duration-200">
          {title}
        </div>
        <div className="text-gray-600 dark:text-gray-400 font-mono transition-colors duration-200">
          {subtitle}
        </div>
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scp-accent dark:border-scp-accent-dark"></div>
        </div>
      </div>
    </div>
  );
}
