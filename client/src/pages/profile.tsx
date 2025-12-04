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
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [profileData, setProfileData] = useState({
    enrollmentNo: "",
    department: "",
    year: "",
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
    socialLinks: {
      github: "",
      linkedin: "",
      portfolio: "",
    },
    skills: [] as string[],
    achievements: [] as string[],
    hobbies: [] as string[],
    bio: "",
  });

  const [formData, setFormData] = useState(profileData);

  useEffect(() => {
    // Load profile data and faculty list from backend
    loadProfileData();
    loadFacultyList();
  }, []);

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
        enrollmentNo: data.userId || "",
        department: data.department || "",
        year: data.year || "",
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
        mentorDepartment: "",
        mentorOffice: "",

        socialLinks: {
          github: (data.socialLinks as any)?.github || "",
          linkedin: (data.socialLinks as any)?.linkedin || "",
          portfolio: (data.socialLinks as any)?.portfolio || "",
        },
        skills: data.skills || [],
        achievements: [],
        hobbies: [],
        bio: data.bio || "",
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
        previousEducation: formData.previousEducation,

        // Guardian Info
        guardianName: formData.guardianName,
        guardianContact: formData.guardianContact,
        guardianEmail: formData.guardianEmail,
        guardianRelation: formData.guardianRelation,
        guardianOccupation: formData.guardianOccupation,

        // Mentor Info
        mentorId: formData.mentorId,

        // Social and Skills
        socialLinks: formData.socialLinks,
        skills: formData.skills,
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

  const studentProfile = isEditing ? formData : profileData;

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        <Card className="overflow-hidden border-0 shadow-lg">
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
      <Card className="overflow-hidden border-0 shadow-lg ">
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-8 text-white dark:text-gray-100">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-white/20 shadow-lg">
                <AvatarImage src={user?.avatarUrl} className="object-cover" />
                <AvatarFallback className="bg-white/10 text-white text-xl font-bold">
                  {user?.name?.charAt(0) || "JD"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">
                  {user?.name || "John Doe"}
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  {studentProfile.enrollmentNo}
                </Badge>
              </div>
              <p className="text-white/80 text-sm font-medium">
                {studentProfile.specialization}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Controls */}
      <div className="w-full">
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-4 w-full">
            <Button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto p-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
          <TabsTrigger
            value="overview"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-lg transition-colors"
          >
            <User className="h-4 w-4" />
            <span className="text-xs">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="academic"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-lg transition-colors"
          >
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs">Academic</span>
          </TabsTrigger>
          <TabsTrigger
            value="mentor"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-lg transition-colors"
          >
            <UserCheck className="h-4 w-4" />
            <span className="text-xs">Mentor</span>
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-lg transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="text-xs">Contact</span>
          </TabsTrigger>
          <TabsTrigger
            value="skills"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-lg transition-colors"
          >
            <Star className="h-4 w-4" />
            <span className="text-xs">Skills</span>
          </TabsTrigger>
          <TabsTrigger
            value="guardian"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-lg transition-colors"
          >
            <Heart className="h-4 w-4" />
            <span className="text-xs">Guardian</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Personal Bio - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {studentProfile.bio}
              </p>
            </CardContent>
          </Card>

          {/* Academic Information Grid - Better Desktop Layout */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
            {/* Skills Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  Technical Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {studentProfile.skills.slice(0, 6).map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {studentProfile.skills.length > 6 && (
                    <Badge variant="outline" className="text-muted-foreground">
                      +{studentProfile.skills.length - 6} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studentProfile.achievements
                    .slice(0, 3)
                    .map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        <span>{achievement}</span>
                      </div>
                    ))}
                  {studentProfile.achievements.length > 3 && (
                    <div className="text-sm text-muted-foreground mt-2">
                      +{studentProfile.achievements.length - 3} more
                      achievements
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* </div> */}
            {/* Academic Progress */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <GraduationCap className="h-5 w-5" />
                  Academic Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Department
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {studentProfile.department}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Year
                  </span>
                  <span className="font-semibold">{studentProfile.year}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Section
                  </span>
                  <span className="font-semibold">
                    {studentProfile.section}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <TrendingUp className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    CGPA
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  >
                    {studentProfile.cgpa}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Semester
                  </span>
                  <span className="font-semibold">
                    {studentProfile.semester}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Batch
                  </span>
                  <span className="font-semibold">{studentProfile.batch}</span>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Links */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Globe className="h-5 w-5" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-2 justify-center py-2 px-3 border-black-400 text-black-700 hover:bg-black-50 dark:border-white-800 dark:text-white-300 cursor-pointer"
                  >
                    <Github className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {studentProfile.socialLinks.github || "GitHub"}
                    </span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-2 justify-center py-2 px-3 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 cursor-pointer"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {studentProfile.socialLinks.linkedin || "LinkedIn"}
                    </span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-2 justify-center py-2 px-3 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 cursor-pointer col-span-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-xs font-medium">Portfolio</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-6">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Enrollment Number
                  </Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-mono">
                      {studentProfile.enrollmentNo}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Roll Number</Label>
                  <Input
                    value={studentProfile.rollNumber}
                    onChange={(e) =>
                      handleInputChange("rollNumber", e.target.value)
                    }
                    disabled={!isEditing}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Department</Label>
                  <Input value={studentProfile.department} disabled={true} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Year & Section</Label>
                  <div className="flex gap-2">
                    <Input
                      value={studentProfile.year}
                      disabled={true}
                      className="flex-1"
                    />
                    <Input
                      value={studentProfile.section}
                      onChange={(e) =>
                        handleInputChange("section", e.target.value)
                      }
                      disabled={!isEditing}
                      className="w-20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Current Semester
                  </Label>
                  <Input
                    value={studentProfile.semester}
                    onChange={(e) =>
                      handleInputChange("semester", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">CGPA</Label>
                  <Input
                    value={studentProfile.cgpa}
                    onChange={(e) => handleInputChange("cgpa", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Specialization</Label>
                  <Input
                    value={studentProfile.specialization}
                    onChange={(e) =>
                      handleInputChange("specialization", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Batch</Label>
                  <Input
                    value={studentProfile.batch}
                    onChange={(e) => handleInputChange("batch", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentor Tab */}
        <TabsContent value="mentor" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-purple-600" />
                    Mentor Selection
                  </CardTitle>
                  <CardDescription>
                    Choose your mentor from available faculty members
                  </CardDescription>
                </div>
                {studentProfile.mentorName && !isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Change Mentor
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mentor Selection Dropdown - Always shown when editing OR when no mentor selected */}
              {(isEditing || !studentProfile.mentorName) && (
                <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      {studentProfile.mentorName
                        ? "Change Your Mentor"
                        : "Select Your Mentor"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Available Mentors
                        </Label>
                        <select
                          className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white dark:bg-gray-900 dark:border-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={formData.mentorId}
                          onChange={(e) =>
                            handleInputChange("mentorId", e.target.value)
                          }
                        >
                          <option value="">-- Select a mentor --</option>
                          {facultyList.map((faculty) => (
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
                        goals. You can change your mentor once per semester.
                      </p>
                      {/* Confirm Mentor Selection Button */}
                      {formData.mentorId &&
                        formData.mentorId !== profileData.mentorId && (
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

              {/* Current Mentor Profile Card - Show preview when selecting or saved mentor */}
              {(() => {
                // Get selected mentor from dropdown or use saved mentor
                const selectedMentor = formData.mentorId
                  ? facultyList.find((f) => f.id === formData.mentorId)
                  : null;

                const displayMentor =
                  selectedMentor ||
                  (studentProfile.mentorName
                    ? {
                        name: studentProfile.mentorName,
                        email: studentProfile.mentorEmail,
                        phone: studentProfile.mentorPhone,
                        department: studentProfile.mentorDepartment,
                      }
                    : null);

                return (
                  displayMentor && (
                    <>
                      <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <Avatar className="h-10 w-10 border-2 border-purple-200">
                          <AvatarImage src="/placeholder-mentor.jpg" />
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-sm font-bold p-3">
                            {displayMentor.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("") || "M"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 ">
                          <h2 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-1">
                            {displayMentor.name}
                          </h2>
                          {selectedMentor &&
                            formData.mentorId !== profileData.mentorId && (
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
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Mail className="h-5 w-5 text-blue-600" />
                              Contact Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <Mail className="h-5 w-5 text-blue-600" />
                              <div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  Email
                                </div>
                                <div className="font-medium">
                                  {displayMentor.email || "Not available"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <Phone className="h-5 w-5 text-green-600" />
                              <div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  Phone
                                </div>
                                <div className="font-medium">
                                  {displayMentor.phone || "Not available"}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Building className="h-5 w-5 text-orange-600" />
                              Department Info
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <GraduationCap className="h-5 w-5 text-purple-600" />
                              <div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  Department
                                </div>
                                <div className="font-medium">
                                  {displayMentor.department || "Not available"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <User className="h-5 w-5 text-blue-600" />
                              <div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  Employee ID
                                </div>
                                <div className="font-medium">
                                  {selectedMentor?.employeeId ||
                                    "Not available"}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Primary Email</Label>
                  <Input type="email" value={user?.email} disabled={true} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Alternative Email
                  </Label>
                  <Input
                    type="email"
                    value={studentProfile.altEmail}
                    onChange={(e) =>
                      handleInputChange("altEmail", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <Input
                    value={studentProfile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <Input
                    type="date"
                    value={studentProfile.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Blood Group</Label>
                  <Input
                    value={studentProfile.bloodGroup}
                    onChange={(e) =>
                      handleInputChange("bloodGroup", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Current Address</Label>
                  <Textarea
                    value={studentProfile.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    disabled={!isEditing}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Permanent Address
                  </Label>
                  <Textarea
                    value={studentProfile.permanentAddress}
                    onChange={(e) =>
                      handleInputChange("permanentAddress", e.target.value)
                    }
                    disabled={!isEditing}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Links Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600" />
                Social Media Links
              </CardTitle>
              <CardDescription>
                Connect your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub Username
                  </Label>
                  <Input
                    value={studentProfile.socialLinks.github}
                    onChange={(e) =>
                      handleSocialLinkChange("github", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Username
                  </Label>
                  <Input
                    value={studentProfile.socialLinks.linkedin}
                    onChange={(e) =>
                      handleSocialLinkChange("linkedin", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="john-doe-dev"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Portfolio Website URL
                  </Label>
                  <Input
                    value={studentProfile.socialLinks.portfolio}
                    onChange={(e) =>
                      handleSocialLinkChange("portfolio", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="https://johndoe.dev"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  Technical Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {studentProfile.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input placeholder="Add new skill" />
                    <Button size="sm">Add</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  Hobbies & Interests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {studentProfile.hobbies.map((hobby, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-pink-200 text-pink-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300"
                    >
                      {hobby}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input placeholder="Add new hobby" />
                    <Button size="sm">Add</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Achievements & Awards
              </CardTitle>
              <CardDescription>
                Your academic and extracurricular achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {studentProfile.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800"
                  >
                    <Award className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <span className="text-sm font-medium flex-1">
                      {achievement}
                    </span>
                    {isEditing && (
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Input placeholder="Add new achievement" />
                  <Button size="sm">
                    <Award className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                Bio & Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Personal Bio</Label>
                <Textarea
                  value={studentProfile.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[100px]"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guardian Tab */}
        <TabsContent value="guardian" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Guardian Information
              </CardTitle>
              <CardDescription>
                Emergency contact and guardian details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Guardian Name</Label>
                  <Input
                    value={studentProfile.guardianName}
                    onChange={(e) =>
                      handleInputChange("guardianName", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Relationship</Label>
                  <Input
                    value={studentProfile.guardianRelation}
                    onChange={(e) =>
                      handleInputChange("guardianRelation", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Number</Label>
                  <Input
                    value={studentProfile.guardianContact}
                    onChange={(e) =>
                      handleInputChange("guardianContact", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input
                    type="email"
                    value={studentProfile.guardianEmail}
                    onChange={(e) =>
                      handleInputChange("guardianEmail", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium">Occupation</Label>
                  <Input
                    value={studentProfile.guardianOccupation}
                    onChange={(e) =>
                      handleInputChange("guardianOccupation", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
