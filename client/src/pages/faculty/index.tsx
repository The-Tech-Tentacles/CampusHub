import { useAuthStore } from "@/stores/auth-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  BookOpen,
  FileText,
  Calendar,
  Bell,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BarChart3,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function FacultyDashboard() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const [facultyStats, setFacultyStats] = useState({
    mentees: 0,
    pendingReviews: 0,
    activeForms: 0,
    notices: 0,
    upcomingEvents: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user && (user.role === "FACULTY" || user.role === "HOD")) {
      fetchFacultyStats();
      fetchActiveForms();
    }
  }, [user]);

  const fetchFacultyStats = async () => {
    try {
      setStatsLoading(true);
      const response = await api.getFacultyStats();
      if (response.success && response.data) {
        setFacultyStats((prev) => ({
          ...prev,
          mentees: (response.data as any).mentees || 0,
          pendingReviews: (response.data as any).pendingReviews || 0,
          notices: (response.data as any).notices || 0,
          upcomingEvents: (response.data as any).upcomingEvents || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching faculty stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchActiveForms = async () => {
    try {
      const response = await api.getMyForms();
      if (response.success && response.data) {
        const activeForms = (response.data as any[]).filter(
          (form) => form.status === "ACTIVE"
        ).length;
        setFacultyStats((prev) => ({
          ...prev,
          activeForms,
        }));
      }
    } catch (error) {
      console.error("Error fetching active forms:", error);
    }
  };

  if (!user) {
    setLocation("/login");
    return null;
  }

  const commonStats = [
    {
      title: "Active Forms",
      value: statsLoading ? "..." : facultyStats.activeForms.toString(),
      description: "Currently accepting responses",
      icon: FileText,
      color: "purple",
      link: "/faculty/forms",
      trend: statsLoading
        ? "Loading..."
        : facultyStats.activeForms === 0
        ? "No active forms"
        : "Open for submissions",
    },
    {
      title: "Mentees",
      value: statsLoading ? "..." : facultyStats.mentees.toString(),
      description: "Students assigned",
      icon: Award,
      color: "green",
      link: "/faculty/mentees",
      trend: statsLoading
        ? "Loading..."
        : facultyStats.mentees === 0
        ? "No mentees"
        : "All active",
    },
    {
      title: "Pending Reviews",
      value: statsLoading ? "..." : facultyStats.pendingReviews.toString(),
      description: "Forms & Applications",
      icon: CheckCircle2,
      color: "orange",
      link: "/faculty/applications",
      trend: statsLoading
        ? "Loading..."
        : facultyStats.pendingReviews === 0
        ? "No pending items"
        : `${facultyStats.pendingReviews} awaiting`,
    },
    {
      title: "Notices",
      value: statsLoading ? "..." : facultyStats.notices.toString(),
      description: "Posted by you",
      icon: Bell,
      color: "blue",
      link: "/faculty/notices",
      trend: statsLoading
        ? "Loading..."
        : facultyStats.notices === 0
        ? "No notices yet"
        : "Active communications",
    },
    {
      title: "Calendar/Events",
      value: statsLoading ? "..." : facultyStats.upcomingEvents.toString(),
      description: "Scheduled by you",
      icon: Calendar,
      color: "indigo",
      link: "/faculty/schedule",
      trend: statsLoading
        ? "Loading..."
        : facultyStats.upcomingEvents === 0
        ? "No events scheduled"
        : "Events planned",
    },
  ];

  const stats = commonStats;

  // Upcoming classes/events
  const upcomingClasses = [
    {
      course: "Data Structures & Algorithms",
      type: "Lecture",
      time: "10:00 AM - 11:00 AM",
      room: "Lab 301",
      students: 45,
      status: "upcoming",
    },
    {
      course: "Database Management Systems",
      type: "Lab",
      time: "02:00 PM - 04:00 PM",
      room: "Room 204",
      students: 38,
      status: "upcoming",
    },
    {
      course: "Computer Networks",
      type: "Lecture",
      time: "Tomorrow 09:00 AM",
      room: "Room 105",
      students: 44,
      status: "scheduled",
    },
  ];

  // Recent activities
  const recentActivities = [
    {
      type: "submission",
      title: "New Assignment Submissions",
      description: "15 students submitted DSA Project 2",
      time: "2 hours ago",
      icon: FileText,
      color: "blue",
    },
    {
      type: "form",
      title: "Form Approval Request",
      description: "Leave application from Raj Kumar",
      time: "3 hours ago",
      icon: AlertCircle,
      color: "orange",
    },
    {
      type: "grade",
      title: "Grade Entry Reminder",
      description: "Mid-term exam grades due in 2 days",
      time: "5 hours ago",
      icon: Clock,
      color: "red",
    },
    {
      type: "mentee",
      title: "Mentee Meeting Request",
      description: "Sarah wants to discuss career guidance",
      time: "Yesterday",
      icon: Users,
      color: "green",
    },
  ];

  const getStatColor = (color: string) => {
    const colors = {
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      purple:
        "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      orange:
        "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      green:
        "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
      indigo:
        "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getActivityColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-900/30",
      orange: "bg-orange-100 dark:bg-orange-900/30",
      red: "bg-red-100 dark:bg-red-900/30",
      green: "bg-green-100 dark:bg-green-900/30",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-9xl mx-auto">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Welcome, {user.name}! 👋</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            onClick={() => stat.link && setLocation(stat.link)}
            role={stat.link ? "button" : undefined}
            className={`border-0 shadow-md ${
              stat.link
                ? "cursor-pointer hover:shadow-lg transition-shadow"
                : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${getStatColor(stat.color)}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className="flex items-center gap-1 pt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">{stat.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Classes */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>
                  Your upcoming classes and sessions
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/student/schedule")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses.map((cls, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{cls.course}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {cls.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {cls.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {cls.students} students
                        </span>
                        <span>{cls.room}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div
                    className={`p-2 rounded-lg ${getActivityColor(
                      activity.color
                    )}`}
                  >
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
