import { CheckCircle2, Clock, XCircle } from "lucide-react";

const statusConfig = {
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    className: "bg-green-500/10 text-green-500",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-yellow-500/10 text-yellow-500",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    className: "bg-red-500/10 text-red-500",
  },
};

export default function StatusBadge({ status, className = "" }) {
  const config = statusConfig[status];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.className} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
