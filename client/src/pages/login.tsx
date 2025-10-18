import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore, UserRole } from "@/stores/auth-store";
import { GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@assets/generated_images/Campus_students_collaborating_together_274bcd12.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("STUDENT");

  const mockUsers: Record<UserRole, { name: string; email: string; department: string }> = {
    STUDENT: {
      name: "Alex Johnson",
      email: "alex.johnson@campus.edu",
      department: "Computer Science",
    },
    FACULTY: {
      name: "Dr. Sarah Williams",
      email: "s.williams@campus.edu",
      department: "Computer Science",
    },
    HOD: {
      name: "Prof. Michael Chen",
      email: "m.chen@campus.edu",
      department: "Computer Science",
    },
    DEAN: {
      name: "Dr. Emily Davis",
      email: "e.davis@campus.edu",
      department: "Engineering",
    },
    ADMIN: {
      name: "Admin User",
      email: "admin@campus.edu",
      department: "Administration",
    },
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userTemplate = mockUsers[selectedRole];
    const mockUser = {
      id: `${selectedRole.toLowerCase()}-1`,
      name: userTemplate.name,
      email: email || userTemplate.email,
      role: selectedRole,
      department: userTemplate.department,
      avatar: "",
    };

    login(mockUser, "mock-token");
    toast({
      title: "Welcome back!",
      description: `You have successfully logged in as ${selectedRole.toLowerCase()}.`,
    });
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div
        className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(95, 135, 220, 0.85) 0%, rgba(160, 120, 200, 0.75) 100%), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-accent/40" />
        <div className="relative z-10 p-12 flex flex-col justify-center text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="rounded-xl bg-white/20 backdrop-blur-sm p-3">
              <GraduationCap className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold">CampusHub</h1>
              <p className="text-lg opacity-90">Your University, Connected</p>
            </div>
          </div>
          <div className="space-y-4 max-w-md">
            <h2 className="text-3xl font-serif font-semibold">Welcome to your digital campus</h2>
            <p className="text-lg opacity-90">
              Access notices, manage your schedule, submit applications, and stay connected with your university community.
            </p>
            <ul className="space-y-3 mt-6">
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white/80" />
                <span>Real-time notifications and updates</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white/80" />
                <span>Streamlined application workflows</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white/80" />
                <span>Integrated academic calendar</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="rounded-xl bg-primary p-3">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold">CampusHub</h1>
            </div>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-serif">Sign in to your account</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Login As</Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                    <SelectTrigger id="role" data-testid="select-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="FACULTY">Faculty</SelectItem>
                      <SelectItem value="HOD">Head of Department</SelectItem>
                      <SelectItem value="DEAN">Dean</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={mockUsers[selectedRole].email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-password"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="button-login">
                  Sign In
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Demo mode: Select a role and click Sign In</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
