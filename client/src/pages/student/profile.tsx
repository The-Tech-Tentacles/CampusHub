import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { RoleBadge } from "@/components/role-badge";
import { dataService } from "@/services/dataService";
import { api } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  User,
  Edit3,
  Save,
  X,
  Camera,
  Award,
  BookOpen,
  Users,
  Clock,
  Heart,
  Code,
  Briefcase,
  Star,
  Trophy,
  Target,
  UserCheck,
  Building,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  Upload,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function Profile() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("academic");
  const [loading, setLoading] = useState(true);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newHobby, setNewHobby] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [profileData, setProfileData] = useState({
    enrollmentNo: "",
    department: "",
    year: "",
    academicYearId: "",
    section: "",
    cgpa: "",
    semester: "",
    batch: "",
    rollNumber: "",
    phone: "",
    altEmail: "",
    address: "",
    permanentAddress: "",
    dateOfBirth: "",
    bloodGroup: "",
    guardianName: "",
    guardianContact: "",
    guardianEmail: "",
    guardianRelation: "",
    guardianOccupation: "",
    previousEducation: "",
    admissionDate: "",
    expectedGraduation: "",
    specialization: "",
    mentorId: "",
    mentorName: "",
    mentorEmail: "",
    mentorPhone: "",
    mentorDepartment: "",
    mentorOffice: "",
    mentorEmployeeId: "",
    mentorCabinLocation: "",
    mentorOfficeHours: "",
    mentorBio: "",
    mentorResearchInterests: [] as string[],
    mentorQualifications: [] as string[],
    mentorExperience: 0,
    socialLinks: {
      github: "",
      linkedin: "",
      portfolio: "",
    },
    skills: [] as string[],
    achievements: [] as string[],
    hobbies: [] as string[],
    bio: "",
    // Previous Education
    tenth: {
      school: "",
      percentage: "",
      yearOfPassing: "",
    },
    intermediateType: "12th" as "12th" | "diploma",
    twelfth: {
      school: "",
      percentage: "",
      yearOfPassing: "",
    },
    diploma: {
      college: "",
      percentage: "",
      yearOfPassing: "",
    },
  });

  const [formData, setFormData] = useState(profileData);

  useEffect(() => {
    // Load profile data and faculty list from backend
    loadProfileData();
    loadFacultyList();
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      const response = await api.getAcademicYears();
      if (response.success && response.data) {
        setAcademicYears(response.data);
      }
    } catch (error) {
      console.error("Error loading academic years:", error);
    }
  };

  const loadFacultyList = async () => {
    try {
      const faculty = await dataService.getFacultyList();
      setFacultyList(faculty);
    } catch (error) {
      console.error("Error loading faculty list:", error);
    }
  };

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const data = await dataService.getUserProfile();
      console.log("Raw profile data from API:", data);

      // Map API response to profile page format
      const mappedData = {
        enrollmentNo: user?.enrollmentNumber || "",
        department: data.department || "",
        year: data.year || "",
        academicYearId: (data as any).academicYearId || "",
        section: data.section || "",
        cgpa: data.cgpa?.toString() || "",
        semester: data.semester || "",
        batch: data.batch || "",
        rollNumber: data.rollNumber || "",

        phone: user?.phone || "",
        altEmail: data.altEmail || "",
        address: data.address || "",
        permanentAddress: data.permanentAddress || "",
        dateOfBirth: data.dateOfBirth || "",
        bloodGroup: data.bloodGroup || "",

        guardianName: data.guardianName || "",
        guardianContact: data.guardianContact || "",
        guardianEmail: data.guardianEmail || "",
        guardianRelation: data.guardianRelation || "",
        guardianOccupation: data.guardianOccupation || "",

        previousEducation: data.previousEducation || "",
        admissionDate: data.admissionDate || "",
        expectedGraduation: data.expectedGraduation || "",
        specialization: data.specialization || "",

        mentorId: data.mentorId || "",
        mentorName: data.mentorName || "",
        mentorEmail: data.mentorEmail || "",
        mentorPhone: data.mentorPhone || "",
        mentorDepartment: (data as any).mentorDepartment || "",
        mentorOffice: "",
        mentorEmployeeId: (data as any).mentorEmployeeId || "",
        mentorCabinLocation: (data as any).mentorCabinLocation || "",
        mentorOfficeHours: (data as any).mentorOfficeHours || "",
        mentorBio: (data as any).mentorBio || "",
        mentorResearchInterests: (data as any).mentorResearchInterests || [],
        mentorQualifications: (data as any).mentorQualifications || [],
        mentorExperience: (data as any).mentorExperience || 0,

        socialLinks: {
          github: (data.socialLinks as any)?.github || "",
          linkedin: (data.socialLinks as any)?.linkedin || "",
          portfolio: (data.socialLinks as any)?.portfolio || "",
        },
        skills: data.skills || [],
        achievements: data.achievements || [],
        hobbies: data.hobbies || [],
        bio: data.bio || "",

        // Parse previous education from string or use defaults
        tenth: (() => {
          try {
            const parsed = data.previousEducation
              ? JSON.parse(data.previousEducation)
              : {};
            return (
              parsed.tenth || { school: "", percentage: "", yearOfPassing: "" }
            );
          } catch {
            return { school: "", percentage: "", yearOfPassing: "" };
          }
        })(),
        intermediateType: (() => {
          try {
            const parsed = data.previousEducation
              ? JSON.parse(data.previousEducation)
              : {};
            return parsed.intermediateType || "12th";
          } catch {
            return "12th";
          }
        })(),
        twelfth: (() => {
          try {
            const parsed = data.previousEducation
              ? JSON.parse(data.previousEducation)
              : {};
            return (
              parsed.twelfth || {
                school: "",
                percentage: "",
                yearOfPassing: "",
              }
            );
          } catch {
            return { school: "", percentage: "", yearOfPassing: "" };
          }
        })(),
        diploma: (() => {
          try {
            const parsed = data.previousEducation
              ? JSON.parse(data.previousEducation)
              : {};
            return (
              parsed.diploma || {
                college: "",
                percentage: "",
                yearOfPassing: "",
              }
            );
          } catch {
            return { college: "", percentage: "", yearOfPassing: "" };
          }
        })(),
      };

      console.log("Mapped profile data:", mappedData);
      setProfileData(mappedData);
      setFormData(mappedData);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Map formData to API format
      const updateData = {
        name: user?.name,
        phone: formData.phone,
        enrollmentNumber: formData.enrollmentNo,
        academicYearId: formData.academicYearId,
        altEmail: formData.altEmail,
        address: formData.address,
        permanentAddress: formData.permanentAddress,
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        bio: formData.bio,

        // Academic Info
        section: formData.section,
        semester: formData.semester,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
        batch: formData.batch,
        rollNumber: formData.rollNumber,
        specialization: formData.specialization,
        admissionDate: formData.admissionDate,
        expectedGraduation: formData.expectedGraduation,
        previousEducation: JSON.stringify({
          tenth: formData.tenth,
          intermediateType: formData.intermediateType,
          twelfth: formData.twelfth,
          diploma: formData.diploma,
        }),

        // Guardian Info
        guardianName: formData.guardianName,
        guardianContact: formData.guardianContact,
        guardianEmail: formData.guardianEmail,
        guardianRelation: formData.guardianRelation,
        guardianOccupation: formData.guardianOccupation,

        // Mentor Info
        mentorId: formData.mentorId,

        // Social Links, Skills, Hobbies, and Achievements
        socialLinks: formData.socialLinks,
        skills: formData.skills,
        hobbies: formData.hobbies,
        achievements: formData.achievements,
      };

      console.log("Sending profile update with data:", updateData);
      const success = await dataService.updateUserProfile(updateData);
      console.log("Profile update result:", success);

      if (success) {
        // Reload profile data from backend to get updated mentor info
        await loadProfileData();
        setIsEditing(false);

        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        throw new Error("Update returned false");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const addHobby = (hobby: string) => {
    if (hobby && !formData.hobbies.includes(hobby)) {
      setFormData((prev) => ({
        ...prev,
        hobbies: [...prev.hobbies, hobby],
      }));
    }
  };

  const removeHobby = (hobbyToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      hobbies: prev.hobbies.filter((h) => h !== hobbyToRemove),
    }));
  };

  const addAchievement = (achievement: string) => {
    if (achievement && !formData.achievements.includes(achievement)) {
      setFormData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, achievement],
      }));
    }
  };

  const removeAchievement = (achievementToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((a) => a !== achievementToRemove),
    }));
  };

  const handleEducationChange = (
    level: "tenth" | "twelfth" | "diploma",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: value,
      },
    }));
  };

  const studentProfile = isEditing ? formData : profileData;

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        <Card className="overflow-hidden border-0 shadow-xl rounded-2xl">
          <CardContent className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <Card className="overflow-hidden border-0 shadow-2xl rounded-3xl">
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 p-8 md:p-10">
          {/* Academic Pattern Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 text-white/40">
              <GraduationCap className="h-32 w-32" />
            </div>
            <div className="absolute bottom-4 left-4 text-white/40">
              <BookOpen className="h-24 w-24" />
            </div>
            <div className="absolute top-1/2 right-1/4 text-white/30">
              <Award className="h-20 w-20" />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar with Academic Badge */}
              <div className="relative">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-white/40 shadow-2xl ring-4 ring-white/20">
                  <AvatarImage src={user?.avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-white/30 text-white text-2xl font-bold backdrop-blur-md">
                    {user?.name?.charAt(0) || "JD"}
                  </AvatarFallback>
                </Avatar>
                {/* Academic Status Badge */}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                </div>
              </div>

              {/* Student Info */}
              <div className="flex-1 text-white">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    {user?.name || "John Doe"}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-white/25 text-white border-white/40 backdrop-blur-sm px-3 py-1 w-fit"
                  >
                    <span className="font-mono font-semibold">
                      {studentProfile.enrollmentNo}
                    </span>
                  </Badge>
                </div>

                {/* Academic Details */}
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {studentProfile.specialization}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-white/30 hidden md:block"></div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {studentProfile.department}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-white/30 hidden md:block"></div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {studentProfile.year}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Controls */}
      <div className="w-full">
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl h-12"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-4 w-full">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl h-12"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 border-0 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 shadow-md hover:shadow-lg transition-all rounded-xl h-12"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-2 bg-white dark:bg-gray-900 shadow-lg rounded-2xl border-0">
          <TabsTrigger
            value="academic"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
          >
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs">Academic</span>
          </TabsTrigger>
          <TabsTrigger
            value="skills"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
          >
            <Star className="h-4 w-4" />
            <span className="text-xs">Skills</span>
          </TabsTrigger>
          <TabsTrigger
            value="mentor"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
          >
            <UserCheck className="h-4 w-4" />
            <span className="text-xs">Mentor</span>
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
          >
            <Phone className="h-4 w-4" />
            <span className="text-xs">Contact</span>
          </TabsTrigger>

          <TabsTrigger
            value="guardian"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
          >
            <Heart className="h-4 w-4" />
            <span className="text-xs">Guardian</span>
          </TabsTrigger>
        </TabsList>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-8">
          {/* Edit Mode Indicator */}
          {isEditing && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg">
              <Edit3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Edit Mode Active
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Fields with colored borders can be edited
                </p>
              </div>
            </div>
          )}

          {/* Section Header */}
          <div className="flex items-center gap-3 pb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Academic Information
            </h2>
          </div>

          {/* Primary Academic Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-0 shadow-xl rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <GraduationCap className="h-5 w-5" />
                  Enrollment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Enrollment No.
                    </span>
                    {isEditing ? (
                      <Input
                        value={studentProfile.enrollmentNo}
                        onChange={(e) =>
                          handleInputChange("enrollmentNo", e.target.value)
                        }
                        className="w-40 h-8 text-right font-mono border-2 border-blue-200 dark:border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-950"
                      />
                    ) : (
                      <span className="font-mono font-semibold text-blue-900 dark:text-blue-100">
                        {studentProfile.enrollmentNo}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Roll Number
                    </span>
                    {isEditing ? (
                      <Input
                        value={studentProfile.rollNumber}
                        onChange={(e) =>
                          handleInputChange("rollNumber", e.target.value)
                        }
                        className="w-32 h-8 text-right font-mono border-2 border-blue-200 dark:border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-950"
                      />
                    ) : (
                      <span className="font-mono font-semibold text-blue-900 dark:text-blue-100">
                        {studentProfile.rollNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Department
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                    >
                      {studentProfile.department}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Year
                    </span>
                    {isEditing ? (
                      <select
                        value={studentProfile.academicYearId}
                        onChange={(e) => {
                          const selectedYear = academicYears.find(
                            (y) => y.id === e.target.value
                          );
                          setFormData((prev) => ({
                            ...prev,
                            academicYearId: e.target.value,
                            year: selectedYear?.name || "",
                          }));
                        }}
                        className="w-40 h-8 text-sm border-2 border-blue-200 dark:border-blue-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-950 px-2"
                      >
                        <option value="">Select Year</option>
                        {academicYears.map((year) => (
                          <option key={year.id} value={year.id}>
                            {year.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                      >
                        {studentProfile.year}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-0 shadow-xl rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <BookOpen className="h-5 w-5" />
                  Current Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Current Semester
                    </span>
                    {isEditing ? (
                      <Input
                        value={studentProfile.semester}
                        onChange={(e) =>
                          handleInputChange("semester", e.target.value)
                        }
                        className="w-24 h-8 text-right border-2 border-purple-200 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-950"
                      />
                    ) : (
                      <span className="font-semibold text-purple-900 dark:text-purple-100">
                        {studentProfile.semester}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      CGPA
                    </span>
                    {isEditing ? (
                      <Input
                        value={studentProfile.cgpa}
                        onChange={(e) =>
                          handleInputChange("cgpa", e.target.value)
                        }
                        className="w-24 h-8 text-right border-2 border-purple-200 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-950"
                      />
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 text-base"
                      >
                        {studentProfile.cgpa}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Section
                    </span>
                    {isEditing ? (
                      <Input
                        value={studentProfile.section}
                        onChange={(e) =>
                          handleInputChange("section", e.target.value)
                        }
                        className="w-20 h-8 text-center border-2 border-purple-200 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-950"
                      />
                    ) : (
                      <span className="font-semibold text-purple-900 dark:text-purple-100">
                        {studentProfile.section}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Batch
                    </span>
                    {isEditing ? (
                      <Input
                        value={studentProfile.batch}
                        onChange={(e) =>
                          handleInputChange("batch", e.target.value)
                        }
                        className="w-28 h-8 text-right border-2 border-purple-200 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-950"
                      />
                    ) : (
                      <span className="font-semibold text-purple-900 dark:text-purple-100">
                        {studentProfile.batch}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Specialization & Timeline */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Target className="h-5 w-5" />
                  Specialization
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input
                    value={studentProfile.specialization}
                    onChange={(e) =>
                      handleInputChange("specialization", e.target.value)
                    }
                    placeholder="Enter your specialization"
                    className="border-2 border-green-200 dark:border-green-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-950"
                  />
                ) : (
                  <div className="p-4 bg-white/60 dark:bg-gray-900/40 rounded-xl">
                    <p className="text-base font-semibold text-green-900 dark:text-green-100">
                      {studentProfile.specialization || "Not specified"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-0 shadow-xl rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Calendar className="h-5 w-5" />
                  Academic Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Admission Date
                  </span>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={studentProfile.admissionDate}
                      onChange={(e) =>
                        handleInputChange("admissionDate", e.target.value)
                      }
                      className="w-40 h-8 border-2 border-orange-200 dark:border-orange-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-950"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                      {studentProfile.admissionDate
                        ? new Date(
                            studentProfile.admissionDate
                          ).toLocaleDateString()
                        : "Not set"}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Expected Graduation
                  </span>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={studentProfile.expectedGraduation}
                      onChange={(e) =>
                        handleInputChange("expectedGraduation", e.target.value)
                      }
                      className="w-40 h-8 border-2 border-orange-200 dark:border-orange-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-950"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                      {studentProfile.expectedGraduation
                        ? new Date(
                            studentProfile.expectedGraduation
                          ).toLocaleDateString()
                        : "Not set"}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Previous Education */}
          <Card className="bg-gradient-to-br from-cyan-50 to-sky-100 dark:from-cyan-900/20 dark:to-sky-900/20 border-cyan-200 dark:border-cyan-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                <Award className="h-5 w-5" />
                Previous Education
              </CardTitle>
              <CardDescription>
                Details about your educational background before joining
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 10th Standard */}
              <div className="space-y-4 p-4 bg-white/60 dark:bg-gray-900/40 rounded-xl border-0 shadow-md">
                <h3 className="font-semibold text-cyan-800 dark:text-cyan-200 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-cyan-600 dark:bg-cyan-500 text-white flex items-center justify-center text-xs font-bold">
                    10
                  </div>
                  10th Standard
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                      School Name
                    </Label>
                    {isEditing ? (
                      <Input
                        value={studentProfile.tenth.school}
                        onChange={(e) =>
                          handleEducationChange(
                            "tenth",
                            "school",
                            e.target.value
                          )
                        }
                        placeholder="Enter school name"
                        className="border-0 focus:ring-2 focus:ring-cyan-500 h-9 text-sm"
                      />
                    ) : (
                      <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100 p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded">
                        {studentProfile.tenth.school || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                      Percentage / CGPA
                    </Label>
                    {isEditing ? (
                      <Input
                        value={studentProfile.tenth.percentage}
                        onChange={(e) =>
                          handleEducationChange(
                            "tenth",
                            "percentage",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 85% or 8.5"
                        className="border-0 focus:ring-2 focus:ring-cyan-500 h-9 text-sm"
                      />
                    ) : (
                      <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100 p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded">
                        {studentProfile.tenth.percentage || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                      Year of Passing
                    </Label>
                    {isEditing ? (
                      <Input
                        value={studentProfile.tenth.yearOfPassing}
                        onChange={(e) =>
                          handleEducationChange(
                            "tenth",
                            "yearOfPassing",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 2020"
                        className="border-0 focus:ring-2 focus:ring-cyan-500 h-9 text-sm"
                      />
                    ) : (
                      <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100 p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded">
                        {studentProfile.tenth.yearOfPassing || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Intermediate Type Selection - Only show when editing */}
              {isEditing && (
                <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl border-0 shadow-md">
                  <Label className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                    After 10th, I completed:
                  </Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="intermediateType"
                        value="12th"
                        checked={studentProfile.intermediateType === "12th"}
                        onChange={(e) =>
                          handleInputChange("intermediateType", e.target.value)
                        }
                        className="w-4 h-4 text-cyan-600"
                      />
                      <span className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
                        12th Standard
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="intermediateType"
                        value="diploma"
                        checked={studentProfile.intermediateType === "diploma"}
                        onChange={(e) =>
                          handleInputChange("intermediateType", e.target.value)
                        }
                        className="w-4 h-4 text-cyan-600"
                      />
                      <span className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
                        Diploma
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* 12th Standard - Show when editing and selected, OR when viewing and has data */}
              {((isEditing && studentProfile.intermediateType === "12th") ||
                (!isEditing &&
                  (studentProfile.twelfth.school ||
                    studentProfile.twelfth.percentage ||
                    studentProfile.twelfth.yearOfPassing))) && (
                <div className="space-y-4 p-4 bg-white/60 dark:bg-gray-900/40 rounded-xl border-2 border-purple-300 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-950 shadow-md">
                  <h3 className="font-semibold text-cyan-800 dark:text-cyan-200 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-cyan-600 dark:bg-cyan-500 text-white flex items-center justify-center text-xs font-bold">
                      12
                    </div>
                    12th Standard
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                        School Name
                      </Label>
                      {isEditing ? (
                        <Input
                          value={studentProfile.twelfth.school}
                          onChange={(e) =>
                            handleEducationChange(
                              "twelfth",
                              "school",
                              e.target.value
                            )
                          }
                          placeholder="Enter school name"
                          className="border-0 focus:ring-2 focus:ring-cyan-500 h-9 text-sm"
                        />
                      ) : (
                        <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100 p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded">
                          {studentProfile.twelfth.school || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                        Percentage / CGPA
                      </Label>
                      {isEditing ? (
                        <Input
                          value={studentProfile.twelfth.percentage}
                          onChange={(e) =>
                            handleEducationChange(
                              "twelfth",
                              "percentage",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 85% or 8.5"
                          className="border-0 focus:ring-2 focus:ring-cyan-500 h-9 text-sm"
                        />
                      ) : (
                        <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100 p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded">
                          {studentProfile.twelfth.percentage || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                        Year of Passing
                      </Label>
                      {isEditing ? (
                        <Input
                          value={studentProfile.twelfth.yearOfPassing}
                          onChange={(e) =>
                            handleEducationChange(
                              "twelfth",
                              "yearOfPassing",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 2022"
                          className="border-0 focus:ring-2 focus:ring-cyan-500 h-9 text-sm"
                        />
                      ) : (
                        <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100 p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded">
                          {studentProfile.twelfth.yearOfPassing ||
                            "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Diploma - Show when editing and selected, OR when viewing and has data */}
              {((isEditing && studentProfile.intermediateType === "diploma") ||
                (!isEditing &&
                  (studentProfile.diploma.college ||
                    studentProfile.diploma.percentage ||
                    studentProfile.diploma.yearOfPassing))) && (
                <div className="space-y-4 p-4 bg-white/60 dark:bg-gray-900/40 rounded-xl border-2 border-purple-300 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-950 shadow-md">
                  <h3 className="font-semibold text-cyan-800 dark:text-cyan-200 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-cyan-600 dark:bg-cyan-500 text-white flex items-center justify-center text-xs font-bold">
                      D
                    </div>
                    Diploma
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                        College Name
                      </Label>
                      {isEditing ? (
                        <Input
                          value={studentProfile.diploma.college}
                          onChange={(e) =>
                            handleEducationChange(
                              "diploma",
                              "college",
                              e.target.value
                            )
                          }
                          placeholder="Enter college name"
                          className="border-0 focus:ring-2 focus:ring-cyan-500 h-9 text-sm"
                        />
                      ) : (
                        <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100 p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded">
                          {studentProfile.diploma.college || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                        Percentage / CGPA
                      </Label>
                      {isEditing ? (
                        <Input
                          value={studentProfile.diploma.percentage}
                          onChange={(e) =>
                            handleEducationChange(
                              "diploma",
                              "percentage",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 85% or 8.5"
                          className="border-0 focus:ring-2 focus:ring-cyan-500 h-9 text-sm"
                        />
                      ) : (
                        <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100 p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded">
                          {studentProfile.diploma.percentage || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                        Year of Passing
                      </Label>
                      {isEditing ? (
                        <Input
                          value={studentProfile.diploma.yearOfPassing}
                          onChange={(e) =>
                            handleEducationChange(
                              "diploma",
                              "yearOfPassing",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 2022"
                          className="border-0 focus:ring-2 focus:ring-cyan-500 h-9 text-sm"
                        />
                      ) : (
                        <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100 p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded">
                          {studentProfile.diploma.yearOfPassing ||
                            "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentor Tab */}

        <TabsContent value="mentor" className="space-y-8">
          {/* Section Header */}

          <div className="flex items-center gap-3 pb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full"></div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Mentor & Guidance
            </h2>
          </div>

          <Card className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20 border-0 shadow-xl rounded-2xl">
            <CardHeader className="pb-4 border-b border-purple-100 dark:border-purple-800/50">
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <UserCheck className="h-5 w-5" />
                </div>
                {studentProfile.mentorName ? "Your Mentor" : "Mentor Selection"}
              </CardTitle>
              <CardDescription className="text-purple-600 dark:text-purple-400 mt-1">
                {studentProfile.mentorName
                  ? "Your assigned mentor information and guidance"
                  : "Choose your mentor from available faculty members"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Mentor Selection Dropdown - Only shown when no mentor selected */}
              {!studentProfile.mentorName && (
                <Card className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20 border-0 shadow-xl rounded-2xl">
                  <CardHeader className="pb-3 bg-purple-100/50 dark:bg-purple-900/30">
                    <CardTitle className="text-base font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Select Your Mentor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                          Available Mentors from {studentProfile.department}
                        </Label>
                        <select
                          className="w-full px-4 py-3 border-2 border-purple-300 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-950 transition-all"
                          value={formData.mentorId}
                          onChange={(e) =>
                            handleInputChange("mentorId", e.target.value)
                          }
                        >
                          <option value="">-- Select a mentor --</option>
                          {facultyList
                            .filter(
                              (faculty) =>
                                faculty.department === studentProfile.department
                            )
                            .map((faculty) => (
                              <option key={faculty.id} value={faculty.id}>
                                {faculty.name}{" "}
                                {faculty.department
                                  ? `- ${faculty.department}`
                                  : ""}
                              </option>
                            ))}
                        </select>
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        Choose a mentor based on your interests and career
                        goals. Once selected, this cannot be changed.
                      </p>
                      {/* Confirm Mentor Selection Button */}
                      {formData.mentorId && (
                        <Button
                          onClick={handleSave}
                          disabled={loading}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {loading
                            ? "Confirming..."
                            : "Confirm Mentor Selection"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Mentor Profile Card - Show saved mentor or preview when selecting */}
              {(() => {
                // Show saved mentor info if exists, otherwise show preview of selected mentor
                const selectedMentor =
                  !studentProfile.mentorName && formData.mentorId
                    ? facultyList.find((f) => f.id === formData.mentorId)
                    : null;

                const displayMentor = studentProfile.mentorName
                  ? {
                      name: studentProfile.mentorName,
                      email: studentProfile.mentorEmail,
                      phone: studentProfile.mentorPhone,
                      department: studentProfile.mentorDepartment,
                    }
                  : selectedMentor;

                return (
                  displayMentor && (
                    <>
                      <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 shadow-md">
                        <Avatar className="h-16 w-16 border-3 border-white dark:border-gray-800 shadow-xl rounded-2xl">
                          <AvatarImage src="/placeholder-mentor.jpg" />
                          <AvatarFallback className="bg-purple-600 text-white text-lg font-bold">
                            {displayMentor.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("") || "M"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                            {displayMentor.name}
                          </h2>
                          {selectedMentor && !studentProfile.mentorName && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            >
                              Preview - Not Saved Yet
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Mentor Details Grid */}
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Contact Information */}
                        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-300">
                              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                                <Mail className="h-5 w-5" />
                              </div>
                              Contact Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-950/40 rounded-xl border-0 shadow-md">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                  Email
                                </div>
                                <div className="font-semibold text-sm text-blue-900 dark:text-blue-100 break-all">
                                  {displayMentor.email || "Not available"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-950/40 rounded-xl border-0 shadow-md">
                              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                                <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                                  Phone
                                </div>
                                <div className="font-semibold text-sm text-green-900 dark:text-green-100">
                                  {displayMentor.phone || "Not available"}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Office Location */}
                        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-300">
                              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                                <MapPin className="h-5 w-5" />
                              </div>
                              Office Location
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-950/40 rounded-xl border-0 shadow-md">
                              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                                <Building className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                                  Cabin Location
                                </div>
                                <div className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                                  {studentProfile.mentorCabinLocation ||
                                    "Not available"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-950/40 rounded-xl border-0 shadow-md">
                              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                                <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                  Office Hours
                                </div>
                                <div className="font-semibold text-sm text-indigo-900 dark:text-indigo-100">
                                  {studentProfile.mentorOfficeHours ||
                                    "Not available"}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Department & Academic Info */}
                      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            Academic Profile
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-950/40 rounded-xl border-0 shadow-md">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                                <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                                  Department
                                </div>
                                <div className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                                  {studentProfile.mentorDepartment ||
                                    "Not available"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-950/40 rounded-xl border-0 shadow-md">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                  Employee ID
                                </div>
                                <div className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                                  {studentProfile.mentorEmployeeId ||
                                    selectedMentor?.employeeId ||
                                    "Not available"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-950/40 rounded-xl border-0 shadow-md">
                              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                                <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                                  Experience
                                </div>
                                <div className="font-semibold text-sm text-green-900 dark:text-green-100">
                                  {studentProfile.mentorExperience
                                    ? `${studentProfile.mentorExperience} years`
                                    : "Not available"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Bio & Research Interests */}
                      {(studentProfile.mentorBio ||
                        studentProfile.mentorResearchInterests?.length > 0) && (
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Bio */}
                          {studentProfile.mentorBio && (
                            <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-teal-200 dark:border-teal-800">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2 text-teal-700 dark:text-teal-300">
                                  <div className="p-1.5 bg-teal-100 dark:bg-teal-900/50 rounded-xl">
                                    <User className="h-5 w-5" />
                                  </div>
                                  About Mentor
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="p-4 bg-white/60 dark:bg-gray-950/40 rounded-xl border-0 shadow-md">
                                  <p className="text-sm text-teal-900 dark:text-teal-100 leading-relaxed">
                                    {studentProfile.mentorBio}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Research Interests */}
                          {studentProfile.mentorResearchInterests?.length >
                            0 && (
                            <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-200 dark:border-rose-800">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2 text-rose-700 dark:text-rose-300">
                                  <div className="p-1.5 bg-rose-100 dark:bg-rose-900/50 rounded-xl">
                                    <Target className="h-5 w-5" />
                                  </div>
                                  Research Interests
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2 p-4 bg-white/60 dark:bg-gray-950/40 rounded-xl border-0 shadow-md">
                                  {studentProfile.mentorResearchInterests.map(
                                    (interest, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
                                      >
                                        {interest}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}

                      {/* Qualifications */}
                      {studentProfile.mentorQualifications?.length > 0 && (
                        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-300">
                              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                                <Award className="h-5 w-5" />
                              </div>
                              Qualifications
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-2">
                              {studentProfile.mentorQualifications.map(
                                (qual, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-950/40 border-0 shadow-md"
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                      {qual}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}

        <TabsContent value="contact" className="space-y-8">
          {/* Section Header */}

          <div className="flex items-center gap-3 pb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Contact Information
            </h2>
          </div>

          {/* Personal Details - Combined Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-0 shadow-xl rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <User className="h-5 w-5" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                {/* Email Addresses */}
                <div className="space-y-3 p-4 bg-white/60 dark:bg-gray-900/40 rounded-xl border-0 shadow-md">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    Email Addresses
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                        Primary
                      </span>
                      <span className="text-xs font-semibold text-purple-900 dark:text-purple-100">
                        {user?.email}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-purple-700 dark:text-purple-300">
                        Alternative
                      </Label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={studentProfile.altEmail}
                          onChange={(e) =>
                            handleInputChange("altEmail", e.target.value)
                          }
                          placeholder="alternative@email.com"
                          className="border-2 border-purple-200 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-950 h-8 text-sm"
                        />
                      ) : (
                        <p className="text-xs font-medium text-purple-900 dark:text-purple-100 p-2 bg-purple-50 dark:bg-purple-950/30 rounded">
                          {studentProfile.altEmail || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-3 p-4 bg-white/60 dark:bg-gray-900/40 rounded-xl border-0 shadow-md">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </h4>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      Mobile
                    </Label>
                    {isEditing ? (
                      <Input
                        value={studentProfile.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="+91 XXXXX XXXXX"
                        className="border-2 border-purple-200 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-950 h-8 text-sm"
                      />
                    ) : (
                      <p className="text-xs font-medium text-purple-900 dark:text-purple-100 p-2 bg-purple-50 dark:bg-purple-950/30 rounded">
                        {studentProfile.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date of Birth & Blood Group */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Date of Birth
                  </span>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={studentProfile.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className="w-40 h-8 border-2 border-purple-200 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-950"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                      {studentProfile.dateOfBirth
                        ? new Date(
                            studentProfile.dateOfBirth
                          ).toLocaleDateString()
                        : "Not set"}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow-sm">
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Blood Group
                  </span>
                  {isEditing ? (
                    <Input
                      value={studentProfile.bloodGroup}
                      onChange={(e) =>
                        handleInputChange("bloodGroup", e.target.value)
                      }
                      placeholder="A+, B-, O+, etc."
                      className="w-32 h-8 text-center border-2 border-purple-200 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-950"
                    />
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200"
                    >
                      {studentProfile.bloodGroup || "Not set"}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-0 shadow-xl rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-orange-700 dark:text-orange-300">
                    Current Address
                  </Label>
                  {isEditing ? (
                    <Textarea
                      value={studentProfile.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Enter current address"
                      className="min-h-[100px] border-2 border-orange-200 dark:border-orange-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-950"
                    />
                  ) : (
                    <div className="min-h-[100px] p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl border-0 shadow-md">
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                        {studentProfile.address || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-orange-700 dark:text-orange-300">
                    Permanent Address
                  </Label>
                  {isEditing ? (
                    <Textarea
                      value={studentProfile.permanentAddress}
                      onChange={(e) =>
                        handleInputChange("permanentAddress", e.target.value)
                      }
                      placeholder="Enter permanent address"
                      className="min-h-[100px] border-2 border-orange-200 dark:border-orange-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-950"
                    />
                  ) : (
                    <div className="min-h-[100px] p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl border-0 shadow-md">
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                        {studentProfile.permanentAddress || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links Section */}
          <Card className="bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-indigo-900/20 dark:to-violet-900/20 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <Globe className="h-5 w-5" />
                Social Media & Portfolio
              </CardTitle>
              <CardDescription>
                Connect your professional profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub Profile Link
                  </Label>
                  {isEditing ? (
                    <Input
                      value={studentProfile.socialLinks.github}
                      onChange={(e) =>
                        handleSocialLinkChange("github", e.target.value)
                      }
                      placeholder="https://github.com/johndoe"
                      className="border-0 focus:ring-2 focus:ring-indigo-500 h-9"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded">
                      <Github className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 break-all">
                        {studentProfile.socialLinks.github || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Profile Link
                  </Label>
                  {isEditing ? (
                    <Input
                      value={studentProfile.socialLinks.linkedin}
                      onChange={(e) =>
                        handleSocialLinkChange("linkedin", e.target.value)
                      }
                      placeholder="https://linkedin.com/in/johndoe"
                      className="border-0 focus:ring-2 focus:ring-indigo-500 h-9"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded">
                      <Linkedin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 break-all">
                        {studentProfile.socialLinks.linkedin || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Portfolio Website URL
                  </Label>
                  {isEditing ? (
                    <Input
                      value={studentProfile.socialLinks.portfolio}
                      onChange={(e) =>
                        handleSocialLinkChange("portfolio", e.target.value)
                      }
                      placeholder="https://johndoe.dev"
                      className="border-0 focus:ring-2 focus:ring-indigo-500 h-9"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded">
                      <ExternalLink className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 break-all">
                        {studentProfile.socialLinks.portfolio || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-8">
          {/* Section Header */}
          <div className="flex items-center gap-3 pb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Skills & Achievements
            </h2>
          </div>
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 border-0 shadow-xl rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Briefcase className="h-5 w-5" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-purple-700 dark:text-purple-300">
                  Personal Bio
                </Label>
                {isEditing ? (
                  <Textarea
                    value={studentProfile.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="min-h-[120px] border-2 border-purple-200 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-950"
                    placeholder="Tell us about yourself, your goals, and aspirations..."
                  />
                ) : (
                  <div className="min-h-[120px] p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl border-0 shadow-md">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100 whitespace-pre-wrap">
                      {studentProfile.bio || "No bio added yet"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Code className="h-5 w-5" />
                  Technical Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl border-0 shadow-md min-h-[100px]">
                  {studentProfile.skills.length > 0 ? (
                    studentProfile.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-200 text-blue-900 hover:bg-blue-300 dark:bg-blue-800/50 dark:text-blue-100 flex items-center gap-1 h-fit"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-blue-950 dark:hover:text-blue-50"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-blue-600/60 dark:text-blue-400/60 italic">
                      No skills added yet
                    </p>
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add skill (e.g., React, Python)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addSkill(newSkill);
                          setNewSkill("");
                        }
                      }}
                      className="border-0 focus:ring-2 focus:ring-blue-500 h-9"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        addSkill(newSkill);
                        setNewSkill("");
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
                  <Heart className="h-5 w-5" />
                  Hobbies & Interests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 p-4 bg-white/70 dark:bg-gray-900/50 rounded-xl border-0 shadow-md min-h-[100px]">
                  {studentProfile.hobbies.length > 0 ? (
                    studentProfile.hobbies.map((hobby, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-pink-300 bg-pink-100 text-pink-800 hover:bg-pink-200 dark:border-pink-700 dark:bg-pink-900/30 dark:text-pink-200 flex items-center gap-1 h-fit"
                      >
                        {hobby}
                        {isEditing && (
                          <button
                            onClick={() => removeHobby(hobby)}
                            className="ml-1 hover:text-pink-950 dark:hover:text-pink-50"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-pink-600/60 dark:text-pink-400/60 italic">
                      No hobbies added yet
                    </p>
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add hobby (e.g., Reading, Gaming)"
                      value={newHobby}
                      onChange={(e) => setNewHobby(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addHobby(newHobby);
                          setNewHobby("");
                        }
                      }}
                      className="border-0 focus:ring-2 focus:ring-pink-500 h-9"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        addHobby(newHobby);
                        setNewHobby("");
                      }}
                      className="bg-pink-600 hover:bg-pink-700"
                    >
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                <Trophy className="h-5 w-5" />
                Achievements & Awards
              </CardTitle>
              <CardDescription>
                Your academic and extracurricular achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {studentProfile.achievements.length > 0 ? (
                  studentProfile.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-900/40 border-0 focus:ring-2 focus:ring-yellow-500"
                    >
                      <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                      <span className="text-sm font-medium flex-1 text-yellow-900 dark:text-yellow-100">
                        {achievement}
                      </span>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                          onClick={() => removeAchievement(achievement)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-yellow-600/60 dark:text-yellow-400/60 text-center py-4 italic">
                    No achievements added yet
                  </p>
                )}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add achievement (e.g., First Prize in Hackathon)"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addAchievement(newAchievement);
                        setNewAchievement("");
                      }
                    }}
                    className="border-0 focus:ring-2 focus:ring-yellow-500 h-9"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      addAchievement(newAchievement);
                      setNewAchievement("");
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guardian Tab */}

        <TabsContent value="guardian" className="space-y-8">
          {/* Section Header */}

          <div className="flex items-center gap-3 pb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Guardian & Family
            </h2>
          </div>

          <Card className="bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-rose-900/20 dark:via-pink-900/20 dark:to-red-900/20 border-rose-200 dark:border-rose-800 shadow-xl rounded-2xl">
            <CardHeader className="pb-4 border-b border-rose-100 dark:border-rose-800/50">
              <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xl">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl">
                  <Heart className="h-5 w-5" />
                </div>
                Guardian Information
              </CardTitle>
              <CardDescription className="text-rose-600 dark:text-rose-400 mt-1">
                Emergency contact and guardian details for family communication
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Guardian Name */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <User className="h-4 w-4" />
                    Guardian Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={studentProfile.guardianName}
                      onChange={(e) =>
                        handleInputChange("guardianName", e.target.value)
                      }
                      placeholder="Enter guardian's full name"
                      className="border-2 border-rose-200 dark:border-rose-700 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-950 h-11"
                    />
                  ) : (
                    <div className="p-4 bg-white dark:bg-gray-950/50 rounded-xl border-0 shadow-md/50 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-sm font-bold text-rose-900 dark:text-rose-100">
                        {studentProfile.guardianName || (
                          <span className="text-rose-400 dark:text-rose-500 italic">
                            Not provided
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Relationship */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Heart className="h-4 w-4" />
                    Relationship
                  </Label>
                  {isEditing ? (
                    <Input
                      value={studentProfile.guardianRelation}
                      onChange={(e) =>
                        handleInputChange("guardianRelation", e.target.value)
                      }
                      placeholder="Father, Mother, Guardian, etc."
                      className="border-2 border-rose-200 dark:border-rose-700 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-950 h-11"
                    />
                  ) : (
                    <div className="p-4 bg-white dark:bg-gray-950/50 rounded-xl border-0 shadow-md/50 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-sm font-bold text-rose-900 dark:text-rose-100">
                        {studentProfile.guardianRelation || (
                          <span className="text-rose-400 dark:text-rose-500 italic">
                            Not provided
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contact Number */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Phone className="h-4 w-4" />
                    Contact Number
                  </Label>
                  {isEditing ? (
                    <Input
                      value={studentProfile.guardianContact}
                      onChange={(e) =>
                        handleInputChange("guardianContact", e.target.value)
                      }
                      placeholder="+91 9876543210"
                      className="border-2 border-rose-200 dark:border-rose-700 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-950 h-11"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-950/50 rounded-xl border-0 shadow-md/50 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-full">
                        <Phone className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      </div>
                      <p className="text-sm font-bold text-rose-900 dark:text-rose-100">
                        {studentProfile.guardianContact || (
                          <span className="text-rose-400 dark:text-rose-500 italic">
                            Not provided
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={studentProfile.guardianEmail}
                      onChange={(e) =>
                        handleInputChange("guardianEmail", e.target.value)
                      }
                      placeholder="guardian@example.com"
                      className="border-2 border-rose-200 dark:border-rose-700 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-950 h-11"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-950/50 rounded-xl border-0 shadow-md/50 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-full">
                        <Mail className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      </div>
                      <p className="text-sm font-bold text-rose-900 dark:text-rose-100 break-all">
                        {studentProfile.guardianEmail || (
                          <span className="text-rose-400 dark:text-rose-500 italic">
                            Not provided
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Occupation - Full Width */}
                <div className="space-y-3 md:col-span-2">
                  <Label className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Briefcase className="h-4 w-4" />
                    Occupation
                  </Label>
                  {isEditing ? (
                    <Input
                      value={studentProfile.guardianOccupation}
                      onChange={(e) =>
                        handleInputChange("guardianOccupation", e.target.value)
                      }
                      placeholder="Enter guardian's occupation"
                      className="border-2 border-rose-200 dark:border-rose-700 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-gray-950 h-11"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-950/50 rounded-xl border-0 shadow-md/50 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-full">
                        <Briefcase className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      </div>
                      <p className="text-sm font-bold text-rose-900 dark:text-rose-100">
                        {studentProfile.guardianOccupation || (
                          <span className="text-rose-400 dark:text-rose-500 italic">
                            Not provided
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact Banner */}
              {!isEditing &&
                (studentProfile.guardianName ||
                  studentProfile.guardianContact) && (
                  <div className="mt-6 p-4 bg-rose-100 dark:bg-rose-900/30 border-0 focus:ring-2 focus:ring-rose-500 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-200 dark:bg-rose-800/50 rounded-full">
                        <Phone className="h-5 w-5 text-rose-700 dark:text-rose-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100 mb-1">
                          Emergency Contact
                        </h4>
                        <p className="text-xs text-rose-700 dark:text-rose-300">
                          This information will be used to contact your guardian
                          in case of emergencies or important updates.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
