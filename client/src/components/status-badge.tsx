import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

type Status = "approved" | "pending" | "rejected" | "draft" | "published" | "archived";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "default";
}

const statusConfig: Record<Status, { label: string; icon: typeof CheckCircle2; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    variant: "default",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "secondary",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    variant: "destructive",
  },
  draft: {
    label: "Draft",
    icon: AlertCircle,
    variant: "outline",
  },
  published: {
    label: "Published",
    icon: CheckCircle2,
    variant: "default",
  },
  archived: {
    label: "Archived",
    icon: AlertCircle,
    variant: "outline",
  },
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
