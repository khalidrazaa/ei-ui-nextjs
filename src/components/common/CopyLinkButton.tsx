"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const RESET_DELAY_MS = 2000;

type CopyLinkButtonProps = {
  label?: string;
  /** Round icon-only button, for compact share rails. */
  iconOnly?: boolean;
};

export default function CopyLinkButton({ label = "Copy link", iconOnly = false }: CopyLinkButtonProps) {
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

  const Icon = copied ? Check : Link2;

  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        onClick={copy}
        aria-label={copied ? "Link copied" : label}
        title={copied ? "Copied" : label}
      >
        <Icon aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy} aria-live="polite">
      <Icon aria-hidden="true" />
      {copied ? "Copied" : label}
    </Button>
  );
}
