import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/stores/auth-store";
import { Shield, GraduationCap, Users, Crown, User } from "lucide-react";

interface RoleBadgeProps {
  role: UserRole;
}

const roleConfig: Record<UserRole, { label: string; icon: typeof Shield }> = {
  ADMIN: { label: "Admin", icon: Crown },
  DEAN: { label: "Dean", icon: Shield },
  HOD: { label: "HoD", icon: Users },
  FACULTY: { label: "Faculty", icon: GraduationCap },
  STUDENT: { label: "Student", icon: User },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
