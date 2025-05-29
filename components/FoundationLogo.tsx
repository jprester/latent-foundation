"use client";

interface FoundationLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function FoundationLogo({
  size = 40,
  className = "",
  showText = true,
}: FoundationLogoProps) {
  return (
    <div
      className={`flex items-center gap-3 ${className} text-scp-text dark:text-scp-text-dark`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M45.2667 34.49C45.2667 35.3336 44.8 36.0662 44.0889 36.4436L26.5333 46.3004C26.1778 46.5668 25.7333 46.7001 25.2667 46.7001C24.8 46.7001 24.3556 46.5668 24 46.3004L6.44445 36.4436C6.08803 36.2568 5.78974 35.9759 5.58207 35.6314C5.3744 35.2869 5.26531 34.8922 5.26668 34.49V14.51C5.26668 13.6664 5.73334 12.9338 6.44445 12.5564L24 2.69965C24.3556 2.43325 24.8 2.30005 25.2667 2.30005C25.7333 2.30005 26.1778 2.43325 26.5333 2.69965L44.0889 12.5564C44.8 12.9338 45.2667 13.6664 45.2667 14.51V34.49ZM25.2667 7.07305L9.71112 15.8198V33.1802L25.2667 41.9271L40.8222 33.1802V15.8198L25.2667 7.07305Z"
          fill="currentColor"
        />
        <path
          d="M25 21.5C25.7956 21.5 26.5587 21.8161 27.1213 22.3787C27.6839 22.9413 28 23.7044 28 24.5C28 25.2956 27.6839 26.0587 27.1213 26.6213C26.5587 27.1839 25.7956 27.5 25 27.5C24.2044 27.5 23.4413 27.1839 22.8787 26.6213C22.3161 26.0587 22 25.2956 22 24.5C22 23.7044 22.3161 22.9413 22.8787 22.3787C23.4413 21.8161 24.2044 21.5 25 21.5ZM25 17C30 17 34.27 20.11 36 24.5C34.27 28.89 30 32 25 32C20 32 15.73 28.89 14 24.5C15.73 20.11 20 17 25 17ZM16.18 24.5C16.9883 26.1503 18.2433 27.5407 19.8025 28.5133C21.3617 29.4858 23.1624 30.0013 25 30.0013C26.8376 30.0013 28.6383 29.4858 30.1975 28.5133C31.7567 27.5407 33.0117 26.1503 33.82 24.5C33.0117 22.8497 31.7567 21.4593 30.1975 20.4867C28.6383 19.5142 26.8376 18.9987 25 18.9987C23.1624 18.9987 21.3617 19.5142 19.8025 20.4867C18.2433 21.4593 16.9883 22.8497 16.18 24.5Z"
          fill="currentColor"
        />
      </svg>

      {/* Text Logo */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold font-mono text-scp-text dark:text-scp-text-dark tracking-tight">
            LATENT
          </span>
          <span className="text-xs font-mono text-scp-muted dark:text-scp-muted-dark tracking-wider -mt-1">
            FOUNDATION
          </span>
        </div>
      )}
    </div>
  );
}
