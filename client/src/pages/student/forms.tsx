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
  FileText,
  Calendar,
  Search,
  User,
  Clock,
  Send,
  Eye,
  CheckCircle2,
  Timer,
  AlertTriangle,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useLocation } from "wouter";
import { EmptyState } from "@/components/empty-state";
import { dataService, type Form, formatDate } from "@/services/dataService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Forms() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const [sortByDueDate, setSortByDueDate] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadForms = async () => {
      try {
        setLoading(true);
        // Load all forms to support all tabs (available, submitted, missed, created)
        const formsData = await dataService.getForms();
        setForms(formsData);
      } catch (error) {
        console.error("Error loading forms:", error);
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, []);

  // Search functionality
  const searchedForms = searchTerm
    ? forms.filter(
        (form) =>
          form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          form.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          form.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : forms;

  // Tab-based filtering
  const getTabForms = (tab: string) => {
    const now = new Date();

    switch (tab) {
      case "available":
        // Available forms are ACTIVE, not expired, and not submitted
        return searchedForms.filter(
          (form) =>
            form.status === "ACTIVE" &&
            new Date(form.deadline) > now &&
            !form.isSubmitted
        );
      case "submitted":
        return searchedForms.filter((form) => form.isSubmitted === true);
      case "missed":
        return searchedForms.filter(
          (form) =>
            (form.status === "ACTIVE" || form.status === "INACTIVE") &&
            new Date(form.deadline) <= now &&
            !form.isSubmitted
        );
      case "created":
        return searchedForms; // Would be filtered by createdBy === user.id
      default:
        return searchedForms;
    }
  };

  const currentTabForms = (() => {
    const tabForms = getTabForms(activeTab);

    // Sort based on the selected option
    return [...tabForms].sort((a, b) => {
      if (sortByDueDate) {
        // Sort by due date (earliest first)
        const dateA = new Date(a.deadline);
        const dateB = new Date(b.deadline);
        return dateA.getTime() - dateB.getTime();
      } else {
        // Default: Sort by posted date (most recent first)
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime(); // Most recent first
      }
    });
  })();

  const handleFillForm = (form: Form) => {
    setSelectedForm(form);
    setFormData({});
    setIsSubmitDialogOpen(true);
  };

  const handleViewSubmission = async (form: Form) => {
    try {
      // Fetch the full form data including submission details
      const fullFormData = await dataService.getFormById(form.id);
      if (fullFormData) {
        setSelectedForm(fullFormData);
      } else {
        setSelectedForm(form);
      }
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Error loading form submission:", error);
      setSelectedForm(form);
      setIsViewDialogOpen(true);
    }
  };

  const handleSubmitForm = async () => {
    if (!selectedForm) return;

    try {
      setIsSubmitting(true);
      const success = await dataService.submitForm(selectedForm.id, formData);

      if (success) {
        setIsSubmitDialogOpen(false);
        setFormData({});
        setSelectedForm(null);

        // Reload forms to update submission status
        const formsData = await dataService.getForms();
        setForms(formsData);

        // Switch to submitted tab to show the submitted form
        setActiveTab("submitted");
      } else {
        alert("Failed to submit form. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil(
      (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0)
      return {
        status: "expired",
        text: "Expired",
        color: "text-red-600 dark:text-red-400",
      };
    if (daysLeft <= 2)
      return {
        status: "urgent",
        text: `${daysLeft} days left`,
        color: "text-orange-600 dark:text-orange-400",
      };
    if (daysLeft <= 7)
      return {
        status: "soon",
        text: `${daysLeft} days left`,
        color: "text-yellow-600 dark:text-yellow-400",
      };
    return {
      status: "normal",
      text: `${daysLeft} days left`,
      color: "text-green-600 dark:text-green-400",
    };
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-2 p-4 md:p-6">
      {/* Search Bar */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="p-3">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search forms"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900/80 focus:bg-white dark:focus:bg-gray-900 focus:border-green-500 dark:focus:border-green-400 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              />
            </div>
            <Button
              variant={sortByDueDate ? "default" : "outline"}
              size="default"
              onClick={() => setSortByDueDate(!sortByDueDate)}
              className={`flex items-center gap-2 px-4 whitespace-nowrap ${
                sortByDueDate
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "border-2 border-gray-300 dark:border-gray-600 hover:bg-green-50 hover:border-green-500 dark:hover:bg-green-950/30"
              }`}
              data-testid="sort-by-due-date-button"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Sort by Due Date</span>
              <span className="sm:hidden">Sort Due</span>
            </Button>
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
            value="available"
            className="flex flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3"
            data-testid="tab-available"
          >
            <FileText className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Available</span>
            <Badge
              variant="secondary"
              className="text-xs px-1 py-0 h-4 min-w-[16px] ml-1"
            >
              {getTabForms("available").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="submitted"
            className="flex flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3"
            data-testid="tab-submitted"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Submitted</span>
            <Badge
              variant="secondary"
              className="text-xs px-1 py-0 h-4 min-w-[16px] ml-1"
            >
              {getTabForms("submitted").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="missed"
            className="flex flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3"
            data-testid="tab-missed"
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Missed</span>
            <Badge
              variant="destructive"
              className="text-xs px-1 py-0 h-4 min-w-[16px] ml-1"
            >
              {getTabForms("missed").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Available Forms Tab */}
        <TabsContent value="available" className="space-y-4">
          {currentTabForms.length === 0 ? (
            <EmptyState
              title="No forms found"
              description={
                searchTerm
                  ? "No forms match your search criteria"
                  : "No active forms available at the moment"
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentTabForms.map((form) => {
                const deadlineInfo = getDeadlineStatus(form.deadline);

                return (
                  <Card
                    key={form.id}
                    className="group hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-green-200 dark:hover:border-green-800 h-70 flex flex-col"
                    data-testid={`form-card-${form.id}`}
                  >
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-950/30 dark:to-blue-950/30 p-3">
                          <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                            {form.title}
                          </CardTitle>
                          <CardDescription className="mt-1 text-sm leading-relaxed line-clamp-2">
                            {form.description}
                          </CardDescription>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {form.createdBy}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 flex-1">
                      {/* Deadline Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Timer className="h-4 w-4 text-orange-500" />
                          <span className={deadlineInfo.color}>
                            {deadlineInfo.text}
                          </span>
                          {/* big dot */}
                          <span className="h-1 w-1 rounded-full bg-gray-500" />
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-muted-foreground">
                            Due {new Date(form.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleFillForm(form)}
                        className="w-full group/btn hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500 hover:text-white transition-all duration-200"
                        data-testid={`button-fill-form-${form.id}`}
                      >
                        <Send className="h-4 w-4 mr-2 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                        Fill Form
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Submitted Forms Tab */}
        <TabsContent value="submitted" className="space-y-4">
          {currentTabForms.length === 0 ? (
            <EmptyState
              title="No submissions yet"
              description="Forms you've submitted will appear here. Submit some forms to track your progress!"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentTabForms.map((form) => (
                <Card
                  key={form.id}
                  className="group hover:shadow-lg transition-all duration-200 border-2 border-green-200 dark:border-green-800 h-55 flex flex-col"
                  data-testid={`form-card-submitted-${form.id}`}
                >
                  <CardHeader className="pb-3 flex-shrink-0">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 p-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg text-green-700 dark:text-green-300 line-clamp-2">
                          {form.title}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm leading-relaxed line-clamp-2">
                          {form.description}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {form.createdBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">
                          Submitted{" "}
                          {new Date(form.submittedAt!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      onClick={() => handleViewSubmission(form)}
                      className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950/30"
                      data-testid={`button-view-submission-${form.id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Submission
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Missed Forms Tab */}
        <TabsContent value="missed" className="space-y-4">
          {currentTabForms.length === 0 ? (
            <EmptyState
              title="No missed forms"
              description="Great job! You haven't missed any form deadlines."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentTabForms.map((form) => {
                const deadlineInfo = getDeadlineStatus(form.deadline);

                return (
                  <Card
                    key={form.id}
                    className="group hover:shadow-lg transition-all duration-200 border-2 border-red-200 dark:border-red-800 opacity-75 h-55 flex flex-col"
                    data-testid={`form-card-missed-${form.id}`}
                  >
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/30 dark:to-orange-950/30 p-3">
                          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg text-red-700 dark:text-red-300 line-clamp-2">
                            {form.title}
                          </CardTitle>
                          <CardDescription className="mt-1 text-sm leading-relaxed line-clamp-2">
                            {form.description}
                          </CardDescription>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {form.createdBy}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600 dark:text-red-400">
                            Missed Deadline
                          </span>
                          {/* big dot */}
                          <span className="h-1 w-1 rounded-full bg-gray-500" />
                          <Clock className="h-4 w-4 text-red-500" />
                          <span className="text-muted-foreground">
                            Expired{" "}
                            {new Date(form.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Disabled Button */}
                      <Button
                        disabled
                        className="w-full opacity-50 cursor-not-allowed"
                        data-testid={`button-expired-form-${form.id}`}
                      >
                        <Timer className="h-4 w-4 mr-2" />
                        Form Expired
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Submission Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {selectedForm?.title}
            </DialogTitle>
            <DialogDescription>{selectedForm?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Dynamic form fields based on formData structure from database */}
            {selectedForm?.formData?.fields?.map(
              (field: any, index: number) => (
                <div key={field.name || index} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label || field.name}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>

                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      placeholder={
                        field.placeholder ||
                        `Enter ${field.label || field.name}`
                      }
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
                      required={field.required}
                      className="min-h-[100px] border-2 focus:border-green-500 dark:focus:border-green-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.name}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
                      required={field.required}
                      className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus:border-green-500 dark:focus:border-green-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option: string, idx: number) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type || "text"}
                      placeholder={
                        field.placeholder ||
                        `Enter ${field.label || field.name}`
                      }
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
                      required={field.required}
                      className="border-2 focus:border-green-500 dark:focus:border-green-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  )}
                </div>
              )
            )}

            {selectedForm && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                <Timer className="h-4 w-4 text-orange-600" />
                <span>
                  Due: {new Date(selectedForm.deadline).toLocaleDateString()} at{" "}
                  {new Date(selectedForm.deadline).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubmitDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitForm}
              disabled={
                isSubmitting ||
                selectedForm?.formData?.fields?.some(
                  (field: any) => field.required && !formData[field.name]
                )
              }
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Form
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Submission Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {selectedForm?.title}
            </DialogTitle>
            <DialogDescription>View your submitted form data</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Display submitted data */}
            {selectedForm?.formData?.fields?.map(
              (field: any, index: number) => {
                const submittedValue =
                  selectedForm?.submissionData?.[field.name];

                return (
                  <div key={field.name || index} className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {field.label || field.name}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>

                    <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {submittedValue || (
                          <span className="text-gray-400 italic">
                            No data provided
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              }
            )}

            {selectedForm?.submittedAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800 mt-4">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>
                  Submitted on{" "}
                  {new Date(selectedForm.submittedAt).toLocaleDateString()} at{" "}
                  {new Date(selectedForm.submittedAt).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
