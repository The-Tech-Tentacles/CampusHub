import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useEffect } from "react";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Notices from "@/pages/notices";
import Forms from "@/pages/forms";
import Schedule from "@/pages/schedule";
import Timetable from "@/pages/timetable";
import Applications from "@/pages/applications";
import Profile from "@/pages/profile";
import AdminUsers from "@/pages/admin-users";
import AdminConfig from "@/pages/admin-config";
import ComingSoon from "@/pages/coming-soon";
import NotFound from "@/pages/not-found";

function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/notices">
        {() => <ProtectedRoute component={Notices} />}
      </Route>
      <Route path="/forms">{() => <ProtectedRoute component={Forms} />}</Route>
      <Route path="/schedule">
        {() => <ProtectedRoute component={Schedule} />}
      </Route>
      <Route path="/timetable">
        {() => <ProtectedRoute component={Timetable} />}
      </Route>
      <Route path="/applications">
        {() => <ProtectedRoute component={Applications} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute component={AdminUsers} />}
      </Route>
      <Route path="/admin/config">
        {() => <ProtectedRoute component={AdminConfig} />}
      </Route>
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
      <Route path="/">
        {() =>
          isAuthenticated ? (
            <Redirect to="/dashboard" />
          ) : (
            <Redirect to="/login" />
          )
        }
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function MainLayout() {
  const { isAuthenticated } = useAuthStore();
  const { setNotifications } = useNotificationsStore();

  useEffect(() => {
    if (isAuthenticated) {
      setNotifications([
        {
          id: "1",
          type: "NOTICE",
          title: "New Notice Published",
          body: "Mid-Semester Examination Schedule has been released",
          readAt: null,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          type: "FORM",
          title: "Form Submission Required",
          body: "Student Feedback Form - Semester 1 is now available",
          readAt: null,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          type: "APPLICATION",
          title: "Application Approved",
          body: "Your leave application has been approved",
          readAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
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
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <NotificationsDropdown />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container max-w-7xl mx-auto">
              <Router />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

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
