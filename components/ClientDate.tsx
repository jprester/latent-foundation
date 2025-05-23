"use client";

import { useState, useEffect } from "react";

interface ClientDateProps {
  date: string;
  className?: string;
}

export default function ClientDate({ date, className = "" }: ClientDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>(date);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (date) {
      try {
        const formatted = new Date(date).toLocaleDateString();
        setFormattedDate(formatted);
      } catch {
        setFormattedDate(date);
      }
    }
  }, [date]);

  // Show raw date on server, formatted date on client after hydration
  return (
    <span className={className}>
      {hasMounted ? formattedDate : date || "No date"}
    </span>
  );
}
