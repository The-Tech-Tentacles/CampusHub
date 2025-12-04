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
  UserCheck,
  Building,
  ClipboardList,
  Target,
  TrendingDown,
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function HODDashboard() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const [hodStats, setHodStats] = useState({
    mentees: 0,
    pendingReviews: 0,
    activeForms: 0,
    departmentStudents: 0,
    departmentFaculty: 0,
    activeCourses: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === "HOD") {
      fetchHODStats();
      fetchActiveForms();
    }
  }, [user]);

  const fetchHODStats = async () => {
    try {
      setStatsLoading(true);
      const response = await api.getFacultyStats();
      if (response.success && response.data) {
        setHodStats((prev) => ({
          ...prev,
          mentees: (response.data as any).mentees || 0,
          pendingReviews: (response.data as any).pendingReviews || 0,
          departmentStudents: (response.data as any).departmentStudents || 0,
          departmentFaculty: (response.data as any).departmentFaculty || 0,
          activeCourses: (response.data as any).activeCourses || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching HOD stats:", error);
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
        setHodStats((prev) => ({
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

  // Department stats for HOD
  const departmentStats = [
    {
      title: "Department Students",
      value: statsLoading ? "..." : hodStats.departmentStudents.toString(),
      description: "Total enrolled students",
      icon: GraduationCap,
      color: "blue",
      trend: statsLoading ? "Loading..." : "+12 from last year",
    },
    {
      title: "Faculty Members",
      value: statsLoading ? "..." : hodStats.departmentFaculty.toString(),
      description: "Teaching staff",
      icon: Users,
      color: "purple",
      trend: statsLoading ? "Loading..." : "+2 this year",
    },
    {
      title: "Active Courses",
      value: statsLoading ? "..." : hodStats.activeCourses.toString(),
      description: "This semester",
      icon: BookOpen,
      color: "green",
      trend: statsLoading ? "Loading..." : "8 lab sessions",
    },
    {
      title: "Pending Reviews",
      value: statsLoading ? "..." : hodStats.pendingReviews.toString(),
      description: "Applications & Forms",
      icon: ClipboardList,
      color: "orange",
      trend: statsLoading
        ? "Loading..."
        : hodStats.pendingReviews === 0
        ? "All clear"
        : `${hodStats.pendingReviews} awaiting`,
    },
    {
      title: "Active Forms",
      value: statsLoading ? "..." : hodStats.activeForms.toString(),
      description: "Currently accepting responses",
      icon: FileText,
      color: "indigo",
      trend: statsLoading
        ? "Loading..."
        : hodStats.activeForms === 0
        ? "No active forms"
        : "Open for submissions",
    },
    {
      title: "My Mentees",
      value: statsLoading ? "..." : hodStats.mentees.toString(),
      description: "Students assigned to you",
      icon: Award,
      color: "pink",
      trend: statsLoading
        ? "Loading..."
        : hodStats.mentees === 0
        ? "No mentees"
        : "All active",
    },
  ];

  // Quick action cards for HOD
  const quickActions = [
    {
      title: "Department Notices",
      description: "Manage announcements",
      icon: Bell,
      route: "/hod/notices",
      color: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Review Applications",
      description: "Student requests & approvals",
      icon: CheckCircle2,
      route: "/hod/applications",
      color: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Forms Management",
      description: "Create & review forms",
      icon: FileText,
      route: "/hod/forms",
      color: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Schedule",
      description: "View teaching schedule",
      icon: Calendar,
      route: "/hod/schedule",
      color: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
  ];

  // Department performance metrics
  const performanceMetrics = [
    {
      title: "Student Attendance",
      value: "87.5%",
      change: "+2.3%",
      isPositive: true,
      icon: UserCheck,
      color: "green",
    },
    {
      title: "Course Completion",
      value: "94.2%",
      change: "+1.8%",
      isPositive: true,
      icon: Target,
      color: "blue",
    },
    {
      title: "Pending Approvals",
      value: statsLoading ? "..." : hodStats.pendingReviews.toString(),
      change: statsLoading
        ? "..."
        : hodStats.pendingReviews > 5
        ? "High"
        : "Normal",
      isPositive: hodStats.pendingReviews <= 5,
      icon: ClipboardList,
      color: hodStats.pendingReviews > 5 ? "red" : "orange",
    },
    {
      title: "Active Faculty",
      value: statsLoading ? "..." : hodStats.departmentFaculty.toString(),
      change: "100%",
      isPositive: true,
      icon: Users,
      color: "purple",
    },
  ];

  // Recent department activities
  const recentActivities = [
    {
      type: "application",
      title: "New Leave Application",
      description: `${hodStats.pendingReviews} applications pending HOD approval`,
      time: "1 hour ago",
      icon: AlertCircle,
      color: "orange",
      action: "/hod/applications",
    },
    {
      type: "form",
      title: "Form Submissions",
      description: `${hodStats.activeForms} active forms collecting responses`,
      time: "2 hours ago",
      icon: FileText,
      color: "blue",
      action: "/hod/forms",
    },
    {
      type: "notice",
      title: "Department Meeting",
      description: "Faculty meeting scheduled for tomorrow",
      time: "4 hours ago",
      icon: Bell,
      color: "purple",
      action: "/hod/notices",
    },
    {
      type: "mentee",
      title: "Mentee Check-in",
      description: `${hodStats.mentees} mentees under your guidance`,
      time: "Yesterday",
      icon: Users,
      color: "green",
      action: "/hod/applications",
    },
  ];

  // Year-wise student distribution
  const yearDistribution = [
    { year: "First Year", count: 120, percentage: 27 },
    { year: "Second Year", count: 115, percentage: 26 },
    { year: "Third Year", count: 108, percentage: 24 },
    { year: "Fourth Year", count: 107, percentage: 23 },
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
      pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800",
      red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getActivityColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-900/30",
      orange: "bg-orange-100 dark:bg-orange-900/30",
      red: "bg-red-100 dark:bg-red-900/30",
      green: "bg-green-100 dark:bg-green-900/30",
      purple: "bg-purple-100 dark:bg-purple-900/30",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Welcome, Prof. {user.name}! 👋</h1>
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
          >
            <Briefcase className="h-3 w-3 mr-1" />
            Head of Department
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {user.department || "Your Department"} - Manage faculty resources,
          student progress, and departmental operations
        </p>
      </div>

      {/* Department Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departmentStats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-md">
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

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="cursor-pointer hover:shadow-lg transition-all border-0 shadow-md"
              onClick={() => setLocation(action.route)}
            >
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div
                    className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}
                  >
                    <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <div className="flex items-center text-sm font-medium text-primary">
                    Open <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Metrics & Year Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Metrics */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Department Performance
            </CardTitle>
            <CardDescription>
              Key performance indicators for{" "}
              {user.department || "your department"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {performanceMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-gradient-to-br from-background to-muted/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg ${getStatColor(metric.color)}`}
                    >
                      <metric.icon className="h-4 w-4" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs font-semibold ${
                        metric.isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {metric.isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {metric.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {metric.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Year-wise Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Student Distribution
            </CardTitle>
            <CardDescription>Year-wise enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {yearDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.year}</span>
                    <span className="text-muted-foreground">
                      {item.count} students
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Department Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Recent Department Activities
            </CardTitle>
            <CardDescription>
              Latest updates requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => setLocation(activity.action)}
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
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Summary */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-600" />
              Quick Summary
            </CardTitle>
            <CardDescription>
              {user.department || "Your Department"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">
                {statsLoading ? "..." : hodStats.departmentStudents}
              </p>
              <p className="text-xs text-muted-foreground">Across all years</p>
            </div>
            <div className="space-y-2 p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <p className="text-sm text-muted-foreground">Faculty Members</p>
              <p className="text-2xl font-bold">
                {statsLoading ? "..." : hodStats.departmentFaculty}
              </p>
              <p className="text-xs text-muted-foreground">Teaching staff</p>
            </div>
            <div className="space-y-2 p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <p className="text-sm text-muted-foreground">Active Programs</p>
              <p className="text-2xl font-bold">
                {statsLoading ? "..." : hodStats.activeCourses}
              </p>
              <p className="text-xs text-muted-foreground">This semester</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
