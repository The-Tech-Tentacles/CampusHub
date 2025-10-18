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
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { navigate } from "wouter/use-browser-location";

export function AppSidebar() {
  const { user, logout } = useAuthStore();
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  // Close sidebar on mobile when navigating
  const handleMobileNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const mainItems = [
    {
      title: "Home",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
      emoji: "🏠",
    },
    {
      title: "Notices",
      url: "/notices",
      icon: BellIcon,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
      emoji: "📢",
    },
    {
      title: "Calendar",
      url: "/schedule",
      icon: Calendar,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
      emoji: "📅",
    },
    {
      title: "Forms",
      url: "/forms",
      icon: FileText,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
      emoji: "📝",
    },
    {
      title: "Timetable",
      url: "/timetable",
      icon: ClipboardList,
      roles: ["FACULTY", "HOD", "DEAN", "ADMIN"],
      emoji: "🗓️",
    },
    {
      title: "Applications",
      url: "/applications",
      icon: FileText,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
      emoji: "📋",
    },
  ];

  const adminItems = [
    {
      title: "Manage Users",
      url: "/admin/users",
      icon: Users,
      roles: ["ADMIN", "DEAN"],
      emoji: "👥",
    },
    {
      title: "System Config",
      url: "/admin/config",
      icon: Settings,
      roles: ["ADMIN"],
      emoji: "⚙️",
    },
  ];

  const futureItems = [
    {
      title: "LMS",
      url: "/lms",
      icon: BookOpen,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
      emoji: "📚",
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageSquare,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
      emoji: "💬",
    },
    {
      title: "Attendance",
      url: "/attendance",
      icon: QrCode,
      roles: ["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"],
      emoji: "✅",
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
      roles: ["FACULTY", "HOD", "DEAN", "ADMIN"],
      emoji: "📈",
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
      <SidebarHeader className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-3 shadow-lg">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 border-2 border-background animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                CampusHub
              </h2>
              {/* <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" /> */}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              University Portal
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="relative group overflow-hidden rounded-lg hover:bg-accent/50 transition-all duration-200 h-11"
                  >
                    <Link
                      href={item.url}
                      onClick={handleMobileNavigation}
                      data-testid={`link-${item.title
                        .toLowerCase()
                        .replace(" ", "-")}`}
                      className="flex items-center gap-3 px-3"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20 group-hover:bg-accent/40 transition-colors">
                        <span className="text-sm">{item.emoji}</span>
                      </div>
                      <span className="font-medium">{item.title}</span>
                      {location === item.url && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredAdminItems.length > 0 && (
          <>
            <Separator className="my-4 mx-3" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                <div className="flex items-center gap-2">
                  Administration
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0.5"
                  >
                    ADMIN
                  </Badge>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {filteredAdminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                        className="relative group overflow-hidden rounded-lg hover:bg-accent/50 transition-all duration-200 h-11"
                      >
                        <Link
                          href={item.url}
                          onClick={handleMobileNavigation}
                          data-testid={`link-${item.title
                            .toLowerCase()
                            .replace(" ", "-")}`}
                          className="flex items-center gap-3 px-3"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20 group-hover:bg-accent/40 transition-colors">
                            <span className="text-sm">{item.emoji}</span>
                          </div>
                          <span className="font-medium">{item.title}</span>
                          {location === item.url && (
                            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {filteredFutureItems.length > 0 && (
          <>
            <Separator className="my-4 mx-3" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                <div className="flex items-center gap-2">
                  Coming Soon
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0.5 border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                  >
                    SOON
                  </Badge>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {filteredFutureItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                        className="relative group overflow-hidden rounded-lg hover:bg-accent/30 transition-all duration-200 h-11 opacity-60"
                      >
                        <Link
                          href={item.url}
                          onClick={handleMobileNavigation}
                          data-testid={`link-${item.title.toLowerCase()}`}
                          className="flex items-center gap-3 px-3"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                            <span className="text-sm">{item.emoji}</span>
                          </div>
                          <span className="font-medium">{item.title}</span>
                          <div className="ml-auto">
                            <Badge
                              variant="secondary"
                              className="text-[8px] px-1 py-0.5"
                            >
                              SOON
                            </Badge>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/40">
        <div className="space-y-4" onClick={() => navigate("/profile")}>
          {/* User Profile Section */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-accent/50 via-accent/20 to-accent/10 border border-border/20">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
              {/* Department and Year for Students */}
              <div className="flex items-center gap-2 mt-1">
                {user?.department && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5"
                  >
                    {user.department}
                  </Badge>
                )}
                {user?.year && user?.role === "STUDENT" && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                    {user.year}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-11 rounded-lg border-border/40 hover:border-border hover:bg-accent/50 transition-all duration-200 group"
            onClick={logout}
            data-testid="button-logout"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 group-hover:bg-red-100 dark:group-hover:bg-red-950/50 transition-colors">
              <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
