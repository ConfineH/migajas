"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

export function CopyRecommendLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div aria-live="polite">
      <Button type="button" variant="secondary" onClick={copy} className="mt-4">
        {copied ? "Enlace copiado" : "Copiar enlace"}
      </Button>
    </div>
  );
}
