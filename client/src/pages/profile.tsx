import { useState } from "react";
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
import { useAuthStore } from "@/stores/auth-store";
import { RoleBadge } from "@/components/role-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Instagram,
  Twitter,
  Upload,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function Profile() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const studentProfile = {
    // Basic Info
    enrollmentNo: "10220910xx",
    department: "AI & DS",
    year: "B. Tech",
    section: "A",
    cgpa: "8.5",
    semester: "7",
    batch: "2022-2026",
    rollNumber: "40xx",

    // Contact Info
    phone: "+91 98765 43210",
    altEmail: "john.doe.alt@gmail.com",
    address: "Room 205, Tower B, University Hostel",
    permanentAddress: "123 Main Street, Downtown, City - 110001",
    dateOfBirth: "2003-05-15",
    bloodGroup: "O+",

    // Guardian Info
    guardianName: "John Doe Sr.",
    guardianContact: "+91 98765 43211",
    guardianEmail: "john.sr@email.com",
    guardianRelation: "Father",
    guardianOccupation: "Software Engineer",

    // Academic Info
    previousEducation: "Delhi Public School",
    admissionDate: "2021-08-15",
    expectedGraduation: "2025-06-30",
    specialization: "Full Stack Development",

    // Mentor Info
    mentorName: "Dr. Sarah Johnson",
    mentorEmail: "sarah.johnson@university.edu",
    mentorPhone: "+91 98765 43299",
    mentorDepartment: "Computer Science",
    mentorOffice: "Room 301, CS Building",

    // Social & Interests
    socialLinks: {
      github: "johndoe",
      linkedin: "john-doe-dev",
      instagram: "john_codes",
      twitter: "johndev2003",
    },

    // Skills & Achievements
    skills: ["React", "Node.js", "Python", "Machine Learning", "UI/UX Design"],
    achievements: [
      "Dean's List Fall 2023",
      "Best Project Award 2023",
      "Hackathon Winner - TechFest 2024",
    ],

    // Additional Info
    hobbies: ["Coding", "Photography", "Music", "Gaming"],
    bio: "Passionate computer science student with a love for full-stack development and AI. Always eager to learn new technologies and contribute to open-source projects.",
  };

  const handleSave = () => {
    setIsEditing(false);
    // Handle save logic here
    console.log("Profile saved!");
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <Card className="overflow-hidden border-0 shadow-lg ">
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-8 text-white dark:text-gray-100">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-white/20 shadow-lg">
                <AvatarImage src={user?.avatar} className="object-cover" />
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
          {/* Academic Information Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Personal Bio */}
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

            {/* Skills Preview */}
            <div className="grid gap-6 md:grid-cols-2">
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
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        +{studentProfile.skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

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
            </div>
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
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
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
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
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
                    className="flex items-center gap-2 justify-center py-2 px-3 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 cursor-pointer"
                  >
                    <Github className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {studentProfile.socialLinks.github}
                    </span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-2 justify-center py-2 px-3 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 cursor-pointer"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {studentProfile.socialLinks.linkedin}
                    </span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-2 justify-center py-2 px-3 border-pink-200 text-pink-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300 cursor-pointer"
                  >
                    <Instagram className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {studentProfile.socialLinks.instagram}
                    </span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-2 justify-center py-2 px-3 border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 cursor-pointer"
                  >
                    <Twitter className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {studentProfile.socialLinks.twitter}
                    </span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
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
                      defaultValue={studentProfile.rollNumber}
                      disabled={!isEditing}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Department</Label>
                    <Input
                      defaultValue={studentProfile.department}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Year & Section
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        defaultValue={studentProfile.year}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                      <Input
                        defaultValue={studentProfile.section}
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
                      defaultValue={studentProfile.semester}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">CGPA</Label>
                    <Input
                      defaultValue={studentProfile.cgpa}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Specialization
                    </Label>
                    <Input
                      defaultValue={studentProfile.specialization}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Batch</Label>
                    <Input
                      defaultValue={studentProfile.batch}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Change Mentor
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mentor Selection Dropdown - shown when editing */}
              {isEditing && (
                <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Select Your Mentor
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
                          defaultValue={studentProfile.mentorName}
                        >
                          <option value="">-- Select a mentor --</option>
                          <option value="Dr. Sarah Johnson">
                            Dr. Sarah Johnson - Computer Science
                          </option>
                          <option value="Prof. Michael Chen">
                            Prof. Michael Chen - AI & Machine Learning
                          </option>
                          <option value="Dr. Priya Sharma">
                            Dr. Priya Sharma - Data Science
                          </option>
                          <option value="Prof. David Wilson">
                            Prof. David Wilson - Software Engineering
                          </option>
                          <option value="Dr. Anita Patel">
                            Dr. Anita Patel - Cybersecurity
                          </option>
                        </select>
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        Choose a mentor based on your interests and career
                        goals. You can change your mentor once per semester.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Mentor Profile Card */}
              <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <Avatar className="h-10 w-10 border-2 border-purple-200">
                  <AvatarImage src="/placeholder-mentor.jpg" />
                  <AvatarFallback className="bg-purple-100 text-purple-700 text-sm font-bold p-3">
                    {studentProfile.mentorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 ">
                  <h2 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-1">
                    {studentProfile.mentorName}
                  </h2>
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
                          {studentProfile.mentorEmail}
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
                          {studentProfile.mentorPhone}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="h-5 w-5 text-orange-600" />
                      Cabin Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <Building className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Cabin
                        </div>
                        <div className="font-medium">
                          {studentProfile.mentorOffice}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Department
                        </div>
                        <div className="font-medium">
                          {studentProfile.mentorDepartment}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                  <Input
                    type="email"
                    defaultValue={user?.email}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Alternative Email
                  </Label>
                  <Input
                    type="email"
                    defaultValue={studentProfile.altEmail}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <Input
                    defaultValue={studentProfile.phone}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <Input
                    type="date"
                    defaultValue={studentProfile.dateOfBirth}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Blood Group</Label>
                  <Input
                    defaultValue={studentProfile.bloodGroup}
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
                    defaultValue={studentProfile.address}
                    disabled={!isEditing}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Permanent Address
                  </Label>
                  <Textarea
                    defaultValue={studentProfile.permanentAddress}
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
                    defaultValue={studentProfile.socialLinks.github}
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
                    defaultValue={studentProfile.socialLinks.linkedin}
                    disabled={!isEditing}
                    placeholder="john-doe-dev"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram Username
                  </Label>
                  <Input
                    defaultValue={studentProfile.socialLinks.instagram}
                    disabled={!isEditing}
                    placeholder="john_codes"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter/X Username
                  </Label>
                  <Input
                    defaultValue={studentProfile.socialLinks.twitter}
                    disabled={!isEditing}
                    placeholder="johndev2003"
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
                  defaultValue={studentProfile.bio}
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
                    defaultValue={studentProfile.guardianName}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Relationship</Label>
                  <Input
                    defaultValue={studentProfile.guardianRelation}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Number</Label>
                  <Input
                    defaultValue={studentProfile.guardianContact}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input
                    type="email"
                    defaultValue={studentProfile.guardianEmail}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium">Occupation</Label>
                  <Input
                    defaultValue={studentProfile.guardianOccupation}
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
