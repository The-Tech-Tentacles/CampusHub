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
  Clock,
  CheckCircle2,
  XCircle,
  HourglassIcon,
  Send,
  Eye,
  Upload,
  Paperclip,
  UserCheck,
  Crown,
  X,
  Trash2,
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
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(
    null
  );

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
      // Create the application
      await dataService.createApplication({
        title: newApplication.title,
        type: newApplication.type,
        description: newApplication.description,
        proofFileUrl: newApplication.proofFile
          ? URL.createObjectURL(newApplication.proofFile)
          : undefined,
      });

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
      alert("Failed to create application. Please try again.");
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (applicationId: string) => {
    setApplicationToDelete(applicationId);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!applicationToDelete) return;

    try {
      await dataService.deleteApplication(applicationToDelete);

      // Reload applications
      const applicationsData = await dataService.getApplications();
      setApplications(applicationsData);

      setIsDeleteConfirmOpen(false);
      setApplicationToDelete(null);
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Failed to delete application. Please try again.");
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
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full"
              data-testid="button-create-application"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-[700px] max-h-[80vh] overflow-y-auto !left-4 !right-4 !translate-x-0 sm:!left-1/2 sm:!right-auto sm:!translate-x-[-50%] rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
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
                  className="border-2 focus:border-blue-500 dark:focus:border-blue-400 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    className="border-2 focus:border-blue-500 dark:focus:border-blue-400"
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
                  className="min-h-[120px] border-2 focus:border-blue-500 dark:focus:border-blue-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proof">
                  Supporting Document/Proof (Optional)
                </Label>
                {newApplication.proofFile ? (
                  <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Paperclip className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {newApplication.proofFile.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setNewApplication({
                            ...newApplication,
                            proofFile: null,
                          })
                        }
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-950/30 flex-shrink-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
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
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateApplication}
                disabled={
                  !newApplication.title ||
                  !newApplication.type ||
                  !newApplication.description
                }
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Submit Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900/80 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-400 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
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
                    className="group hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 min-h-[380px] flex flex-col"
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
                          <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
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
                        {application.proofFileUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <Paperclip className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-600 text-xs">
                              {application.proofFileUrl.split("/").pop()}
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
                          {application.mentorStatus === "APPROVED" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : application.mentorStatus === "REJECTED" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : application.mentorStatus === "UNDER_REVIEW" ? (
                            <Clock className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-300" />
                          )}
                          <UserCheck className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium ">Mentor</p>
                            <p className="text-xs text-gray-500">
                              Status: {application.mentorStatus || "Pending"}
                            </p>
                            {application.mentorReviewedAt && (
                              <p className="text-xs text-green-600">
                                Reviewed on{" "}
                                {new Date(
                                  application.mentorReviewedAt
                                ).toLocaleDateString()}
                              </p>
                            )}
                            {application.mentorNotes && (
                              <p className="text-xs text-gray-600 italic mt-1">
                                "{application.mentorNotes}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* HOD Approval */}
                        <div className="flex items-center gap-2">
                          {application.hodStatus === "APPROVED" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : application.hodStatus === "REJECTED" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : application.hodStatus === "UNDER_REVIEW" ? (
                            <Clock className="h-4 w-4 text-orange-500" />
                          ) : application.mentorStatus === "APPROVED" ? (
                            <Clock className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-300" />
                          )}
                          <Crown className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium ">HOD </p>
                            <p className="text-xs text-gray-500">
                              Status: {application.hodStatus || "Pending"}
                            </p>
                            {application.hodReviewedAt && (
                              <p className="text-xs text-green-600">
                                Reviewed on{" "}
                                {new Date(
                                  application.hodReviewedAt
                                ).toLocaleDateString()}
                              </p>
                            )}
                            {application.hodNotes && (
                              <p className="text-xs text-gray-600 italic mt-1">
                                "{application.hodNotes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewApplication(application)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {application.status === "PENDING" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDeleteClick(application.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        )}
                      </div>
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
                        {application.proofFileUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <Paperclip className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-600 text-xs">
                              {application.proofFileUrl.split("/").pop()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Approval Timeline */}
                      <div className="space-y-2 pt-2 border-t border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20 p-3 rounded-lg">
                        <h5 className="text-xs font-semibold text-green-700 dark:text-green-300">
                          Approval Timeline:
                        </h5>
                        {application.mentorReviewedAt &&
                          application.mentorStatus === "APPROVED" && (
                            <div className="flex items-center gap-2 text-xs">
                              <UserCheck className="h-3 w-3 text-green-600 dark:text-green-400" />
                              <span className="text-green-700 dark:text-green-300">
                                Mentor approved:{" "}
                                {new Date(
                                  application.mentorReviewedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        {application.hodReviewedAt &&
                          application.hodStatus === "APPROVED" && (
                            <div className="flex items-center gap-2 text-xs">
                              <Crown className="h-3 w-3 text-green-600 dark:text-green-400" />
                              <span className="text-green-700 dark:text-green-300">
                                HOD approved:{" "}
                                {new Date(
                                  application.hodReviewedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-green-200">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleViewApplication(application)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
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
                        {application.proofFileUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <Paperclip className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-600 text-xs">
                              {application.proofFileUrl.split("/").pop()}
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
                          {application.mentorStatus === "REJECTED" ? (
                            <UserCheck className="h-3 w-3 text-red-600 dark:text-red-400" />
                          ) : (
                            <Crown className="h-3 w-3 text-red-600 dark:text-red-400" />
                          )}
                          <span className="text-red-700 dark:text-red-300">
                            Rejected by{" "}
                            {application.mentorStatus === "REJECTED"
                              ? "Mentor Teacher"
                              : "HOD"}
                          </span>
                        </div>
                        {(application.mentorReviewedAt ||
                          application.hodReviewedAt) && (
                          <div className="text-xs text-red-700 dark:text-red-300">
                            Date:{" "}
                            {new Date(
                              application.mentorStatus === "REJECTED"
                                ? application.mentorReviewedAt!
                                : application.hodReviewedAt!
                            ).toLocaleDateString()}
                          </div>
                        )}
                        {(application.mentorNotes || application.hodNotes) && (
                          <div className="text-xs text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30 p-2 rounded border-l-2 border-red-400 dark:border-red-500">
                            <strong>Reason:</strong>{" "}
                            {application.mentorStatus === "REJECTED"
                              ? application.mentorNotes
                              : application.hodNotes}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-red-200">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleViewApplication(application)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Application Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Application Details</DialogTitle>
            <DialogDescription>
              Complete information about this application
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6 py-4">
              {/* Application Info */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Title
                  </Label>
                  <p className="text-base mt-1">{selectedApplication.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Type
                  </Label>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedApplication.type}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={
                        getStatusInfo(selectedApplication.status).color
                      }
                    >
                      {getStatusInfo(selectedApplication.status).text}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <p className="text-base mt-1 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedApplication.description}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Submitted Date
                  </Label>
                  <p className="text-base mt-1">
                    {new Date(
                      selectedApplication.submittedAt
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {selectedApplication.proofFileUrl && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Proof/Supporting Document
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-blue-500" />
                      <a
                        href={selectedApplication.proofFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {selectedApplication.proofFileUrl.split("/").pop()}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Approval Flow */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Approval Flow
                </h3>
                <div className="space-y-4">
                  {/* Mentor Status */}
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <h4 className="font-semibold">Mentor Teacher</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {selectedApplication.mentorStatus === "APPROVED" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : selectedApplication.mentorStatus === "REJECTED" ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : selectedApplication.mentorStatus ===
                          "UNDER_REVIEW" ? (
                          <Clock className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-300" />
                        )}
                        <span className="text-sm">
                          Status:{" "}
                          {selectedApplication.mentorStatus || "Pending"}
                        </span>
                      </div>
                      {selectedApplication.mentorReviewedAt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Reviewed on:{" "}
                          {new Date(
                            selectedApplication.mentorReviewedAt
                          ).toLocaleDateString()}
                        </p>
                      )}
                      {selectedApplication.mentorNotes && (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                          <p className="text-sm font-semibold mb-1">Notes:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            "{selectedApplication.mentorNotes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* HOD Status */}
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <h4 className="font-semibold">Head of Department</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {selectedApplication.hodStatus === "APPROVED" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : selectedApplication.hodStatus === "REJECTED" ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : selectedApplication.hodStatus === "UNDER_REVIEW" ? (
                          <Clock className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-300" />
                        )}
                        <span className="text-sm">
                          Status: {selectedApplication.hodStatus || "Pending"}
                        </span>
                      </div>
                      {selectedApplication.hodReviewedAt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Reviewed on:{" "}
                          {new Date(
                            selectedApplication.hodReviewedAt
                          ).toLocaleDateString()}
                        </p>
                      )}
                      {selectedApplication.hodNotes && (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                          <p className="text-sm font-semibold mb-1">Notes:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            "{selectedApplication.hodNotes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600 dark:text-red-400">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this application? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setApplicationToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
