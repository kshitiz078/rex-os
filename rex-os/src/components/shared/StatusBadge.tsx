import { cn } from "@/lib/utils";

type StatusVariant = 
  | "released" | "ready" | "in-progress" | "mixing" | "mastering" | "idea" | "archived"
  | "completed" | "blocked" | "scheduled" | "overdue" | "draft" | "published"
  | "high" | "medium" | "low"
  | string;

const VARIANT_CLASSES: Record<string, string> = {
  released: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  published: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  ready: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  scheduled: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  mastering: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  mixing: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "in-progress": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  idea: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  archived: "bg-red-500/10 text-red-500 border-red-500/20",
  blocked: "bg-red-500/10 text-red-600 border-red-500/20",
  overdue: "bg-red-500/10 text-red-600 border-red-500/20",
  high: "bg-red-500/10 text-red-600 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
  size?: "xs" | "sm";
}

export default function StatusBadge({ status, label, className, size = "xs" }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, "-");
  const classes = VARIANT_CLASSES[key] ?? "bg-gray-500/10 text-gray-500 border-gray-500/20";
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";
  return (
    <span
      className={cn(
        `inline-flex items-center font-black uppercase tracking-wide px-2 py-0.5 rounded-full border ${textSize}`,
        classes,
        className
      )}
    >
      {label ?? status}
    </span>
  );
}
