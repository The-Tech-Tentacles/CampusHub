import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Search,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  User,
  Building2,
  Calendar,
  Hash,
  ArrowLeft,
  TrendingUp,
  Award,
  AlertCircle,
} from "lucide-react";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth-store";

interface Mentee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  enrollmentNumber: string | null;
  departmentId: string | null;
  profile: {
    section: string | null;
    semester: string | null;
    cgpa: number | null;
    batch: string | null;
    rollNumber: string | null;
    bloodGroup: string | null;
    altEmail: string | null;
    guardianName: string | null;
    guardianContact: string | null;
  };
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export default function FacultyMenteesPage() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [filteredMentees, setFilteredMentees] = useState<Mentee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchMentees();
  }, [user]);

  useEffect(() => {
    // Filter mentees based on search query
    if (!searchQuery.trim()) {
      setFilteredMentees(mentees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = mentees.filter(
      (mentee) =>
        mentee.name.toLowerCase().includes(query) ||
        mentee.email.toLowerCase().includes(query) ||
        mentee.enrollmentNumber?.toLowerCase().includes(query) ||
        mentee.profile.rollNumber?.toLowerCase().includes(query) ||
        mentee.department?.name.toLowerCase().includes(query)
    );
    setFilteredMentees(filtered);
  }, [searchQuery, mentees]);

  const fetchMentees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getFacultyMentees();
      if (res.success && res.data) {
        setMentees(res.data as Mentee[]);
        setFilteredMentees(res.data as Mentee[]);
      } else {
        setError("Failed to load mentees");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load mentees");
    } finally {
      setLoading(false);
    }
  };

  const getMenteeStats = () => {
    if (loading || mentees.length === 0) return null;

    const totalMentees = mentees.length;
    const validCGPAs = mentees
      .filter((m) => m.profile.cgpa !== null)
      .map((m) => Number(m.profile.cgpa));
    const avgCGPA =
      validCGPAs.length > 0
        ? (validCGPAs.reduce((a, b) => a + b, 0) / validCGPAs.length).toFixed(2)
        : "N/A";

    const highPerformers = mentees.filter(
      (m) => m.profile.cgpa && Number(m.profile.cgpa) >= 8.5
    ).length;
    const needsAttention = mentees.filter(
      (m) => m.profile.cgpa && Number(m.profile.cgpa) < 6.0
    ).length;

    return [
      {
        title: "Total Mentees",
        value: totalMentees.toString(),
        description: "Students assigned to you",
        icon: Users,
        color: "blue",
      },
      {
        title: "Average CGPA",
        value: avgCGPA,
        description: `Based on ${validCGPAs.length} students`,
        icon: TrendingUp,
        color: "green",
      },
      {
        title: "High Performers",
        value: highPerformers.toString(),
        description: "CGPA ≥ 8.5",
        icon: Award,
        color: "purple",
      },
      {
        title: "Need Attention",
        value: needsAttention.toString(),
        description: "CGPA < 6.0",
        icon: AlertCircle,
        color: "orange",
      },
    ];
  };

  const menteeStats = getMenteeStats();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-9xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Users className="h-7 w-7 text-blue-600" />
              My Mentees
            </h1>
          </div>
        </div>
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {menteeStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {menteeStats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
              green:
                "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
              purple:
                "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
              orange:
                "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
            };

            return (
              <Card
                key={index}
                className={`border-0 shadow-sm ${
                  colorClasses[stat.color as keyof typeof colorClasses]
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                    </div>
                    <Icon className="h-8 w-8 opacity-75" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Search Bar */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, enrollment number, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mentees Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 font-medium">{error}</p>
              <Button variant="outline" onClick={fetchMentees} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredMentees.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery
                  ? "No mentees found matching your search"
                  : "No mentees assigned yet"}
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMentees.map((mentee) => (
            <Card
              key={mentee.id}
              className="border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      {mentee.name}
                    </CardTitle>
                  </div>
                  {mentee.enrollmentNumber && (
                    <Badge>
                      {mentee.enrollmentNumber
                        ? mentee.enrollmentNumber
                        : "N/A"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Academic Info */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-2 text-sm">
                  {mentee.profile.section && (
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Sec {mentee.profile.section}
                      </span>
                    </div>
                  )}
                  {mentee.profile.batch && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {mentee.profile.batch}
                      </span>
                    </div>
                  )}
                  {mentee.profile.rollNumber && (
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Roll {mentee.profile.rollNumber}
                      </span>
                    </div>
                  )}
                  {mentee.profile.semester && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Sem {mentee.profile.semester}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex items-center gap-4 pt-2 border-t text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <a
                      href={`mailto:${mentee.email}`}
                      className="text-blue-600 hover:underline truncate"
                    >
                      {mentee.email}
                    </a>
                  </div>
                  {mentee.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <a
                        href={`tel:${mentee.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {mentee.phone}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
