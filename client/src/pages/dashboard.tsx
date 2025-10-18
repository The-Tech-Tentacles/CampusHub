import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Bell,
  FileText,
  Calendar,
  ClipboardList,
  Clock,
  BookOpen,
  Code,
  Calculator,
  Users,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();

  const upcomingClasses = [
    {
      id: "1",
      title: "Data Structures Lab",
      subject: "Data Structures",
      time: "10:00 AM - 11:00 AM",
      location: "Lab 301",
      icon: Code,
      color: "primary",
    },
    {
      id: "2",
      title: "Operating Systems Lecture",
      subject: "Operating Systems",
      time: "11:30 AM - 12:30 PM",
      location: "Room 205",
      icon: Calculator,
      color: "coral",
    },
    {
      id: "3",
      title: "Database Management",
      subject: "Database Management",
      time: "4:00 PM - 5:00 PM",
      location: "Room 104",
      icon: BookOpen,
      color: "purple",
    },
  ];

  // Get current time and date
  const now = new Date();
  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const currentDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      title: "Unread Notices",
      value: "3",
      icon: Bell,
      description: "2 new today | urgent 1",
      color: "text-chart-1",
    },
    {
      title: "Forms",
      value: "5",
      icon: FileText,
      description: "Submitted 3 | To Fill 2 | Due 1 this week",
      color: "text-chart-2",
    },
    {
      title: "Classes Today",
      value: "4",
      icon: Calendar,
      description: "Attendance coming soon",
      color: "text-chart-3",
    },
    {
      title: "Applications",
      value: "4",
      icon: ClipboardList,
      description: "Under review 1 | Approved 3 | Rejected 0",
      color: "text-chart-4",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-xl" />
        <div className="relative bg-card/80 backdrop-blur-sm border rounded-xl p-3 sm:p-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.name || "Student"}!
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {currentDate} • {currentTime}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="hover:shadow-md transition-shadow duration-200"
          >
            {/* Mobile Layout - Horizontal Rectangle */}
            <div className="flex md:hidden items-center p-4 gap-4">
              <div className={`p-3 rounded-lg bg-secondary/50 flex-shrink-0`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <CardTitle className="text-sm font-medium truncate">
                    {stat.title}
                  </CardTitle>
                  <div className="text-xl font-bold ml-2">{stat.value}</div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {stat.description}
                </p>
              </div>
            </div>

            {/* Desktop Layout - Vertical Square */}
            <div className="hidden md:block">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {/* <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Notices</CardTitle>
              <Button variant="ghost" size="sm" data-testid="button-view-all-notices">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentNotices.map((notice) => (
              <div
                key={notice.id}
                className="flex items-start gap-3 p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer"
                data-testid={`notice-${notice.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{notice.title}</h4>
                    {notice.status === "unread" && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{notice.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card> */}

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-3 sm:p-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Today's Schedule
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    3 upcoming events
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="self-start sm:self-auto text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                  data-testid="button-view-schedule"
                  onClick={() => setLocation("/timetable")}
                >
                  View All
                </Button>
              </div>
            </div>

            {/* Schedule Items */}
            <div className="space-y-3 sm:space-y-4">
              {upcomingClasses.map((event, index) => (
                <div
                  key={event.id}
                  className="group rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 border border-border/50 hover:border-border overflow-hidden"
                  data-testid={`class-${event.id}`}
                >
                  {/* Mobile Layout */}
                  <div className="flex sm:hidden flex-col p-3 space-y-3">
                    {/* Top Row: Icon, Title, and Time */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${
                          event.color === "coral"
                            ? "bg-red-100 dark:bg-red-900"
                            : event.color === "primary"
                            ? "bg-blue-100 dark:bg-blue-900"
                            : "bg-purple-100 dark:bg-purple-900"
                        }`}
                      >
                        <event.icon
                          className={`h-4 w-4 ${
                            event.color === "coral"
                              ? "text-red-600 dark:text-red-400"
                              : event.color === "primary"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-purple-600 dark:text-purple-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm leading-tight">
                          {event.title}
                        </h4>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="font-bold text-foreground text-xs bg-primary/20 px-2 py-1 rounded-md">
                          {event.time}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Subject and Location */}
                    <div className="flex items-center gap-2 text-muted-foreground text-xs pl-11">
                      <span className="truncate">{event.subject}</span>
                      <span>•</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center gap-4 p-4">
                    <div
                      className={`p-3 rounded-lg flex-shrink-0 ${
                        event.color === "coral"
                          ? "bg-red-100 dark:bg-red-900"
                          : event.color === "primary"
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "bg-purple-100 dark:bg-purple-900"
                      }`}
                    >
                      <event.icon
                        className={`h-5 w-5 ${
                          event.color === "coral"
                            ? "text-red-600 dark:text-red-400"
                            : event.color === "primary"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-purple-600 dark:text-purple-400"
                        }`}
                      />
                    </div>

                    <div className="flex flex-1 min-w-0 flex-row items-center justify-between">
                      <div className="flex flex-col items-start min-w-0">
                        <h4 className="font-semibold text-foreground text-base">
                          {event.title}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {event.subject} • {event.location}
                        </p>
                      </div>
                      <div className="flex items-center ml-4">
                        <p className="font-bold text-foreground text-base bg-primary/15 px-3 py-1.5 rounded-md">
                          {event.time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {user?.role !== "STUDENT" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <h4 className="font-medium text-sm">
                      Student Leave Application
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Submitted 2 hours ago
                    </p>
                  </div>
                  <Button size="sm" data-testid="button-review">
                    Review
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <h4 className="font-medium text-sm">
                      Notice Approval Request
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Submitted yesterday
                    </p>
                  </div>
                  <Button size="sm" data-testid="button-review">
                    Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Students</span>
                </div>
                <span className="font-bold">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Active Forms</span>
                </div>
                <span className="font-bold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Pending Reviews</span>
                </div>
                <span className="font-bold">8</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
