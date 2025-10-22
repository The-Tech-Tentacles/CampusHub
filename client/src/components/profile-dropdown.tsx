import {
  User,
  Settings,
  LogOut,
  Palette,
  UserCircle,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/lib/theme-provider";
import { useLocation } from "wouter";

export function ProfileDropdown() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-all duration-200 p-0"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-base">
              {user?.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 mr-2 sm:mr-0 border shadow-lg bg-background/95 backdrop-blur-sm rounded-2xl"
      >
        {/* Enhanced User Info Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl" />
          <DropdownMenuLabel className="relative p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-lg">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base leading-tight mb-1">
                  {user?.name?.split(" ")[0] || "User"}!
                </p>
                <p className="text-xs text-muted-foreground/80 truncate font-medium">
                  {user?.department || "user@campushub.com"}
                  {/* draw dot sperater*/}
                  <span className="mx-1 text-muted-foreground"> • </span>
                  {user?.year || "40xx"}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
        </div>

        <DropdownMenuSeparator className="border-primary/10" />

        {/* Elegant Menu Items */}
        <div className="p-2 space-y-1">
          <DropdownMenuItem
            className="group rounded-lg px-3 py-3 cursor-pointer hover:bg-primary/5 focus:bg-blue-100 dark:focus:bg-blue-950/30 transition-all duration-200"
            onClick={() => setLocation("/profile")}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <span className="font-medium">View Profile</span>
                <p className="text-xs text-muted-foreground">
                  Manage your account
                </p>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="group rounded-lg px-3 py-3 cursor-pointer hover:bg-primary/5 focus:bg-blue-100 dark:focus:bg-blue-950/30 transition-all duration-200"
            onClick={toggleTheme}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                {theme === "light" ? (
                  <Moon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Sun className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div className="flex-1">
                <span className="font-medium">
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </span>
                <p className="text-xs text-muted-foreground">
                  Switch to {theme === "light" ? "dark" : "light"} theme
                </p>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className="group rounded-lg px-3 py-3 cursor-pointer hover:bg-primary/5 focus:bg-blue-100 dark:focus:bg-blue-950/30 transition-all duration-200">
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-950/30 group-hover:bg-gray-100 dark:group-hover:bg-gray-900/50 transition-colors">
                <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <span className="font-medium">Settings</span>
                <p className="text-xs text-muted-foreground">
                  Preferences & more
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="border-primary/10" />

        {/* Logout Section */}
        <div className="p-2">
          <DropdownMenuItem
            className="group rounded-lg px-3 py-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30 transition-all duration-200 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <span className="font-medium">Sign Out</span>
                <p className="text-xs text-muted-foreground">
                  See you later! 👋
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
