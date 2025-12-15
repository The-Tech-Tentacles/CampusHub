import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { useAuthStore, UserRole } from "@/stores/auth-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { dataService } from "@/services/dataService";
import { useEffect } from "react";

// Auth Pages
import Login from "@/pages/login";
import Register from "@/pages/register";

// Student Pages
import Dashboard from "@/pages/student/dashboard";
import Notices from "@/pages/student/notices";
import Forms from "@/pages/student/forms";
import Schedule from "@/pages/student/schedule";
import Timetable from "@/pages/student/timetable";
import Applications from "@/pages/student/applications";
import Profile from "@/pages/student/profile";

// Role-based Dashboard Pages
import FacultyDashboard from "@/pages/faculty";
import FacultyNotices from "@/pages/faculty/notices";
import FacultySchedule from "@/pages/faculty/schedule";
import FacultyForms from "@/pages/faculty/forms";
import FacultyApplications from "@/pages/faculty/applications";
import FacultyMentees from "@/pages/faculty/mentees";
import FacultyProfile from "@/pages/faculty/profile";
import HODDashboard from "@/pages/hod";
import DeanDashboard from "@/pages/dean";
import AdminDashboard from "@/pages/admin";

// Existing Admin Pages
import AdminUsers from "@/pages/admin/admin-users";
import AdminConfig from "@/pages/admin/admin-config";

import ComingSoon from "@/pages/coming-soon";
import NotFound from "@/pages/not-found";

function ProtectedRoute({
  component: Component,
  allowedRoles,
}: {
  component: React.ComponentType;
  allowedRoles?: UserRole[];
}) {
  const { isAuthenticated, isInitializing, user } = useAuthStore();

  // Wait for auth initialization to complete before checking authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Redirect to="/unauthorized" />;
  }

  return <Component />;
}

function RoleBasedRedirect() {
  const { user, isInitializing, getRoleDashboardPath } = useAuthStore();

  // Wait for auth initialization to complete
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Redirect to={getRoleDashboardPath()} />;
}

