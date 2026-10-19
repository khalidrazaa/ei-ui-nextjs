"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const RESET_DELAY_MS = 2000;

export default function CopyLinkButton({ label = "Copy link" }: { label?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), RESET_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy} aria-live="polite">
      {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
