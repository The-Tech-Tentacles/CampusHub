import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Bell as BellIcon,
  FileText,
  Calendar,
  ClipboardList,
  User,
  Settings,
  LogOut,
  Users,
  GraduationCap,
  MessageSquare,
  BarChart3,
  QrCode,
  BookOpen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { user, logout } = useAuthStore();
  const [location] = useLocation();

  const mainItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
    },
    {
      title: "Notices",
      url: "/notices",
      icon: BellIcon,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
    },
    {
      title: "Calendar",
      url: "/schedule",
      icon: Calendar,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
    },
    {
      title: "Forms",
      url: "/forms",
      icon: FileText,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
    },

    {
      title: "Timetable",
      url: "/timetable",
      icon: ClipboardList,
      roles: ["FACULTY", "HOD", "DEAN", "ADMIN"],
    },
    {
      title: "Applications",
      url: "/applications",
      icon: FileText,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
    },
  ];

  const adminItems = [
    {
      title: "Manage Users",
      url: "/admin/users",
      icon: Users,
      roles: ["ADMIN", "DEAN"],
    },
    {
      title: "System Config",
      url: "/admin/config",
      icon: Settings,
      roles: ["ADMIN"],
    },
  ];

  const futureItems = [
    {
      title: "LMS",
      url: "/lms",
      icon: BookOpen,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageSquare,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
    },
    {
      title: "Attendance",
      url: "/attendance",
      icon: QrCode,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
      roles: ["FACULTY", "HOD", "DEAN", "ADMIN"],
    },
  ];

  const filteredMainItems = mainItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  const filteredAdminItems = adminItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  const filteredFutureItems = futureItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-semibold">CampusHub</h2>
            <p className="text-xs text-muted-foreground">University Portal</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link
                      href={item.url}
                      data-testid={`link-${item.title
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link
                        href={item.url}
                        data-testid={`link-${item.title
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredFutureItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Coming Soon</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredFutureItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link
                        href={item.url}
                        data-testid={`link-${item.title.toLowerCase()}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
