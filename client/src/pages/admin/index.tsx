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
  Shield,
  Users,
  Database,
  Settings,
  Activity,
  LogOut,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function AdminDashboard() {
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-r from-red-600 to-orange-600 p-2">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  CampusHub
                </h1>
                <p className="text-sm text-slate-600">Admin Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-sm text-slate-600">System Administrator</p>
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
            System Administration 🔧
          </h2>
          <p className="text-lg text-slate-600">
            Manage system settings, users, and platform configuration
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Users Card */}
          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>User management</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-800 mb-2">3,156</p>
              <p className="text-sm text-slate-600">Total system users</p>
              <Button className="w-full mt-4" variant="outline">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>System security</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-800 mb-2">98.5%</p>
              <p className="text-sm text-slate-600">Security score</p>
              <Button className="w-full mt-4" variant="outline">
                View Logs
              </Button>
            </CardContent>
          </Card>

          {/* Database Card */}
          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Database className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle>Database</CardTitle>
                  <CardDescription>System storage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-800 mb-2">2.4TB</p>
              <p className="text-sm text-slate-600">Storage used</p>
              <Button className="w-full mt-4" variant="outline">
                Database Tools
              </Button>
            </CardContent>
          </Card>

          {/* System Health Card */}
          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Performance metrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-800 mb-2">99.9%</p>
              <p className="text-sm text-slate-600">Uptime</p>
              <Button className="w-full mt-4" variant="outline">
                View Metrics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tools */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>System Tools</CardTitle>
              <CardDescription>Administrative utilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  System Configuration
                </Button>
                <Button variant="outline" className="justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  User Role Management
                </Button>
                <Button variant="outline" className="justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Database Maintenance
                </Button>
                <Button variant="outline" className="justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                <Button variant="outline" className="justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Performance Monitoring
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-800">
                      System backup completed
                    </p>
                    <p className="text-sm text-slate-600">
                      Daily backup finished successfully
                    </p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-800">
                      Storage warning
                    </p>
                    <p className="text-sm text-slate-600">
                      Database storage 85% full
                    </p>
                    <p className="text-xs text-slate-500">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-800">
                      Security update available
                    </p>
                    <p className="text-sm text-slate-600">
                      System security patch v2.4.1
                    </p>
                    <p className="text-xs text-slate-500">Yesterday</p>
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
