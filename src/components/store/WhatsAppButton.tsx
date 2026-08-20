import { MessageCircle } from "lucide-react";

import { whatsappLink } from "@/lib/format";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="ارتباط در واتساپ"
      className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full border border-border bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-elegant transition-transform hover:scale-105"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">واتساپ</span>
    </a>
  );
}
