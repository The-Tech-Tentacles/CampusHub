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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Application } from "@/services/dataService";
import {
  FileText,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Eye,
  Paperclip,
  Calendar,
  User,
  Building,
  ArrowUpCircle,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReviewAction = "APPROVED" | "REJECTED" | "UNDER_REVIEW";

export default function FacultyApplications() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  // Dialogs
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // Review state
  const [reviewAction, setReviewAction] = useState<ReviewAction>("APPROVED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [escalateToDean, setEscalateToDean] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await api.getApplications();
      if (response.success && response.data) {
        setApplications(response.data as Application[]);
      }
    } catch (error) {
      console.error("Error loading applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = async (application: Application) => {
    try {
      const response = await api.getApplication(application.id);
      if (response.success && response.data) {
        setSelectedApplication(response.data as Application);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      console.error("Error loading application:", error);
      toast({
        title: "Error",
        description: "Failed to load application details",
        variant: "destructive",
      });
    }
  };

  const handleReviewClick = (application: Application) => {
    setSelectedApplication(application);
    setReviewAction("APPROVED");
    setReviewNotes("");
    setEscalateToDean(false);
    setEscalationReason("");
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedApplication) return;

    if (reviewAction === "REJECTED" && !reviewNotes.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    if (escalateToDean && !escalationReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for escalation to Dean",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.updateApplicationStatus(
        selectedApplication.id,
        {
          status: reviewAction,
          notes: reviewNotes,
          escalate: escalateToDean,
          escalationReason: escalateToDean ? escalationReason : undefined,
        }
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Application ${reviewAction.toLowerCase()} successfully`,
        });
        setIsReviewDialogOpen(false);
        setSelectedApplication(null);
        loadApplications();
      } else {
        throw new Error(response.message || "Failed to update application");
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !searchTerm ||
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Categorize applications
  const pendingApplications = filteredApplications.filter(
    (app) => app.status === "PENDING" || app.status === "UNDER_REVIEW"
  );
  const approvedApplications = filteredApplications.filter(
    (app) => app.status === "APPROVED"
  );
  const rejectedApplications = filteredApplications.filter(
    (app) => app.status === "REJECTED"
  );
  const escalatedApplications = filteredApplications.filter(
    (app) => app.status === "ESCALATED"
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "ESCALATED":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            <ArrowUpCircle className="h-3 w-3 mr-1" />
            Escalated
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCurrentLevelBadge = (level: string) => {
    const levelMap: Record<string, { label: string; color: string }> = {
      MENTOR: { label: "Mentor Review", color: "bg-blue-100 text-blue-700" },
      HOD: { label: "HOD Review", color: "bg-purple-100 text-purple-700" },
      DEAN: { label: "Dean Review", color: "bg-indigo-100 text-indigo-700" },
      COMPLETED: { label: "Completed", color: "bg-gray-100 text-gray-700" },
    };

    const levelInfo = levelMap[level] || {
      label: level,
      color: "bg-gray-100 text-gray-700",
    };
    return (
      <Badge variant="secondary" className={levelInfo.color}>
        {levelInfo.label}
      </Badge>
    );
  };

  const canReview = (application: Application) => {
    if (user?.role === "FACULTY") {
      return application.currentLevel === "MENTOR";
    } else if (user?.role === "HOD") {
      return (
        application.currentLevel === "HOD" &&
        application.mentorStatus === "APPROVED"
      );
    } else if (user?.role === "DEAN") {
      return (
        application.requiresDeanApproval && application.currentLevel === "DEAN"
      );
    }
    return false;
  };

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(application.status)}
              {getCurrentLevelBadge(application.currentLevel)}
              <Badge variant="outline" className="text-xs">
                {application.type}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">
              {application.title}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {application.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{application.submittedBy}</span>
          </div>
          {application.department && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>{application.department}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Submitted:{" "}
              {format(new Date(application.submittedAt), "MMM dd, yyyy")}
            </span>
          </div>
        </div>

        {/* Review Status Summary */}
        {application.status !== "PENDING" && (
          <div className="border-t pt-3 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">
              Review Progress
            </div>
            <div className="flex items-center gap-4 text-xs">
              {application.mentorStatus && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Mentor:</span>
                  {application.mentorStatus === "APPROVED" ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : application.mentorStatus === "REJECTED" ? (
                    <XCircle className="h-3 w-3 text-red-600" />
                  ) : (
                    <Clock className="h-3 w-3 text-yellow-600" />
                  )}
                </div>
              )}
              {application.hodStatus && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">HOD:</span>
                  {application.hodStatus === "APPROVED" ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : application.hodStatus === "REJECTED" ? (
                    <XCircle className="h-3 w-3 text-red-600" />
                  ) : (
                    <Clock className="h-3 w-3 text-yellow-600" />
                  )}
                </div>
              )}
              {application.requiresDeanApproval && application.deanStatus && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Dean:</span>
                  {application.deanStatus === "APPROVED" ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : application.deanStatus === "REJECTED" ? (
                    <XCircle className="h-3 w-3 text-red-600" />
                  ) : (
                    <Clock className="h-3 w-3 text-yellow-600" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewApplication(application)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {canReview(application) && (
            <Button
              size="sm"
              onClick={() => handleReviewClick(application)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" />
          Application Management
        </h1>
        <p className="text-muted-foreground">
          Review and approve applications from your mentees
        </p>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="ESCALATED">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {pendingApplications.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {approvedApplications.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {rejectedApplications.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Escalated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {escalatedApplications.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full max-w-3xl grid-cols-4">
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">
              {pendingApplications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            <Badge variant="secondary" className="ml-2">
              {approvedApplications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            <Badge variant="secondary" className="ml-2">
              {rejectedApplications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="escalated">
            Escalated
            <Badge variant="secondary" className="ml-2">
              {escalatedApplications.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No pending applications</p>
                <p className="text-sm text-muted-foreground">
                  Applications awaiting review will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingApplications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No approved applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedApplications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No rejected applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rejectedApplications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="escalated" className="space-y-4">
          {escalatedApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ArrowUpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No escalated applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {escalatedApplications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedApplication?.title}</DialogTitle>
            <DialogDescription>Application Details</DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4 py-4">
              {/* Status and Current Level */}
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(selectedApplication.status)}
                {getCurrentLevelBadge(selectedApplication.currentLevel)}
                <Badge variant="outline">{selectedApplication.type}</Badge>
              </div>

              {/* Applicant Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Applicant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                    <span>{selectedApplication.submittedBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Department:</span>
                    <span>{selectedApplication.department || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Submitted:</span>
                    <span>
                      {format(
                        new Date(selectedApplication.submittedAt),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Description</Label>
                <div className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                  {selectedApplication.description}
                </div>
              </div>

              {/* Proof File */}
              {selectedApplication.proofFileUrl && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Attached Proof
                  </Label>
                  <a
                    href={selectedApplication.proofFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span>View Attachment</span>
                  </a>
                </div>
              )}

              {/* Review Timeline */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Review Timeline
                </Label>
                <div className="space-y-3">
                  {/* Mentor Review */}
                  {selectedApplication.mentorStatus && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {selectedApplication.mentorStatus === "APPROVED" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : selectedApplication.mentorStatus ===
                            "REJECTED" ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                          Mentor Review - {selectedApplication.mentorStatus}
                        </CardTitle>
                      </CardHeader>
                      {selectedApplication.mentorNotes && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {selectedApplication.mentorNotes}
                          </p>
                          {selectedApplication.mentorReviewedAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Reviewed on{" "}
                              {format(
                                new Date(selectedApplication.mentorReviewedAt),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* HOD Review */}
                  {selectedApplication.hodStatus && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {selectedApplication.hodStatus === "APPROVED" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : selectedApplication.hodStatus === "REJECTED" ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                          HOD Review - {selectedApplication.hodStatus}
                        </CardTitle>
                      </CardHeader>
                      {selectedApplication.hodNotes && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {selectedApplication.hodNotes}
                          </p>
                          {selectedApplication.hodReviewedAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Reviewed on{" "}
                              {format(
                                new Date(selectedApplication.hodReviewedAt),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Dean Review */}
                  {selectedApplication.requiresDeanApproval &&
                    selectedApplication.deanStatus && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            {selectedApplication.deanStatus === "APPROVED" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : selectedApplication.deanStatus ===
                              "REJECTED" ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                            Dean Review - {selectedApplication.deanStatus}
                          </CardTitle>
                        </CardHeader>
                        {selectedApplication.deanNotes && (
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {selectedApplication.deanNotes}
                            </p>
                            {selectedApplication.deanReviewedAt && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Reviewed on{" "}
                                {format(
                                  new Date(selectedApplication.deanReviewedAt),
                                  "MMM dd, yyyy HH:mm"
                                )}
                              </p>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            {selectedApplication && canReview(selectedApplication) && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleReviewClick(selectedApplication);
                }}
              >
                Review Application
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Application Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>{selectedApplication?.title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Review Decision */}
            <div className="space-y-2">
              <Label>Decision *</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={reviewAction === "APPROVED" ? "default" : "outline"}
                  onClick={() => setReviewAction("APPROVED")}
                  className={
                    reviewAction === "APPROVED"
                      ? "bg-green-600 hover:bg-green-700"
                      : "hover:bg-green-50"
                  }
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant={reviewAction === "REJECTED" ? "default" : "outline"}
                  onClick={() => setReviewAction("REJECTED")}
                  className={
                    reviewAction === "REJECTED"
                      ? "bg-red-600 hover:bg-red-700"
                      : "hover:bg-red-50"
                  }
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant={
                    reviewAction === "UNDER_REVIEW" ? "default" : "outline"
                  }
                  onClick={() => setReviewAction("UNDER_REVIEW")}
                  className={
                    reviewAction === "UNDER_REVIEW"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-blue-50"
                  }
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Review
                </Button>
              </div>
            </div>

            {/* Review Notes */}
            <div className="space-y-2">
              <Label>
                Notes{" "}
                {reviewAction === "REJECTED" && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  reviewAction === "REJECTED"
                    ? "Please provide a reason for rejection..."
                    : "Add any additional notes or comments..."
                }
                rows={4}
                className={reviewAction === "REJECTED" ? "border-red-300" : ""}
              />
            </div>

            {/* Escalate to Dean (HOD only) */}
            {user?.role === "HOD" && reviewAction === "APPROVED" && (
              <div className="space-y-4 border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={escalateToDean}
                    onChange={(e) => setEscalateToDean(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">
                    Escalate to Dean for final approval
                  </span>
                </label>

                {escalateToDean && (
                  <div className="space-y-2">
                    <Label>
                      Escalation Reason <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      placeholder="Explain why this requires Dean's attention..."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Warning Messages */}
            {reviewAction === "REJECTED" && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <strong>Warning:</strong> Rejecting this application will
                  prevent it from moving forward. Please ensure you've provided
                  clear feedback.
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
