import {
  Bell,
  Check,
  Sparkles,
  AlertCircle,
  FileText,
  Calendar,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotificationsStore } from "@/stores/notifications-store";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationsStore();

  // Helper function to get notification icon and color based on type
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "NOTICE":
        return {
          icon: AlertCircle,
          color: "text-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-950/30",
        };
      case "FORM":
        return {
          icon: FileText,
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-950/30",
        };
      case "APPLICATION":
        return {
          icon: Check,
          color: "text-purple-600",
          bgColor: "bg-purple-50 dark:bg-purple-950/30",
        };
      case "SYSTEM":
        return {
          icon: Settings,
          color: "text-orange-600",
          bgColor: "bg-orange-50 dark:bg-orange-950/30",
        };
      default:
        return {
          icon: Bell,
          color: "text-gray-600",
          bgColor: "bg-gray-50 dark:bg-gray-950/30",
        };
    }
  };

  // Helper function to format relative time elegantly
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/15 transition-all duration-200 p-0 border-0"
          data-testid="button-notifications"
        >
          <Bell
            className={`h-5 w-5 transition-colors duration-200 ${
              unreadCount > 0 ? "text-primary" : "text-muted-foreground"
            }`}
          />
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-background transform translate-x-1/2 -translate-y-1/2" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 border shadow-lg bg-background/95 backdrop-blur-sm mr-2 sm:mr-0 rounded-2xl"
      >
        {/* Header with gradient background */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 rounded-2xl" />
          <div className="relative flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Notifications</h3>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0
                    ? `${unreadCount} new updates`
                    : "All caught up"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator className="border-primary/20" />
        <ScrollArea
          className="h-[420px]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="p-4 rounded-full bg-muted/30 mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <h4 className="font-semibold text-lg mb-2">All clear</h4>
              <p className="text-sm text-muted-foreground max-w-xs">
                You're up to date with all notifications
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const style = getNotificationStyle(notification.type);
                const IconComponent = style.icon;

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex items-start gap-4 p-0 cursor-pointer border-0 focus:bg-transparent"
                    onClick={() => markAsRead(notification.id)}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div
                      className={`group w-full rounded-xl p-4 transition-all duration-200 hover:bg-muted/50 border ${
                        !notification.readAt
                          ? "bg-primary/5 border-l-4 border-primary border-primary/20"
                          : "bg-muted/20 border-border/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Clean icon */}
                        <div className="flex-shrink-0">
                          <div
                            className={`p-2 rounded-lg ${style.bgColor} transition-colors duration-200`}
                          >
                            <IconComponent
                              className={`h-4 w-4 ${style.color}`}
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm leading-tight line-clamp-1 flex-1">
                              {notification.title}
                            </h4>
                            {!notification.readAt && (
                              <div className="flex-shrink-0">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                            {notification.body}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground/70">
                              {getTimeAgo(notification.createdAt)}
                            </span>

                            {!notification.readAt && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0.5 text-primary border-primary/30"
                              >
                                New
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Mark all read button at the bottom */}
        {unreadCount > 0 && notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="border-primary/20" />
            <div className="p-3">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="w-full text-xs font-medium hover:bg-primary/10 transition-colors duration-200"
                data-testid="button-mark-all-read"
              >
                Mark all read
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
