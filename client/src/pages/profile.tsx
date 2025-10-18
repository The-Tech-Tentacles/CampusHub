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
} from "lucide-react";

export default function Profile() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const studentProfile = {
    enrollmentNo: "CS2021001234",
    department: "Computer Science",
    year: "3rd Year",
    section: "A",
    cgpa: "8.5",
    semester: "6",
    phone: "+91 98765 43210",
    address: "123 University Hostel, Campus Road",
    dateOfBirth: "2003-05-15",
    guardianName: "John Doe Sr.",
    guardianContact: "+91 98765 43211",
  };

  return (
    <div className="space-y-6 m-2">
      <div>
        <h1 className="text-3xl font-serif font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">
          View and manage your profile information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-serif font-bold">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="mt-3">
                  <RoleBadge role={user?.role || "STUDENT"} />
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                data-testid="button-edit-profile"
              >
                Edit Profile Picture
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your academic and contact details
                </CardDescription>
              </div>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                data-testid="button-toggle-edit"
              >
                {isEditing ? "Save Changes" : "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="academic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="academic" data-testid="tab-academic">
                  Academic Info
                </TabsTrigger>
                <TabsTrigger value="contact" data-testid="tab-contact">
                  Contact Info
                </TabsTrigger>
                <TabsTrigger value="guardian" data-testid="tab-guardian">
                  Guardian Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="academic" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Enrollment Number</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{studentProfile.enrollmentNo}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      defaultValue={studentProfile.department}
                      disabled={!isEditing}
                      data-testid="input-department"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      defaultValue={studentProfile.year}
                      disabled={!isEditing}
                      data-testid="input-year"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Input
                      defaultValue={studentProfile.section}
                      disabled={!isEditing}
                      data-testid="input-section"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Semester</Label>
                    <Input
                      defaultValue={studentProfile.semester}
                      disabled={!isEditing}
                      data-testid="input-semester"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CGPA</Label>
                    <Input
                      defaultValue={studentProfile.cgpa}
                      disabled={!isEditing}
                      data-testid="input-cgpa"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        defaultValue={studentProfile.phone}
                        disabled={!isEditing}
                        data-testid="input-phone"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        defaultValue={studentProfile.dateOfBirth}
                        disabled={!isEditing}
                        data-testid="input-dob"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Address</Label>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-3" />
                      <Input
                        defaultValue={studentProfile.address}
                        disabled={!isEditing}
                        data-testid="input-address"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="guardian" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Guardian Name</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input
                        defaultValue={studentProfile.guardianName}
                        disabled={!isEditing}
                        data-testid="input-guardian-name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Guardian Contact</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        defaultValue={studentProfile.guardianContact}
                        disabled={!isEditing}
                        data-testid="input-guardian-contact"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
