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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";
import {
  departmentAPI,
  academicYearAPI,
  type Department,
  type AcademicYear,
} from "@/services/api";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Phone,
  Hash,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Building2,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import heroImage from "@assets/image.png";

export default function Register() {
  const [, setLocation] = useLocation();
  const {
    register,
    isLoading,
    error,
    clearError,
    getRoleDashboardPath,
    isAuthenticated,
  } = useAuthStore();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    enrollmentNumber: "",
    departmentId: "",
    academicYearId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Data loading state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation(getRoleDashboardPath());
    }
  }, [isAuthenticated, getRoleDashboardPath, setLocation]);

  // Load departments and academic years
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const [deptResponse, yearResponse] = await Promise.all([
          departmentAPI.getAll(),
          academicYearAPI.getAll(),
        ]);

        if (deptResponse.success && deptResponse.data) {
          setDepartments(deptResponse.data);
        }

        if (yearResponse.success && yearResponse.data) {
          setAcademicYears(yearResponse.data);
        }
      } catch (error) {
        console.error("Failed to load departments and academic years:", error);
        toast({
          title: "Loading error",
          description:
            "Failed to load departments and academic years. Try checking your internet connection and try refreshing page..",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [toast]);

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Please enter your full name";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters long";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email =
        "Please enter a valid email address (e.g., name@campus.edu)";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Please create a password";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = "Please enter your phone number";
    } else if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/[\s-]/g, ""))) {
      errors.phone = "Please enter a valid phone number (10-15 digits)";
    }

    // Enrollment number validation
    if (!formData.enrollmentNumber.trim()) {
      errors.enrollmentNumber = "Please enter your enrollment number";
    } else if (formData.enrollmentNumber.trim().length < 4) {
      errors.enrollmentNumber =
        "Enrollment number must be at least 4 characters";
    }

    // Department validation
    if (!formData.departmentId) {
      errors.departmentId = "Please select your department";
    }

    // Academic year validation
    if (!formData.academicYearId) {
      errors.academicYearId = "Please select your academic year";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Show toast with first error
      const firstError = Object.values(errors)[0];
      toast({
        title: "Form validation failed",
        description: firstError,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    const registerData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
      enrollmentNumber: formData.enrollmentNumber.trim(),
      departmentId: formData.departmentId,
      academicYearId: formData.academicYearId,
    };

    const success = await register(registerData);

    if (success) {
      toast({
        title: "Welcome to CampusHub! 🎉",
        description:
          "Your account has been created successfully. Let's get started!",
      });
      setLocation(getRoleDashboardPath());
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-950 dark:via-emerald-950 dark:to-teal-950">
      {/* Hero Section - Enhanced GenZ Vibe */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(6, 182, 212, 0.9) 50%, rgba(59, 130, 246, 0.85) 100%), url(${heroImage})`,
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
              <h1 className="text-6xl font-black bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent drop-shadow-lg">
                CampusHub
              </h1>
              <p className="text-xl font-semibold opacity-90 flex items-center gap-2">
                join the movement ⚡
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <div
                    className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
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
                Ready to level up
                <br />
                <span className="text-emerald-300 relative">
                  your campus game?
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-emerald-300/50 rounded-full animate-pulse" />
                </span>
                🎯
              </h2>
              <p className="text-xl opacity-90 leading-relaxed font-medium">
                Join thousands of students who've already made the switch to a
                smarter, more connected campus experience. It's time to upgrade!
                🚀
              </p>
            </div>

            {/* Enhanced Feature Cards */}
            <div className="grid gap-4 mt-10">
              <div className="group flex items-center gap-4 bg-white/12 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </div>
                <span className="font-semibold text-lg group-hover:text-emerald-200 transition-colors">
                  Connect with your entire campus community 🤝
                </span>
              </div>

              <div className="group flex items-center gap-4 bg-white/12 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-teal-400 animate-pulse shadow-lg shadow-teal-400/50" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-teal-400 animate-ping opacity-75" />
                </div>
                <span className="font-semibold text-lg group-hover:text-teal-200 transition-colors">
                  Never miss important updates again 📢
                </span>
              </div>

              <div className="group flex items-center gap-4 bg-white/12 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-cyan-400 animate-ping opacity-75" />
                </div>
                <span className="font-semibold text-lg group-hover:text-cyan-200 transition-colors">
                  Streamlined academic workflows 📚
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

      {/* Register Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 min-h-screen relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-lg opacity-50"></div>
              <div className="relative rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3 shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                CampusHub
              </h1>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1">
                join the movement ⚡
                <Sparkles className="h-3 w-3 animate-pulse" />
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-3xl overflow-hidden mx-2 sm:mx-0">
            <CardHeader className="space-y-3 text-center pb-6 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Join CampusHub! 🎓
              </CardTitle>
              <CardDescription className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 px-2">
                Create your account and become part of the community
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

              {/* Loading State */}
              {isLoadingData && (
                <div className="mb-6 text-center p-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl backdrop-blur-sm">
                  <div className="inline-flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      Loading departments and academic years...
                    </p>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleRegister}
                className="space-y-4 sm:space-y-5"
              >
                {/* Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                  >
                    <User className="h-4 w-4 text-emerald-500" />
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={`h-12 border-2 ${
                        fieldErrors.name
                          ? "border-red-500 dark:border-red-500"
                          : "border-slate-200 dark:border-slate-700"
                      } focus:border-emerald-500 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:shadow-lg focus:shadow-emerald-500/10 focus:outline-none pl-4 text-slate-900 dark:text-white`}
                      required
                    />
                    {fieldErrors.name && (
                      <p className="text-red-500 text-xs mt-1 mb-2 flex items-center gap-1">
                        <span className="font-medium">⚠</span>{" "}
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                  >
                    <Mail className="h-4 w-4 text-emerald-500" />
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@campus.edu"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`h-12 border-2 ${
                        fieldErrors.email
                          ? "border-red-500 dark:border-red-500"
                          : "border-slate-200 dark:border-slate-700"
                      } focus:border-emerald-500 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:shadow-lg focus:shadow-emerald-500/10 focus:outline-none pl-4 text-slate-900 dark:text-white`}
                      required
                    />
                    {fieldErrors.email && (
                      <p className="text-red-500 text-xs mt-1 mb-2 flex items-center gap-1">
                        <span className="font-medium">⚠</span>{" "}
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Fields in a Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                    >
                      <Lock className="h-4 w-4 text-emerald-500" />
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Choose password"
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          className={`h-12 border-2 ${
                            fieldErrors.password
                              ? "border-red-500 dark:border-red-500"
                              : "border-slate-200 dark:border-slate-700"
                          } focus:border-emerald-500 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:shadow-lg focus:shadow-emerald-500/10 focus:outline-none pl-4 text-slate-900 dark:text-white pr-12`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-red-500 text-xs mt-1 mb-2 flex items-center gap-1">
                          <span className="font-medium">⚠</span>{" "}
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                    >
                      <Lock className="h-4 w-4 text-emerald-500" />
                      Confirm <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          className={`h-12 border-2 ${
                            fieldErrors.confirmPassword
                              ? "border-red-500 dark:border-red-500"
                              : "border-slate-200 dark:border-slate-700"
                          } focus:border-emerald-500 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:shadow-lg focus:shadow-emerald-500/10 focus:outline-none pl-4 text-slate-900 dark:text-white pr-12`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1 mb-2 flex items-center gap-1">
                          <span className="font-medium">⚠</span>{" "}
                          {fieldErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Department and Academic Year in Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Department Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="department"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                    >
                      <Building2 className="h-4 w-4 text-emerald-500" />
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Select
                        value={formData.departmentId}
                        onValueChange={(value) =>
                          handleInputChange("departmentId", value)
                        }
                        disabled={isLoadingData}
                        required
                      >
                        <SelectTrigger
                          className={`h-12 border-2 ${
                            fieldErrors.departmentId
                              ? "border-red-500 dark:border-red-500"
                              : "border-slate-200 dark:border-slate-700"
                          } focus:border-emerald-500 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:shadow-lg focus:shadow-emerald-500/10 text-slate-900 dark:text-white`}
                        >
                          <SelectValue
                            placeholder={
                              isLoadingData
                                ? "Loading departments..."
                                : departments.length === 0
                                ? "No departments available"
                                : "Select your department"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
                          {departments.length > 0 ? (
                            departments.map((dept) => (
                              <SelectItem
                                key={dept.id}
                                value={dept.id}
                                className="rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900 focus:bg-emerald-50 dark:focus:bg-emerald-900 text-slate-900 dark:text-white"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                  {dept.name} ({dept.code})
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No departments available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {fieldErrors.departmentId && (
                        <p className="text-red-500 text-xs mt-1 mb-2 flex items-center gap-1">
                          <span className="font-medium">⚠</span>{" "}
                          {fieldErrors.departmentId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Academic Year Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="academicYear"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                    >
                      <Calendar className="h-4 w-4 text-emerald-500" />
                      Academic Year <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Select
                        value={formData.academicYearId}
                        onValueChange={(value) =>
                          handleInputChange("academicYearId", value)
                        }
                        disabled={isLoadingData}
                        required
                      >
                        <SelectTrigger
                          className={`h-12 border-2 ${
                            fieldErrors.academicYearId
                              ? "border-red-500 dark:border-red-500"
                              : "border-slate-200 dark:border-slate-700"
                          } focus:border-emerald-500 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:shadow-lg focus:shadow-emerald-500/10 text-slate-900 dark:text-white`}
                        >
                          <SelectValue
                            placeholder={
                              isLoadingData
                                ? "Loading academic years..."
                                : academicYears.length === 0
                                ? "No academic years available"
                                : "Select your academic year"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
                          {academicYears.length > 0 ? (
                            academicYears.map((year) => (
                              <SelectItem
                                key={year.id}
                                value={year.id}
                                className="rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900 focus:bg-emerald-50 dark:focus:bg-emerald-900 text-slate-900 dark:text-white"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                  {year.name}
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No academic years available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {fieldErrors.academicYearId && (
                        <p className="text-red-500 text-xs mt-1 mb-2 flex items-center gap-1">
                          <span className="font-medium">⚠</span>{" "}
                          {fieldErrors.academicYearId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phone and Enrollment Number in Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                    >
                      <Phone className="h-4 w-4 text-emerald-500" />
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className={`h-12 border-2 ${
                          fieldErrors.phone
                            ? "border-red-500 dark:border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        } focus:border-emerald-500 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:shadow-lg focus:shadow-emerald-500/10 focus:outline-none pl-4 text-slate-900 dark:text-white`}
                        required
                      />
                      {fieldErrors.phone && (
                        <p className="text-red-500 text-xs mt-1 mb-2 flex items-center gap-1">
                          <span className="font-medium">⚠</span>{" "}
                          {fieldErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Enrollment Number Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="enrollmentNumber"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                    >
                      <Hash className="h-4 w-4 text-emerald-500" />
                      Enrollment Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Input
                        id="enrollmentNumber"
                        type="text"
                        placeholder="e.g., 2024CS001"
                        value={formData.enrollmentNumber}
                        onChange={(e) =>
                          handleInputChange("enrollmentNumber", e.target.value)
                        }
                        className={`h-12 border-2 ${
                          fieldErrors.enrollmentNumber
                            ? "border-red-500 dark:border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        } focus:border-emerald-500 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-200 focus:bg-white dark:focus:bg-slate-800 focus:shadow-lg focus:shadow-emerald-500/10 focus:outline-none pl-4 text-slate-900 dark:text-white`}
                        required
                      />
                      {fieldErrors.enrollmentNumber && (
                        <p className="text-red-500 text-xs mt-1 mb-2 flex items-center gap-1">
                          <span className="font-medium">⚠</span>{" "}
                          {fieldErrors.enrollmentNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <Button
                  type="submit"
                  disabled={isLoading || isLoadingData}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-70 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg">
                          Creating your account...
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        <span className="text-lg">Join CampusHub!</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </Button>
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-medium rounded-full backdrop-blur-sm">
                      Already part of the squad?
                    </span>
                  </div>
                </div>
                <p className="mt-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text hover:from-emerald-700 hover:to-teal-700 dark:hover:from-emerald-500 dark:hover:to-teal-500 transition-all duration-200 text-lg hover:scale-105"
                  >
                    Sign in here!
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
