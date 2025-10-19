import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  FileText,
  Calendar,
  Search,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  HourglassIcon,
  Send,
  Eye,
  TrendingUp,
  Upload,
  Paperclip,
  UserCheck,
  Crown,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useLocation } from "wouter";
import { EmptyState } from "@/components/empty-state";
import {
  dataService,
  type Application,
  type ApplicationStatus,
} from "@/services/dataService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Applications() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("submitted");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newApplication, setNewApplication] = useState({
    title: "",
    type: "",
    description: "",
    proofFile: null as File | null,
  });

  const canReview =
    user?.role && ["FACULTY", "HOD", "DEAN", "ADMIN"].includes(user.role);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const applicationsData = await dataService.getApplications();
        setApplications(applicationsData);
      } catch (error) {
        console.error("Error loading applications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  // Search functionality
  const searchedApplications = searchTerm
    ? applications.filter(
        (app) =>
          app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : applications;

  // Tab-based filtering
  const getTabApplications = (tab: string) => {
    switch (tab) {
      case "submitted":
        return searchedApplications.filter(
          (app) => app.status === "PENDING" || app.status === "UNDER_REVIEW"
        ); // Only pending applications
      case "approved":
        return searchedApplications.filter((app) => app.status === "APPROVED");
      case "rejected":
        return searchedApplications.filter((app) => app.status === "REJECTED");
      default:
        return searchedApplications;
    }
  };

  const currentTabApplications = getTabApplications(activeTab);

  const getStatusInfo = (status: ApplicationStatus) => {
    switch (status) {
      case "APPROVED":
        return {
          icon: CheckCircle2,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-950/30",
          text: "Approved",
          borderColor: "border-green-200 dark:border-green-800",
        };
      case "REJECTED":
        return {
          icon: XCircle,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-950/30",
          text: "Rejected",
          borderColor: "border-red-200 dark:border-red-800",
        };
      case "PENDING":
      case "UNDER_REVIEW":
        return {
          icon: HourglassIcon,
          color: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-100 dark:bg-orange-950/30",
          text: status === "UNDER_REVIEW" ? "Under Review" : "Pending",
          borderColor: "border-orange-200 dark:border-orange-800",
        };
      default:
        return {
          icon: FileText,
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-100 dark:bg-gray-950/30",
          text: "Unknown",
          borderColor: "border-gray-200 dark:border-gray-800",
        };
    }
  };

  const handleCreateApplication = async () => {
    try {
      // In a real app, this would call dataService.createApplication
      console.log("Creating application:", newApplication);
      setIsCreateOpen(false);
      setNewApplication({
        title: "",
        type: "",
        description: "",
        proofFile: null,
      });
      // Reload applications
      const applicationsData = await dataService.getApplications();
      setApplications(applicationsData);
    } catch (error) {
      console.error("Error creating application:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              data-testid="button-create-application"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-[700px] max-h-[80vh] overflow-y-auto !left-4 !right-4 !translate-x-0 sm:!left-1/2 sm:!right-auto sm:!translate-x-[-50%] rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                New Application
              </DialogTitle>
              <DialogDescription>
                Submit a new application for approval. Fill in all the required
                details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Application Title*</Label>
                <Input
                  id="title"
                  placeholder="e.g., Medical Leave Request"
                  value={newApplication.title}
                  onChange={(e) =>
                    setNewApplication({
                      ...newApplication,
                      title: e.target.value,
                    })
                  }
                  className="border-2 focus:border-purple-500 dark:focus:border-purple-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Application Type*</Label>
                <Select
                  value={newApplication.type}
                  onValueChange={(value) =>
                    setNewApplication({ ...newApplication, type: value })
                  }
                >
                  <SelectTrigger
                    className="border-2 focus:border-purple-500 dark:focus:border-purple-400"
                    data-testid="select-application-type"
                  >
                    <SelectValue placeholder="Select application type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEAVE">Leave Application</SelectItem>
                    <SelectItem value="PERMISSION">
                      Permission Request
                    </SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your application..."
                  value={newApplication.description}
                  onChange={(e) =>
                    setNewApplication({
                      ...newApplication,
                      description: e.target.value,
                    })
                  }
                  className="min-h-[120px] border-2 focus:border-purple-500 dark:focus:border-purple-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proof">
                  Supporting Document/Proof (Optional)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                  <Input
                    id="proof"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setNewApplication({
                        ...newApplication,
                        proofFile: file,
                      });
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="proof"
                    className="flex flex-col items-center justify-center cursor-pointer space-y-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        {newApplication.proofFile
                          ? newApplication.proofFile.name
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateApplication}
                disabled={
                  !newApplication.title ||
                  !newApplication.type ||
                  !newApplication.description ||
                  !newApplication.proofFile
                }
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Submit Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900/80 focus:bg-white dark:focus:bg-gray-900 focus:border-purple-500 dark:focus:border-purple-400 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger
            value="submitted"
            className="flex flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3"
            data-testid="tab-submitted"
          >
            <Send className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Submitted</span>
            <Badge
              variant="secondary"
              className="text-xs px-1 py-0 h-4 min-w-[16px] ml-1"
            >
              {getTabApplications("submitted").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="flex flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3"
            data-testid="tab-approved"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Approved</span>
            <Badge
              variant="default"
              className="text-xs px-1 py-0 h-4 min-w-[16px] bg-green-100 text-green-800 ml-1"
            >
              {getTabApplications("approved").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="flex flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3"
            data-testid="tab-rejected"
          >
            <XCircle className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Rejected</span>
            <Badge
              variant="destructive"
              className="text-xs px-1 py-0 h-4 min-w-[16px] ml-1"
            >
              {getTabApplications("rejected").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Submitted Applications Tab */}
        <TabsContent value="submitted" className="space-y-4">
          {currentTabApplications.length === 0 ? (
            <EmptyState
              title={
                searchTerm
                  ? "No applications match your search"
                  : "No applications submitted yet"
              }
              description={
                searchTerm
                  ? "Try adjusting your search criteria"
                  : "Create your first application to get started with the application process!"
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentTabApplications.map((application) => {
                const statusInfo = getStatusInfo(application.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card
                    key={application.id}
                    className="group hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 min-h-[380px] flex flex-col"
                    data-testid={`application-card-${application.id}`}
                  >
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-xl ${statusInfo.bgColor} p-3`}>
                          <StatusIcon
                            className={`h-6 w-6 ${statusInfo.color}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                            {application.title}
                          </CardTitle>
                          <CardDescription className="mt-1 text-sm leading-relaxed line-clamp-2">
                            {application.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 flex-1">
                      {/* Application Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {application.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${statusInfo.color}`}
                          >
                            {statusInfo.text}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-muted-foreground">
                            Submitted{" "}
                            {new Date(
                              application.submittedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {application.proof && (
                          <div className="flex items-center gap-2 text-sm">
                            <Paperclip className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-600 text-xs">
                              {application.proof.fileName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Approval Flow */}
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        <h4 className="text-sm font-medium ">
                          Approval Status:
                        </h4>

                        {/* Mentor Teacher Approval */}
                        <div className="flex items-center gap-2">
                          {application.mentorTeacher?.approvedAt ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : application.rejectedBy === "MENTOR" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-orange-500" />
                          )}
                          <UserCheck className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium ">Mentor</p>
                            <p className="text-xs text-gray-500">
                              {application.mentorTeacher?.name ||
                                "Not assigned"}
                            </p>
                            {application.mentorTeacher?.approvedAt && (
                              <p className="text-xs text-green-600">
                                Approved on{" "}
                                {new Date(
                                  application.mentorTeacher.approvedAt
                                ).toLocaleDateString()}
                              </p>
                            )}
                            {application.rejectedBy === "MENTOR" && (
                              <p className="text-xs text-red-600">
                                Rejected on{" "}
                                {application.rejectedAt
                                  ? new Date(
                                      application.rejectedAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* HOD Approval */}
                        <div className="flex items-center gap-2">
                          {application.hod?.approvedAt ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : application.rejectedBy === "HOD" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : application.mentorTeacher?.approvedAt ? (
                            <Clock className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-300" />
                          )}
                          <Crown className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium ">HOD </p>
                            <p className="text-xs text-gray-600">
                              {application.hod?.name || "Not assigned"}
                            </p>
                            {application.hod?.approvedAt && (
                              <p className="text-xs text-green-600">
                                Approved on{" "}
                                {new Date(
                                  application.hod.approvedAt
                                ).toLocaleDateString()}
                              </p>
                            )}
                            {application.rejectedBy === "HOD" && (
                              <p className="text-xs text-red-600">
                                Rejected on{" "}
                                {application.rejectedAt
                                  ? new Date(
                                      application.rejectedAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="outline"
                        className="w-full group/btn hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/30 hover:border-purple-500 transition-all duration-200"
                        data-testid={`button-view-application-${application.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Approved Applications Tab */}
        <TabsContent value="approved" className="space-y-4">
          {currentTabApplications.length === 0 ? (
            <EmptyState
              title="No approved applications"
              description="Applications that have been approved will appear here."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentTabApplications.map((application) => {
                const statusInfo = getStatusInfo(application.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card
                    key={application.id}
                    className={`group hover:shadow-lg transition-all duration-200 border-2 ${statusInfo.borderColor} min-h-[300px] flex flex-col`}
                    data-testid={`application-card-approved-${application.id}`}
                  >
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-xl ${statusInfo.bgColor} p-3`}>
                          <StatusIcon
                            className={`h-6 w-6 ${statusInfo.color}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle
                            className={`text-lg ${statusInfo.color} line-clamp-2`}
                          >
                            {application.title}
                          </CardTitle>
                          <CardDescription className="mt-1 text-sm leading-relaxed line-clamp-2">
                            {application.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">
                            Application Approved
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">
                            Submitted{" "}
                            {new Date(
                              application.submittedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {application.proof && (
                          <div className="flex items-center gap-2 text-sm">
                            <Paperclip className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-600 text-xs">
                              {application.proof.fileName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Approval Timeline */}
                      <div className="space-y-2 pt-2 border-t border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20 p-3 rounded-lg">
                        <h5 className="text-xs font-semibold text-green-700 dark:text-green-300">
                          Approval Timeline:
                        </h5>
                        {application.mentorTeacher?.approvedAt && (
                          <div className="flex items-center gap-2 text-xs">
                            <UserCheck className="h-3 w-3 text-green-600 dark:text-green-400" />
                            <span className="text-green-700 dark:text-green-300">
                              Mentor approved:{" "}
                              {new Date(
                                application.mentorTeacher.approvedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {application.hod?.approvedAt && (
                          <div className="flex items-center gap-2 text-xs">
                            <Crown className="h-3 w-3 text-green-600 dark:text-green-400" />
                            <span className="text-green-700 dark:text-green-300">
                              HOD approved:{" "}
                              {new Date(
                                application.hod.approvedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Rejected Applications Tab */}
        <TabsContent value="rejected" className="space-y-4">
          {currentTabApplications.length === 0 ? (
            <EmptyState
              title="No rejected applications"
              description="Applications that have been rejected will appear here."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentTabApplications.map((application) => {
                const statusInfo = getStatusInfo(application.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card
                    key={application.id}
                    className={`group hover:shadow-lg transition-all duration-200 border-2 ${statusInfo.borderColor} opacity-75 min-h-[300px] flex flex-col`}
                    data-testid={`application-card-rejected-${application.id}`}
                  >
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-xl ${statusInfo.bgColor} p-3`}>
                          <StatusIcon
                            className={`h-6 w-6 ${statusInfo.color}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle
                            className={`text-lg ${statusInfo.color} line-clamp-2`}
                          >
                            {application.title}
                          </CardTitle>
                          <CardDescription className="mt-1 text-sm leading-relaxed line-clamp-2">
                            {application.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600 dark:text-red-400">
                            Application Rejected
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-red-500" />
                          <span className="text-muted-foreground">
                            Submitted{" "}
                            {new Date(
                              application.submittedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {application.proof && (
                          <div className="flex items-center gap-2 text-sm">
                            <Paperclip className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-600 text-xs">
                              {application.proof.fileName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rejection Details */}
                      <div className="space-y-2 pt-2 border-t border-red-200 dark:border-red-700 bg-red-50/50 dark:bg-red-900/20 p-3 rounded-lg">
                        <h5 className="text-xs font-semibold text-red-700 dark:text-red-300">
                          Rejection Details:
                        </h5>
                        <div className="flex items-center gap-2 text-xs">
                          {application.rejectedBy === "MENTOR" ? (
                            <UserCheck className="h-3 w-3 text-red-600 dark:text-red-400" />
                          ) : (
                            <Crown className="h-3 w-3 text-red-600 dark:text-red-400" />
                          )}
                          <span className="text-red-700 dark:text-red-300">
                            Rejected by{" "}
                            {application.rejectedBy === "MENTOR"
                              ? "Mentor Teacher"
                              : "HOD"}
                          </span>
                        </div>
                        {application.rejectedAt && (
                          <div className="text-xs text-red-700 dark:text-red-300">
                            Date:{" "}
                            {new Date(
                              application.rejectedAt
                            ).toLocaleDateString()}
                          </div>
                        )}
                        {application.rejectionReason && (
                          <div className="text-xs text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30 p-2 rounded border-l-2 border-red-400 dark:border-red-500">
                            <strong>Reason:</strong>{" "}
                            {application.rejectionReason}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
