import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Footer } from "@/components/footer";
import {
  Bell,
  FileText,
  Calendar,
  ClipboardList,
  Clock,
  BookOpen,
  Code,
  Users,
  Eye,
  ArrowRight,
} from "lucide-react";
import {
  dataService,
  Notice,
  TimetableSlot,
  getTypeIcon,
  getTypeColor,
} from "@/services/dataService";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();

  // State for data from centralized service
  const [todaySchedule, setTodaySchedule] = useState<
    (TimetableSlot & { time: string })[]
  >([]);
  const [todayNotices, setTodayNotices] = useState<Notice[]>([]);
  const [stats, setStats] = useState({
    classesToday: 0,
    totalNotices: 0,
    unreadNotices: 0,
    pendingApplications: 0,
    activeForms: 0,
    totalUsers: 0,
    // Detailed counts
    submittedForms: 0,
    missedForms: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    underReviewApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showNoticesArrow, setShowNoticesArrow] = useState(true);
  const [showScheduleArrow, setShowScheduleArrow] = useState(true);

  // Handle scroll events to show/hide arrows
  const handleNoticesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
    setShowNoticesArrow(!isAtBottom);
  };

  const handleScheduleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
    setShowScheduleArrow(!isAtBottom);
  };

  // Load data from centralized service
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load all data in parallel
        const [schedule, notices, dashboardStats] = await Promise.all([
          dataService.getTodaySchedule(),
          dataService.getNotices({ today: true }),
          dataService.getStats(user?.role),
        ]);

        setTodaySchedule(schedule);
        setTodayNotices(notices);
        setStats(dashboardStats);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.role]);

  // Time-based greeting function
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "Good Night 🌙";
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 17) return "Good Afternoon 🌤️";
    if (hour < 21) return "Good Evening 🌅";
    return "Good Night 🌙";
  };

  // Helper function to transform timetable data for display
  const transformScheduleForDisplay = (
    schedule: (TimetableSlot & { time: string })[]
  ) => {
    return schedule.map((item, index) => {
      const getIcon = (type: string) => {
        switch (type) {
          case "Lab":
            return Code;
          case "Seminar":
            return Users;
          case "Break":
            return Clock;
          default:
            return BookOpen;
        }
      };

      const getColor = (type: string) => {
        switch (type) {
          case "Lab":
            return "primary";
          case "Seminar":
            return "purple";
          case "Break":
            return "break";
          default:
            return "coral";
        }
      };

      return {
        id: `today-${index + 1}`,
        title: `${item.subject} ${item.type}`,
        subject: item.subject,
        time: item.time,
        location: item.room,
        type: item.type,
        icon: getIcon(item.type),
        color: getColor(item.type),
      };
    });
  };

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

  // Helper function to get current and next class initials
  const getCurrentAndNextClass = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

    // Convert time string to minutes for comparison
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let totalMinutes = hours * 60 + minutes;
      if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
      if (period === "AM" && hours === 12) totalMinutes -= 12 * 60;
      return totalMinutes;
    };

    // Sort schedule by time
    const sortedSchedule = [...todaySchedule].sort(
      (a, b) => parseTime(a.time) - parseTime(b.time)
    );

    let currentClass = null;
    let nextClass = null;

    for (let i = 0; i < sortedSchedule.length; i++) {
      const classTime = parseTime(sortedSchedule[i].time);
      const classEndTime = classTime + 60; // Assume 1 hour duration

      // Check if class is currently ongoing (within 1 hour of start time)
      if (currentTime >= classTime && currentTime < classEndTime) {
        currentClass = sortedSchedule[i];
        nextClass = sortedSchedule[i + 1] || null;
        break;
      }
      // Check if this is the next upcoming class
      else if (classTime > currentTime && !nextClass) {
        nextClass = sortedSchedule[i];
        break;
      }
    }

    // Get initials from subject name with color based on type
    const getInitials = (subject: string, type: string) => {
      const initials = subject
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase();

      const color =
        type === "Lab"
          ? "text-green-600 dark:text-green-400"
          : "text-blue-600 dark:text-blue-400";
      return { initials, color };
    };

    if (stats.classesToday === 0) {
      return "No classes scheduled";
    }

    const currentInfo = currentClass
      ? getInitials(currentClass.subject, currentClass.type)
      : null;
    const nextInfo = nextClass
      ? getInitials(nextClass.subject, nextClass.type)
      : null;

    // Return plain text for now since description expects string
    const currentText = currentInfo
      ? `Current: ${currentInfo.initials}`
      : "Current: None";

    const nextText = nextInfo ? `Next: ${nextInfo.initials}` : "Next: None";

    return `${currentText} • ${nextText}`;
  };

  // Helper function to get current and next class with colored JSX
  const getCurrentAndNextClassJSX = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let totalMinutes = hours * 60 + minutes;
      if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
      if (period === "AM" && hours === 12) totalMinutes -= 12 * 60;
      return totalMinutes;
    };

    const sortedSchedule = [...todaySchedule].sort(
      (a, b) => parseTime(a.time) - parseTime(b.time)
    );

    let currentClass = null;
    let nextClass = null;

    for (let i = 0; i < sortedSchedule.length; i++) {
      const classTime = parseTime(sortedSchedule[i].time);
      const classEndTime = classTime + 60;

      if (currentTime >= classTime && currentTime < classEndTime) {
        currentClass = sortedSchedule[i];
        nextClass = sortedSchedule[i + 1] || null;
        break;
      } else if (classTime > currentTime && !nextClass) {
        nextClass = sortedSchedule[i];
        break;
      }
    }

    const getInitials = (subject: string) => {
      return subject
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase();
    };

    const getDisplayText = (classItem: any) => {
      if (classItem.type === "Break") {
        return "Break";
      }
      return getInitials(classItem.subject);
    };

    if (stats.classesToday === 0) {
      return <span>No classes scheduled</span>;
    }

    return (
      <span className="flex flex-wrap items-center gap-1">
        <span>Current:</span>
        {currentClass ? (
          <span
            className={
              currentClass.type === "Break"
                ? "text-gray-600 dark:text-gray-400 font-semibold"
                : currentClass.type === "Lab"
                ? "text-green-600 dark:text-green-400 font-semibold"
                : "text-blue-600 dark:text-blue-400 font-semibold"
            }
          >
            {getDisplayText(currentClass)}
          </span>
        ) : (
          <span>None</span>
        )}
        <span>•</span>
        <span>Next:</span>
        {nextClass ? (
          <span
            className={
              nextClass.type === "Break"
                ? "text-gray-600 dark:text-gray-400 font-semibold"
                : nextClass.type === "Lab"
                ? "text-green-600 dark:text-green-400 font-semibold"
                : "text-blue-600 dark:text-blue-400 font-semibold"
            }
          >
            {getDisplayText(nextClass)}
          </span>
        ) : (
          <span>None</span>
        )}
      </span>
    );
  };

  // Create display stats array from centralized data
  const displayStats = [
    {
      title: "Classes Today",
      value: stats.classesToday.toString(),
      icon: Calendar,
      description: getCurrentAndNextClass(),
      color: "text-chart-3",
      link: "/timetable",
    },
    {
      title: "Pending Forms",
      value: stats.activeForms.toString(),
      icon: FileText,
      description: `${stats.submittedForms} submitted • ${stats.missedForms} missed`,
      color: "text-chart-2",
      link: "/forms",
    },
    {
      title: "Pending Applications",
      value: (
        stats.pendingApplications + stats.underReviewApplications
      ).toString(),
      icon: ClipboardList,
      description: `${stats.approvedApplications} approved • ${stats.rejectedApplications} rejected`,
      color: "text-chart-4",
      link: "/applications",
    },
  ];

  // Transform today's schedule for display
  const displaySchedule = transformScheduleForDisplay(todaySchedule);

  if (loading) {
    return (
      <div className="space-y-6 p-2">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl mb-6"></div>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg"
              ></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-xl" />
        <div className="relative bg-card/80 backdrop-blur-sm border rounded-xl p-3 sm:p-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {getTimeBasedGreeting()}, {user?.name || "Student"}!
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {currentDate} • {currentTime}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {displayStats.map((stat) => (
          <Card
            key={stat.title}
            className="hover:shadow-md transition-shadow duration-200"
            onClick={() => setLocation(stat.link!)}
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
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {stat.title === "Classes Today"
                    ? getCurrentAndNextClassJSX()
                    : stat.description}
                </div>
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
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.title === "Classes Today"
                    ? getCurrentAndNextClassJSX()
                    : stat.description}
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Notices - Today's Notices Only */}
      {todayNotices.length > 0 && (
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 flex-shrink-0">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    Recent Notices
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {todayNotices.length} new notice
                    {todayNotices.length !== 1 ? "s" : ""} today
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                onClick={() => setLocation("/notices")}
                data-testid="button-view-all-notices"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 relative">
            <div
              className="max-h-80 overflow-y-auto space-y-3 sm:space-y-4"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              onScroll={handleNoticesScroll}
            >
              {todayNotices.map((notice) => {
                const IconComponent = getTypeIcon(notice.type);
                return (
                  <div
                    key={notice.id}
                    className="group rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 border border-border/50 hover:border-border overflow-hidden cursor-pointer"
                    data-testid={`notice-${notice.id}`}
                    onClick={() => setLocation("/notices")}
                  >
                    {/* Mobile Layout */}
                    <div className="flex sm:hidden flex-col p-3 space-y-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 ${
                            notice.type === "urgent"
                              ? "bg-red-100 dark:bg-red-900"
                              : notice.type === "important"
                              ? "bg-amber-100 dark:bg-amber-900"
                              : "bg-blue-100 dark:bg-blue-900"
                          }`}
                        >
                          <IconComponent
                            className={`h-4 w-4 ${
                              notice.type === "urgent"
                                ? "text-red-600 dark:text-red-400"
                                : notice.type === "important"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                              {notice.title}
                            </h4>
                            {!notice.isRead && (
                              <div className="h-2 w-2 rounded-full bg-primary animate-pulse flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {notice.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-2 py-0.5 ${getTypeColor(
                                notice.type
                              )}`}
                            >
                              {notice.type.toUpperCase()}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              by {notice.createdBy}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-start gap-4 p-4">
                      <div
                        className={`p-3 rounded-lg flex-shrink-0 ${
                          notice.type === "urgent"
                            ? "bg-red-100 dark:bg-red-900"
                            : notice.type === "important"
                            ? "bg-amber-100 dark:bg-amber-900"
                            : "bg-blue-100 dark:bg-blue-900"
                        }`}
                      >
                        <IconComponent
                          className={`h-5 w-5 ${
                            notice.type === "urgent"
                              ? "text-red-600 dark:text-red-400"
                              : notice.type === "important"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        />
                      </div>
                      <div className="flex flex-1 min-w-0 justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            <h4 className="font-semibold text-foreground text-base line-clamp-1">
                              {notice.title}
                            </h4>
                            {!notice.isRead && (
                              <div className="h-2 w-2 rounded-full bg-primary animate-pulse flex-shrink-0 mt-2" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {notice.content}
                          </p>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="secondary"
                              className={`text-xs px-2 py-1 ${getTypeColor(
                                notice.type
                              )}`}
                            >
                              {notice.type.toUpperCase()}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              by {notice.createdBy}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center ml-4">
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Animated scroll indicator for notices */}
            {todayNotices.length > 3 && showNoticesArrow && (
              <div className="absolute bottom-3 right-3 pointer-events-none">
                <div className="animate-bounce bg-primary/10 backdrop-blur-sm rounded-full p-2">
                  <ArrowRight className="h-3 w-3 text-primary rotate-90" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-3 sm:p-6 relative">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900 flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Today's Timetable
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {
                          displaySchedule.filter(
                            (item) => item.type === "Lecture"
                          ).length
                        }{" "}
                        Lectures
                      </span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {
                          displaySchedule.filter((item) => item.type === "Lab")
                            .length
                        }{" "}
                        Labs
                      </span>
                    </span>
                    {displaySchedule.filter((item) => item.type === "Seminar")
                      .length > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            {
                              displaySchedule.filter(
                                (item) => item.type === "Seminar"
                              ).length
                            }{" "}
                            Seminars
                          </span>
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="self-start sm:self-auto text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                  data-testid="button-view-schedule"
                  onClick={() => setLocation("/timetable")}
                >
                  View All Days
                </Button>
              </div>
            </div>

            {/* Schedule Items */}
            <div
              className="max-h-80 overflow-y-auto"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              onScroll={handleScheduleScroll}
            >
              <div className="space-y-3 sm:space-y-4">
                {displaySchedule.length > 0 ? (
                  displaySchedule.map((event, index) => (
                    <div
                      key={event.id}
                      className="group rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 border border-border/50 hover:border-border overflow-hidden"
                      data-testid={`class-${event.id}`}
                    >
                      {/* Mobile Layout */}
                      <div className="flex sm:hidden flex-col p-3">
                        {/* Top Row: Icon, Title, and Time */}
                        <div className="flex items-center gap-3 mb-1">
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 ${
                              event.color === "coral"
                                ? "bg-blue-100 dark:bg-blue-900"
                                : event.color === "primary"
                                ? "bg-green-100 dark:bg-green-900"
                                : event.color === "break"
                                ? "bg-purple-100 dark:bg-purple-900"
                                : "bg-purple-100 dark:bg-purple-900"
                            }`}
                          >
                            <event.icon
                              className={`h-4 w-4 ${
                                event.color === "coral"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : event.color === "primary"
                                  ? "text-green-600 dark:text-green-400"
                                  : event.color === "break"
                                  ? "text-purple-600 dark:text-purple-400"
                                  : "text-purple-600 dark:text-purple-400"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-sm leading-tight mb-0">
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
                        <div className="flex items-center gap-2 text-muted-foreground text-xs pl-11 mt-0">
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
                              ? "bg-blue-100 dark:bg-blue-900"
                              : event.color === "primary"
                              ? "bg-green-100 dark:bg-green-900"
                              : event.color === "break"
                              ? "bg-purple-100 dark:bg-purple-900"
                              : "bg-purple-100 dark:bg-purple-900"
                          }`}
                        >
                          <event.icon
                            className={`h-5 w-5 ${
                              event.color === "coral"
                                ? "text-blue-600 dark:text-blue-400"
                                : event.color === "primary"
                                ? "text-green-600 dark:text-green-400"
                                : event.color === "break"
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-purple-600 dark:text-purple-400"
                            }`}
                          />
                        </div>

                        <div className="flex flex-1 min-w-0 flex-row items-center justify-between">
                          <div className="flex flex-col items-start min-w-0 gap-1">
                            <h4 className="font-semibold text-foreground text-base leading-tight mb-0">
                              {event.title}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate leading-tight mt-0">
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h4 className="text-lg font-medium text-muted-foreground mb-2">
                      No Classes Today
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enjoy your free day! Check the full timetable for upcoming
                      classes.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation("/timetable")}
                      className="text-xs px-4 py-2"
                    >
                      View Full Timetable
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {/* Animated scroll indicator for schedule */}
            {displaySchedule.length > 3 && showScheduleArrow && (
              <div className="absolute bottom-3 right-3 pointer-events-none">
                <div className="animate-bounce bg-primary/10 backdrop-blur-sm rounded-full p-2">
                  <ArrowRight className="h-3 w-3 text-primary rotate-90" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
