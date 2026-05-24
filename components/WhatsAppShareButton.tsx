import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, cn } from "@/lib/utils";

interface WhatsAppShareButtonProps {
  message: string;
  phone?: string;
  label?: string;
  className?: string;
}

export function WhatsAppShareButton({ message, phone, label = "WhatsApp", className }: WhatsAppShareButtonProps) {
  return (
    <a
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700",
        className
      )}
      href={buildWhatsAppUrl(message, phone)}
      rel="noreferrer"
      target="_blank"
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}
