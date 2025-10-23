import { useAuthStore } from "@/stores/auth-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, Settings, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function FacultyDashboard() {
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
      description: "See you next time!",
    });
    setLocation("/login");
  };

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-2">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  CampusHub
                </h1>
                <p className="text-sm text-slate-600">Faculty Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-sm text-slate-600">
                  {user.role} •{" "}
                  {user.department || user.departmentCode || "No Department"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-lg text-slate-600">
            {user.role === "HOD"
              ? "Manage your department and faculty resources"
              : "Access your teaching resources and student information"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Classes Card */}
          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>My Classes</CardTitle>
                  <CardDescription>
                    View and manage your courses
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-800 mb-2">5</p>
              <p className="text-sm text-slate-600">
                Active courses this semester
              </p>
              <Button className="w-full mt-4" variant="outline">
                View Classes
              </Button>
            </CardContent>
          </Card>

          {/* Students Card */}
          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Students</CardTitle>
                  <CardDescription>Manage student information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-800 mb-2">127</p>
              <p className="text-sm text-slate-600">Total students enrolled</p>
              <Button className="w-full mt-4" variant="outline">
                View Students
              </Button>
            </CardContent>
          </Card>

          {/* Department Settings (HOD only) */}
          {user.role === "HOD" && (
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Department</CardTitle>
                    <CardDescription>
                      Manage department settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  Configure department policies and faculty assignments
                </p>
                <Button className="w-full" variant="outline">
                  Manage Department
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-800">
                      New assignment submission
                    </p>
                    <p className="text-sm text-slate-600">
                      Data Structures - Project 2
                    </p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-800">
                      Class attendance updated
                    </p>
                    <p className="text-sm text-slate-600">
                      Computer Networks - Lecture 15
                    </p>
                    <p className="text-xs text-slate-500">Yesterday</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-800">
                      Grade entry reminder
                    </p>
                    <p className="text-sm text-slate-600">
                      Mid-term exam grades due tomorrow
                    </p>
                    <p className="text-xs text-slate-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
