import { formatCurrency } from "@/lib/utils";

interface AmountDisplayProps {
  value: number;
  tone?: "default" | "good" | "warn" | "danger";
  compact?: boolean;
}

const tones = {
  default: "text-ink",
  good: "text-emerald-700",
  warn: "text-saffron",
  danger: "text-brick"
};

export function AmountDisplay({ value, tone = "default", compact = false }: AmountDisplayProps) {
  return <span className={`${tones[tone]} ${compact ? "text-sm font-semibold" : "font-bold"}`}>{formatCurrency(value)}</span>;
}
