import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Heart,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Save,
  Edit2,
  X,
  ArrowLeft,
  Clock,
  Building,
  Plus,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FacultyProfile {
  // User table fields
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
  phone: string | null;
  avatarUrl: string | null;
  department: string | null;
  departmentId: string | null;
  role: string;
  isActive: boolean;

  // Profile table fields
  dateOfBirth: string | null;
  bloodGroup: string | null;
  altEmail: string | null;
  address: string | null;
  permanentAddress: string | null;
  socialLinks: Record<string, string>;
  skills: string[];
  achievements: string[];
  hobbies: string[];
  bio: string | null;

  // Faculty-specific fields
  prefix: string | null;
  gender: string | null;
  cabinLocationId: string | null;
  officeHours: string | null;
  researchInterest: string | null;
  qualification: string | null;
  experience: string | null;
}

export default function FacultyProfile() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [formData, setFormData] = useState<Partial<FacultyProfile>>({});
  const [rooms, setRooms] = useState<
    Array<{ id: string; name: string; code: string; building: string }>
  >([]);
  const [cabinOpen, setCabinOpen] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");

  useEffect(() => {
    loadProfile();
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await api.getRooms();
      if (response.success && response.data) {
        setRooms(response.data);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.getFacultyProfile();

      if (response.success && response.data) {
        setProfile(response.data as FacultyProfile);
        setFormData(response.data as FacultyProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Convert comma-separated strings to arrays before saving
      const dataToSave = { ...formData };

      // Handle empty cabinLocationId
      if (
        dataToSave.cabinLocationId === "" ||
        dataToSave.cabinLocationId === undefined
      ) {
        dataToSave.cabinLocationId = null;
      }

      if (typeof dataToSave.skills === "string") {
        dataToSave.skills = (dataToSave.skills as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (typeof dataToSave.achievements === "string") {
        dataToSave.achievements = (dataToSave.achievements as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (typeof dataToSave.hobbies === "string") {
        dataToSave.hobbies = (dataToSave.hobbies as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const response = await api.updateFacultyProfile(dataToSave);

      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setIsEditing(false);
        loadProfile();
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const handleArrayFieldChange = (
    field: "skills" | "achievements" | "hobbies",
    value: string
  ) => {
    // Store as string during editing, will be split on save
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [platform]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8 text-blue-600" />
            Faculty Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your professional information and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <CardDescription className="text-lg mt-1">
                {profile.prefix && `${profile.prefix} `}
                {profile.department || "No Department"}
              </CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{profile.role}</Badge>
                {profile.employeeId && (
                  <Badge variant="outline">ID: {profile.employeeId}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Prefix</Label>
              {isEditing ? (
                <Select
                  value={formData.prefix || ""}
                  onValueChange={(v) => setFormData({ ...formData, prefix: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select prefix" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr.">Dr.</SelectItem>
                    <SelectItem value="Prof.">Prof.</SelectItem>
                    <SelectItem value="Mr.">Mr.</SelectItem>
                    <SelectItem value="Ms.">Ms.</SelectItem>
                    <SelectItem value="Mrs.">Mrs.</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">{profile.prefix || "Not specified"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Full Name *</Label>
              {isEditing ? (
                <Input
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-sm">{profile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Employee ID</Label>
              {isEditing ? (
                <Input
                  value={formData.employeeId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  placeholder="Enter employee ID"
                />
              ) : (
                <p className="text-sm">
                  {profile.employeeId || "Not specified"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              {isEditing ? (
                <Select
                  value={formData.gender || ""}
                  onValueChange={(v) => setFormData({ ...formData, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">{profile.gender || "Not specified"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth
              </Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.dateOfBirth || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm">
                  {profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString()
                    : "Not specified"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Blood Group
              </Label>
              {isEditing ? (
                <Select
                  value={formData.bloodGroup || ""}
                  onValueChange={(v) =>
                    setFormData({ ...formData, bloodGroup: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">
                  {profile.bloodGroup || "Not specified"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Primary Email
              </Label>
              <p className="text-sm">{profile.email}</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Alternative Email
              </Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.altEmail || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, altEmail: e.target.value })
                  }
                  placeholder="alternative@example.com"
                />
              ) : (
                <p className="text-sm">{profile.altEmail || "Not specified"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 1234567890"
                />
              ) : (
                <p className="text-sm">{profile.phone || "Not specified"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Current Address
              </Label>
              {isEditing ? (
                <Textarea
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter your current address"
                  rows={3}
                />
              ) : (
                <p className="text-sm">{profile.address || "Not specified"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Permanent Address
              </Label>
              {isEditing ? (
                <Textarea
                  value={formData.permanentAddress || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permanentAddress: e.target.value,
                    })
                  }
                  placeholder="Enter your permanent address"
                  rows={3}
                />
              ) : (
                <p className="text-sm">
                  {profile.permanentAddress || "Not specified"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Cabin Location
            </Label>
            {isEditing ? (
              <Popover open={cabinOpen} onOpenChange={setCabinOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cabinOpen}
                    className="w-full justify-between"
                  >
                    {formData.cabinLocationId
                      ? rooms.find(
                          (room) => room.id === formData.cabinLocationId
                        )
                        ? `${
                            rooms.find(
                              (room) => room.id === formData.cabinLocationId
                            )?.name
                          } (${
                            rooms.find(
                              (room) => room.id === formData.cabinLocationId
                            )?.code
                          })`
                        : "Select room..."
                      : "Select room..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search rooms..."
                      value={roomSearch}
                      onValueChange={setRoomSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No room found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="clear"
                          onSelect={() => {
                            setFormData({
                              ...formData,
                              cabinLocationId: null,
                            });
                            setCabinOpen(false);
                          }}
                        >
                          <X className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Clear selection
                          </span>
                        </CommandItem>
                        {rooms
                          .filter(
                            (room) =>
                              room.name
                                .toLowerCase()
                                .includes(roomSearch.toLowerCase()) ||
                              room.code
                                .toLowerCase()
                                .includes(roomSearch.toLowerCase()) ||
                              room.building
                                ?.toLowerCase()
                                .includes(roomSearch.toLowerCase())
                          )
                          .map((room) => (
                            <CommandItem
                              key={room.id}
                              value={room.id}
                              onSelect={() => {
                                setFormData({
                                  ...formData,
                                  cabinLocationId: room.id,
                                });
                                setCabinOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.cabinLocationId === room.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{room.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {room.code}{" "}
                                  {room.building && `• ${room.building}`}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <p className="text-sm">
                {profile.cabinLocationId
                  ? rooms.find((room) => room.id === profile.cabinLocationId)
                    ? `${
                        rooms.find(
                          (room) => room.id === profile.cabinLocationId
                        )?.name
                      } (${
                        rooms.find(
                          (room) => room.id === profile.cabinLocationId
                        )?.code
                      })`
                    : profile.cabinLocationId
                  : "Not specified"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Office Hours
            </Label>
            {isEditing ? (
              <Input
                value={formData.officeHours || ""}
                onChange={(e) =>
                  setFormData({ ...formData, officeHours: e.target.value })
                }
                placeholder="e.g., Mon-Fri, 10 AM - 12 PM"
              />
            ) : (
              <p className="text-sm">
                {profile.officeHours || "Not specified"}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Experience</Label>
            {isEditing ? (
              <Textarea
                value={formData.experience || ""}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
                placeholder="Describe your work experience (e.g., 10+ years in Computer Science...)"
                rows={3}
              />
            ) : (
              <p className="text-sm">{profile.experience || "Not specified"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Qualification</Label>
            {isEditing ? (
              <Textarea
                value={formData.qualification || ""}
                onChange={(e) =>
                  setFormData({ ...formData, qualification: e.target.value })
                }
                placeholder="e.g., Ph.D. in Computer Science, M.Tech in AI..."
                rows={3}
              />
            ) : (
              <p className="text-sm">
                {profile.qualification || "Not specified"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Research Interests</Label>
            {isEditing ? (
              <Textarea
                value={formData.researchInterest || ""}
                onChange={(e) =>
                  setFormData({ ...formData, researchInterest: e.target.value })
                }
                placeholder="e.g., Machine Learning, Artificial Intelligence, Data Science..."
                rows={3}
              />
            ) : (
              <p className="text-sm">
                {profile.researchInterest || "Not specified"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Skills (comma-separated)</Label>
            {isEditing ? (
              <Textarea
                value={
                  Array.isArray(formData.skills)
                    ? formData.skills.join(", ")
                    : formData.skills || ""
                }
                onChange={(e) =>
                  handleArrayFieldChange("skills", e.target.value)
                }
                placeholder="e.g., Python, Java, Machine Learning, Data Analysis"
                rows={2}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No skills added
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Achievements & Hobbies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements & Hobbies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Achievements (comma-separated)</Label>
              {isEditing ? (
                <Textarea
                  value={
                    Array.isArray(formData.achievements)
                      ? formData.achievements.join(", ")
                      : formData.achievements || ""
                  }
                  onChange={(e) =>
                    handleArrayFieldChange("achievements", e.target.value)
                  }
                  placeholder="e.g., Best Teacher Award 2023, Published 10+ papers..."
                  rows={3}
                />
              ) : (
                <div className="space-y-1">
                  {profile.achievements && profile.achievements.length > 0 ? (
                    profile.achievements.map((achievement, index) => (
                      <p key={index} className="text-sm">
                        • {achievement}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No achievements added
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Hobbies (comma-separated)</Label>
              {isEditing ? (
                <Textarea
                  value={
                    Array.isArray(formData.hobbies)
                      ? formData.hobbies.join(", ")
                      : formData.hobbies || ""
                  }
                  onChange={(e) =>
                    handleArrayFieldChange("hobbies", e.target.value)
                  }
                  placeholder="e.g., Reading, Photography, Traveling..."
                  rows={3}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies && profile.hobbies.length > 0 ? (
                    profile.hobbies.map((hobby, index) => (
                      <Badge key={index} variant="outline">
                        {hobby}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hobbies added
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Links
              </CardTitle>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newLinks = { ...formData.socialLinks };
                    const linkNumber = Object.keys(newLinks).length + 1;
                    newLinks[`link${linkNumber}`] = "";
                    setFormData({ ...formData, socialLinks: newLinks });
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Link
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                {Object.entries(formData.socialLinks || {}).map(
                  ([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Platform Name</Label>
                          <Input
                            value={key}
                            onChange={(e) => {
                              const newLinks = { ...formData.socialLinks };
                              const oldValue = newLinks[key];
                              delete newLinks[key];
                              newLinks[e.target.value || key] = oldValue;
                              setFormData({
                                ...formData,
                                socialLinks: newLinks,
                              });
                            }}
                            placeholder="e.g., GitHub, LinkedIn, Portfolio"
                            className="mt-1"
                          />
                        </div>
                        <div className="flex-[2]">
                          <Label className="text-xs">URL</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              value={value as string}
                              onChange={(e) =>
                                handleSocialLinkChange(key, e.target.value)
                              }
                              placeholder="https://example.com/yourprofile"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const newLinks = { ...formData.socialLinks };
                                delete newLinks[key];
                                setFormData({
                                  ...formData,
                                  socialLinks: newLinks,
                                });
                              }}
                              className="shrink-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
                {(!formData.socialLinks ||
                  Object.keys(formData.socialLinks).length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No social links added. Click "Add Link" to add one.
                  </p>
                )}
              </>
            ) : (
              <>
                {profile.socialLinks &&
                Object.keys(profile.socialLinks).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(profile.socialLinks).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium capitalize">
                            {key}
                          </p>
                          <a
                            href={value as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline break-all"
                          >
                            {value as string}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No social links added
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>About Me</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={formData.bio || ""}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Write a brief bio about yourself, your teaching philosophy, and interests..."
              rows={6}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {profile.bio || "No bio added yet"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
