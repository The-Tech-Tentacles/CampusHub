import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import heroImage from "@assets/image.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const {
    login,
    isLoading,
    error,
    clearError,
    getRoleDashboardPath,
    isAuthenticated,
  } = useAuthStore();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation(getRoleDashboardPath());
    }
  }, [isAuthenticated, getRoleDashboardPath, setLocation]);

  // Clear error when component unmounts or inputs change
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    const success = await login({ email: email.trim(), password });

    if (success) {
      toast({
        title: "Welcome back! 🎉",
        description: "You've successfully logged into your campus hub.",
      });
      setLocation(getRoleDashboardPath());
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      {/* Hero Section - Enhanced GenZ Vibe */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(168, 85, 247, 0.9) 50%, rgba(236, 72, 153, 0.85) 100%), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating orbs with different sizes and animations */}
          <div className="absolute top-8 left-12 w-24 h-24 bg-white/8 rounded-full animate-pulse blur-sm" />
          <div
            className="absolute top-16 right-16 w-16 h-16 bg-yellow-300/15 rounded-full animate-bounce"
            style={{ animationDelay: "0.5s", animationDuration: "3s" }}
          />
          <div
            className="absolute top-1/3 left-8 w-12 h-12 bg-pink-300/20 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 right-12 w-20 h-20 bg-purple-300/10 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute bottom-24 left-1/4 w-14 h-14 bg-blue-300/15 rounded-full animate-bounce"
            style={{ animationDelay: "1.5s", animationDuration: "4s" }}
          />
          <div
            className="absolute bottom-16 right-8 w-18 h-18 bg-indigo-300/12 rounded-full animate-pulse"
            style={{ animationDelay: "3s" }}
          />

          {/* Sparkle effects */}
          <Sparkles
            className="absolute top-1/4 right-1/3 h-10 w-10 text-white/25 animate-spin"
            style={{ animationDuration: "4s" }}
          />
          <Sparkles
            className="absolute top-3/4 left-1/3 h-8 w-8 text-yellow-300/30 animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <Sparkles
            className="absolute bottom-1/3 right-1/4 h-6 w-6 text-pink-300/25 animate-bounce"
            style={{ animationDelay: "1s", animationDuration: "3s" }}
          />

          {/* Gradient overlays for depth */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="relative z-10 p-12 flex flex-col justify-center text-white min-h-full">
          {/* Enhanced Logo Section */}
          <div className="flex items-center gap-6 mb-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative rounded-3xl bg-white/15 backdrop-blur-md p-5 border border-white/30 shadow-2xl group-hover:bg-white/20 transition-all duration-300">
                <GraduationCap className="h-14 w-14 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-lg">
                CampusHub
              </h1>
              <p className="text-xl font-semibold opacity-90 flex items-center gap-2">
                where campus life gets lit ✨
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </p>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="space-y-8 max-w-2xl">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold leading-tight drop-shadow-lg">
                Your campus,
                <br />
                <span className="text-yellow-300 relative">
                  your rules
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-yellow-300/50 rounded-full animate-pulse" />
                </span>
                📚
              </h2>
              <p className="text-xl opacity-90 leading-relaxed font-medium">
                No cap - this is the platform that actually gets student life.
                Handle your academics, stay in the loop, and connect with your
                squad. 💯
              </p>
            </div>

            {/* Enhanced Feature Cards */}
            <div className="grid gap-4 mt-10">
              <div className="group flex items-center gap-4 bg-white/12 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-75" />
                </div>
                <span className="font-semibold text-lg group-hover:text-green-200 transition-colors">
                  Real-time notifications that don't miss 📱
                </span>
              </div>

              <div className="group flex items-center gap-4 bg-white/12 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-ping opacity-75" />
                </div>
                <span className="font-semibold text-lg group-hover:text-blue-200 transition-colors">
                  Applications made simple (finally!) 🎯
                </span>
              </div>

              <div className="group flex items-center gap-4 bg-white/12 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse shadow-lg shadow-purple-400/50" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-purple-400 animate-ping opacity-75" />
                </div>
                <span className="font-semibold text-lg group-hover:text-purple-200 transition-colors">
                  Your schedule, but make it smart 🧠
                </span>
              </div>
            </div>

            {/* Call to Action Hint */}
            <div className="mt-8 flex items-center gap-3 text-white/80">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
              <span className="text-sm font-medium">
                Ready to join the revolution?
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 min-h-screen relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur-lg opacity-50"></div>
              <div className="relative rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-3 shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                CampusHub
              </h1>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1">
                where campus life gets lit ✨
                <Sparkles className="h-3 w-3 animate-pulse" />
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-3xl overflow-hidden mx-2 sm:mx-0">
            <CardHeader className="space-y-3 text-center pb-6 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Welcome back!
              </CardTitle>
              <CardDescription className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 px-2">
                Ready to dive back into campus life?
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
              {/* Error Alert */}
              {error && (
                <Alert
                  variant="destructive"
                  className="mb-6 rounded-xl border-0 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm"
                >
                  <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                  >
                    <Mail className="h-4 w-4 text-indigo-500" />
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@campus.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:shadow-lg focus:shadow-indigo-500/10 focus:outline-none pl-4 text-slate-900 dark:text-white"
                      data-testid="input-email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                  >
                    <Lock className="h-4 w-4 text-indigo-500" />
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:shadow-lg focus:shadow-indigo-500/10 focus:outline-none pl-4 pr-12 text-slate-900 dark:text-white"
                      data-testid="input-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-70 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg">Signing in...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        <span className="text-lg">Let's go!</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </Button>
              </form>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-medium rounded-full backdrop-blur-sm">
                      New to campus?
                    </span>
                  </div>
                </div>
                <p className="mt-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-500 dark:hover:to-purple-500 transition-all duration-200 text-lg hover:scale-105"
                  >
                    Join the community! 🎓
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