function Router() {
  const { isAuthenticated, isInitializing } = useAuthStore();

  return (
    <Switch>
      {/* Auth Routes - Public */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Student Routes - Also accessible by Faculty/HOD */}
      <Route path="/student/dashboard">
        {() => (
          <ProtectedRoute
            component={Dashboard}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/student/notices">
        {() => (
          <ProtectedRoute
            component={Notices}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/student/forms">
        {() => (
          <ProtectedRoute
            component={Forms}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/student/schedule">
        {() => (
          <ProtectedRoute
            component={Schedule}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/student/timetable">
        {() => (
          <ProtectedRoute
            component={Timetable}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/student/applications">
        {() => (
          <ProtectedRoute
            component={Applications}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/student/profile">
        {() => (
          <ProtectedRoute
            component={Profile}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>

      {/* Faculty Routes (includes HOD) */}
      <Route path="/faculty">
        {() => (
          <ProtectedRoute
            component={FacultyDashboard}
            allowedRoles={["FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/faculty/notices">
        {() => (
          <ProtectedRoute
            component={FacultyNotices}
            allowedRoles={["FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/faculty/mentees">
        {() => (
          <ProtectedRoute
            component={FacultyMentees}
            allowedRoles={["FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/faculty/schedule">
        {() => (
          <ProtectedRoute
            component={FacultySchedule}
            allowedRoles={["FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/faculty/forms">
        {() => (
          <ProtectedRoute
            component={FacultyForms}
            allowedRoles={["FACULTY", "HOD", "DEAN", "ADMIN"]}
          />
        )}
      </Route>
      <Route path="/faculty/applications">
        {() => (
          <ProtectedRoute
            component={FacultyApplications}
            allowedRoles={["FACULTY", "HOD", "DEAN", "ADMIN"]}
          />
        )}
      </Route>
      <Route path="/faculty/profile">
        {() => (
          <ProtectedRoute
            component={FacultyProfile}
            allowedRoles={["FACULTY", "HOD", "DEAN", "ADMIN"]}
          />
        )}
      </Route>

      {/* HOD Routes */}
      <Route path="/hod">
        {() => (
          <ProtectedRoute component={HODDashboard} allowedRoles={["HOD"]} />
        )}
      </Route>
      <Route path="/hod/notices">
        {() => (
          <ProtectedRoute component={FacultyNotices} allowedRoles={["HOD"]} />
        )}
      </Route>
      <Route path="/hod/schedule">
        {() => (
          <ProtectedRoute component={FacultySchedule} allowedRoles={["HOD"]} />
        )}
      </Route>
      <Route path="/hod/forms">
        {() => (
          <ProtectedRoute
            component={FacultyForms}
            allowedRoles={["HOD", "DEAN", "ADMIN"]}
          />
        )}
      </Route>
      <Route path="/hod/applications">
        {() => (
          <ProtectedRoute
            component={FacultyApplications}
            allowedRoles={["HOD", "DEAN", "ADMIN"]}
          />
        )}
      </Route>

      {/* Dean Routes */}
      <Route path="/dean">
        {() => (
          <ProtectedRoute component={DeanDashboard} allowedRoles={["DEAN"]} />
        )}
      </Route>
      <Route path="/dean/schedule">
        {() => (
          <ProtectedRoute component={FacultySchedule} allowedRoles={["DEAN"]} />
        )}
      </Route>

      {/* Admin Routes (Separate from Student Routes) */}
      <Route path="/admin">
        {() => (
          <ProtectedRoute component={AdminDashboard} allowedRoles={["ADMIN"]} />
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <ProtectedRoute
            component={AdminUsers}
            allowedRoles={["ADMIN", "DEAN", "HOD"]}
          />
        )}
      </Route>
      <Route path="/admin/config">
        {() => (
          <ProtectedRoute component={AdminConfig} allowedRoles={["ADMIN"]} />
        )}
      </Route>
      <Route path="/admin/schedule">
        {() => (
          <ProtectedRoute
            component={FacultySchedule}
            allowedRoles={["ADMIN"]}
          />
        )}
      </Route>

      {/* Backward Compatibility Routes - Also accessible by Faculty/HOD */}
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute
            component={Dashboard}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/notices">
        {() => (
          <ProtectedRoute
            component={Notices}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/forms">
        {() => (
          <ProtectedRoute
            component={Forms}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/schedule">
        {() => (
          <ProtectedRoute
            component={Schedule}
            allowedRoles={["STUDENT", "FACULTY", "HOD", "DEAN", "ADMIN"]}
          />
        )}
      </Route>
      <Route path="/timetable">
        {() => (
          <ProtectedRoute
            component={Timetable}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/applications">
        {() => (
          <ProtectedRoute
            component={Applications}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>
      <Route path="/profile">
        {() => (
          <ProtectedRoute
            component={Profile}
            allowedRoles={["STUDENT", "FACULTY", "HOD"]}
          />
        )}
      </Route>

      {/* Coming Soon Routes */}
      <Route path="/lms">
        {() => <ProtectedRoute component={ComingSoon} />}
      </Route>
      <Route path="/chat">
        {() => <ProtectedRoute component={ComingSoon} />}
      </Route>
      <Route path="/attendance">
        {() => <ProtectedRoute component={ComingSoon} />}
      </Route>
      <Route path="/analytics">
        {() => <ProtectedRoute component={ComingSoon} />}
      </Route>

      {/* Unauthorized Access */}
      <Route path="/unauthorized">
        {() => (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-600 mb-4">
                Access Denied
              </h1>
              <p className="text-lg text-slate-600 mb-6">
                You don't have permission to access this page.
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </Route>

      {/* Root Route - Role-based redirect */}
      <Route path="/">
        {() => {
          if (isInitializing) {
            return (
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            );
          }
          return isAuthenticated ? (
            <RoleBasedRedirect />
          ) : (
            <Redirect to="/login" />
          );
        }}
      </Route>

      {/* 404 - Not Found */}
      <Route component={NotFound} />
    </Switch>
  );
}

function MainLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const { setNotifications } = useNotificationsStore();
  const [location] = useLocation();

  // Function to get the current tab name based on the route
  const getCurrentTabName = (path: string): string => {
    const routeMap: Record<string, string> = {
      // Student routes
      "/student/dashboard": "🏠 Dashboard",
      "/student/notices": "📢 Notices",
      "/student/forms": "📝 Forms",
      "/student/schedule": "📅 Schedule",
      "/student/timetable": "🗓️ Timetable",
      "/student/applications": "📋 Applications",
      "/student/profile": "👤 Profile",

      // Faculty routes
      "/faculty": "👨‍🏫 Faculty Dashboard",

      // Dean routes
      "/dean": "🎓 Dean Dashboard",

      // Admin routes
      "/admin": "⚙️ Admin Dashboard",
      "/admin/users": "👥 User Management",
      "/admin/config": "🔧 System Config",

      // Backward compatibility
      "/dashboard": "🏠 Dashboard",
      "/notices": "📢 Notices",
      "/forms": "📝 Forms",
      "/schedule": "📅 Schedule",
      "/timetable": "🗓️ Timetable",
      "/applications": "📋 Applications",
      "/profile": "👤 Profile",

      // Common routes
      "/settings": "🔧 Settings",
      "/analytics": "📈 Analytics",
      "/lms": "📚 Learning Management",
      "/chat": "💬 Chat",
      "/attendance": "✅ Attendance",
    };

    // Handle exact matches first
    if (routeMap[path]) {
      return routeMap[path];
    }

    // Handle partial matches for dynamic routes
    for (const [route, name] of Object.entries(routeMap)) {
      if (path.startsWith(route)) {
        return name;
      }
    }

    // Default fallback
    return "🏠 Campus Hub";
  };

  const currentTabName = getCurrentTabName(location);

  useEffect(() => {
    if (isAuthenticated) {
      // Load notifications from centralized data service
      dataService.getNotifications().then((notifications) => {
        setNotifications(notifications);
      });
    }
  }, [isAuthenticated, setNotifications]);

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 p-4 border-b bg-background">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">
                  {currentTabName}
                </h1>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-base font-medium text-foreground">
                  {currentTabName.split(" ").slice(-1)[0]}{" "}
                  {/* Show only the last part on mobile */}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Notifications only for students if student role */}
              {isAuthenticated && user?.role === "STUDENT" && (
                <NotificationsDropdown />
              )}
              {/* Profile dropdown */}
              <ProfileDropdown />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container max-w-8xl mx-auto">
              <Router />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  const { isAuthenticated, isInitializing, initializeAuth } = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading spinner during auth initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading CampusHub...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          {isAuthenticated ? <MainLayout /> : <Router />}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
