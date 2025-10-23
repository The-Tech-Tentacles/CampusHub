import { useAuthStore } from "@/stores/auth-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Building2,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function DeanDashboard() {
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 p-2">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  CampusHub
                </h1>
                <p className="text-sm text-slate-600">Dean Portal</p>
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
            Welcome, Dean {user.name}! 🎓
          </h2>
          <p className="text-lg text-slate-600">
            Oversee college operations and strategic initiatives
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Departments Card */}
          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <CardTitle>Departments</CardTitle>
                  <CardDescription>Manage all departments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-800 mb-2">8</p>
              <p className="text-sm text-slate-600">Active departments</p>
              <Button className="w-full mt-4" variant="outline">
                View All
              </Button>
            </CardContent>
          </Card>

          {/* Faculty Card */}
          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Faculty</CardTitle>
                  <CardDescription>Faculty management</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-800 mb-2">156</p>
              <p className="text-sm text-slate-600">Total faculty members</p>
              <Button className="w-full mt-4" variant="outline">
                Manage Faculty
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
                  <CardDescription>Student body overview</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-800 mb-2">2,847</p>
              <p className="text-sm text-slate-600">Enrolled students</p>
              <Button className="w-full mt-4" variant="outline">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Reports Card */}
          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>Performance analytics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-800 mb-2">12</p>
              <p className="text-sm text-slate-600">Pending reports</p>
              <Button className="w-full mt-4" variant="outline">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Academic Calendar Settings
                </Button>
                <Button variant="outline" className="justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Faculty Approvals
                </Button>
                <Button variant="outline" className="justify-start">
                  <Building2 className="h-4 w-4 mr-2" />
                  Department Budgets
                </Button>
                <Button variant="outline" className="justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Performance Reviews
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest college updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-violet-50 rounded-lg">
                  <div className="w-2 h-2 bg-violet-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-800">
                      New faculty appointment
                    </p>
                    <p className="text-sm text-slate-600">
                      Dr. Smith joined Computer Science
                    </p>
                    <p className="text-xs text-slate-500">3 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-800">
                      Budget approval required
                    </p>
                    <p className="text-sm text-slate-600">
                      Mechanical Engineering equipment request
                    </p>
                    <p className="text-xs text-slate-500">Yesterday</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-800">
                      Accreditation update
                    </p>
                    <p className="text-sm text-slate-600">
                      NAAC assessment documents submitted
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
