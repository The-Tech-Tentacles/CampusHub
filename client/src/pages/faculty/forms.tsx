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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Form } from "@/services/dataService";
import { FormSubmission } from "@/services/api";
import {
  Plus,
  FileText,
  Users,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  X,
  Send,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "date"
    | "email"
    | "number";
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface CreateFormData {
  title: string;
  description: string;
  deadline: string;
  formData: {
    fields: FormField[];
  };
  targetYears?: string[];
  targetDepartments?: string[];
  targetRoles?: string[];
  departmentId?: string;
  maxSubmissions?: number;
  allowMultipleSubmissions: boolean;
  requiresApproval: boolean;
}

export default function FacultyForms() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [myForms, setMyForms] = useState<Form[]>([]);
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);

  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewSubmissionsDialogOpen, setIsViewSubmissionsDialogOpen] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form creation state
  const [formData, setFormData] = useState<CreateFormData>({
    title: "",
    description: "",
    deadline: "",
    formData: { fields: [] },
    allowMultipleSubmissions: false,
    requiresApproval: false,
  });

  // Temporary field being added
  const [tempField, setTempField] = useState<FormField>({
    name: "",
    label: "",
    type: "text",
    required: false,
  });

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const [myFormsRes, allFormsRes] = await Promise.all([
        api.getMyForms(),
        api.getForms(),
      ]);

      if (myFormsRes.success && myFormsRes.data) {
        setMyForms(myFormsRes.data as Form[]);
      }
      if (allFormsRes.success && allFormsRes.data) {
        setAllForms(allFormsRes.data as Form[]);
      }
    } catch (error) {
      console.error("Error loading forms:", error);
      toast({
        title: "Error",
        description: "Failed to load forms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (formId: string) => {
    try {
      const response = await api.getFormSubmissions(formId);
      if (response.success && response.data) {
        setSubmissions(response.data as FormSubmission[]);
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    }
  };

  const handleViewSubmissions = async (form: Form) => {
    setSelectedForm(form);
    await loadSubmissions(form.id);
    setIsViewSubmissionsDialogOpen(true);
  };

  const handleAddField = () => {
    if (!tempField.name || !tempField.label) {
      toast({
        title: "Validation Error",
        description: "Field name and label are required",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      formData: {
        fields: [...formData.formData.fields, { ...tempField }],
      },
    });

    setTempField({
      name: "",
      label: "",
      type: "text",
      required: false,
    });
  };

  const handleRemoveField = (index: number) => {
    const newFields = formData.formData.fields.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      formData: { fields: newFields },
    });
  };

  const handleCreateForm = async () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.deadline ||
      formData.formData.fields.length === 0
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields and add at least one form field",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.createForm(formData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Form created successfully",
        });
        setIsCreateDialogOpen(false);
        resetFormData();
        loadForms();
      } else {
        throw new Error(response.message || "Failed to create form");
      }
    } catch (error: any) {
      console.error("Error creating form:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create form",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this form? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await api.deleteForm(formId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Form deleted successfully",
        });
        loadForms();
      } else {
        throw new Error(response.message || "Failed to delete form");
      }
    } catch (error: any) {
      console.error("Error deleting form:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete form",
        variant: "destructive",
      });
    }
  };

  const resetFormData = () => {
    setFormData({
      title: "",
      description: "",
      deadline: "",
      formData: { fields: [] },
      allowMultipleSubmissions: false,
      requiresApproval: false,
    });
  };

  const exportSubmissionsToCSV = () => {
    if (!selectedForm || submissions.length === 0) return;

    // Get all unique field names from form definition
    const fieldNames =
      selectedForm.formData?.fields?.map((f: any) => f.name) || [];

    // CSV headers
    const headers = [
      "Student Name",
      "Email",
      "Enrollment Number",
      "Department",
      "Submitted At",
      ...fieldNames,
    ];

    // CSV rows
    const rows = submissions.map((submission: any) => {
      const row = [
        submission.submittedBy?.name || "",
        submission.submittedBy?.email || "",
        submission.submittedBy?.enrollmentNumber || "",
        submission.submittedBy?.department || "",
        submission.submittedAt
          ? new Date(submission.submittedAt).toLocaleString()
          : "",
      ];

      // Add field values
      fieldNames.forEach((fieldName: string) => {
        const value = submission.submissionData?.[fieldName] || "";
        // Escape commas and quotes
        const escapedValue = String(value).replace(/"/g, '""');
        row.push(`"${escapedValue}"`);
      });

      return row.join(",");
    });

    // Combine headers and rows
    const csv = [headers.join(","), ...rows].join("\n");

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedForm.title.replace(
      /[^a-z0-9]/gi,
      "_"
    )}_submissions_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Submissions exported successfully",
    });
  };

  const FormCard = ({
    form,
    showActions = false,
  }: {
    form: Form;
    showActions?: boolean;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={form.status === "ACTIVE" ? "default" : "secondary"}
              >
                {form.status}
              </Badge>
              {(form as any).submissionCount !== undefined && (
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {(form as any).submissionCount} submissions
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight">
              {form.title}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {form.description}
            </CardDescription>
          </div>
          {showActions && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleViewSubmissions(form)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                onClick={() => handleDeleteForm(form.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Created: {format(new Date(form.createdAt), "MMM dd, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Deadline: {format(new Date(form.deadline), "MMM dd, yyyy HH:mm")}
            </span>
          </div>
          {form.createdBy && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{form.createdBy}</span>
            </div>
          )}
        </div>
        {!showActions && form.isSubmitted && (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Submitted
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Forms Management
          </h1>
          <p className="text-muted-foreground">
            Create forms and view student submissions
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Form
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-forms" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-2">
          <TabsTrigger value="my-forms" className="gap-2">
            <FileText className="h-4 w-4" />
            My Forms
            <Badge variant="secondary">{myForms.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="all-forms" className="gap-2">
            <Users className="h-4 w-4" />
            All Forms
            <Badge variant="secondary">{allForms.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-forms" className="space-y-4">
          {myForms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No forms created yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first form to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myForms.map((form) => (
                <FormCard key={form.id} form={form} showActions />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all-forms" className="space-y-4">
          {allForms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No forms available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allForms.map((form) => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Form Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              Design a custom form for students to fill out
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Form title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the form"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Max Submissions</Label>
                <Input
                  type="number"
                  value={formData.maxSubmissions || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxSubmissions: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowMultipleSubmissions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allowMultipleSubmissions: e.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">Allow multiple submissions</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresApproval}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiresApproval: e.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">Requires approval</span>
              </label>
            </div>

            {/* Form Fields Builder */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Form Fields</h3>

              {/* Current Fields */}
              {formData.formData.fields.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.formData.fields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-muted rounded-md"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{field.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {field.type} • {field.name}
                          {field.required && " • Required"}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Field */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add New Field</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Field Name (identifier)</Label>
                      <Input
                        value={tempField.name}
                        onChange={(e) =>
                          setTempField({ ...tempField, name: e.target.value })
                        }
                        placeholder="e.g., studentName"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Field Label (display)</Label>
                      <Input
                        value={tempField.label}
                        onChange={(e) =>
                          setTempField({ ...tempField, label: e.target.value })
                        }
                        placeholder="e.g., Student Name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Field Type</Label>
                      <Select
                        value={tempField.type}
                        onValueChange={(value: any) =>
                          setTempField({ ...tempField, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="textarea">Text Area</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="select">Dropdown</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="radio">Radio Buttons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Placeholder (optional)</Label>
                      <Input
                        value={tempField.placeholder || ""}
                        onChange={(e) =>
                          setTempField({
                            ...tempField,
                            placeholder: e.target.value,
                          })
                        }
                        placeholder="Enter placeholder text"
                      />
                    </div>
                  </div>

                  {(tempField.type === "select" ||
                    tempField.type === "radio") && (
                    <div className="space-y-2">
                      <Label>Options (comma-separated)</Label>
                      <Input
                        value={tempField.options?.join(", ") || ""}
                        onChange={(e) =>
                          setTempField({
                            ...tempField,
                            options: e.target.value
                              .split(",")
                              .map((s) => s.trim()),
                          })
                        }
                        placeholder="e.g., Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempField.required}
                      onChange={(e) =>
                        setTempField({
                          ...tempField,
                          required: e.target.checked,
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Required field</span>
                  </label>

                  <Button onClick={handleAddField} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetFormData();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateForm} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Submissions Dialog */}
      <Dialog
        open={isViewSubmissionsDialogOpen}
        onOpenChange={setIsViewSubmissionsDialogOpen}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{selectedForm?.title}</DialogTitle>
                <DialogDescription>
                  {submissions.length} submission(s)
                </DialogDescription>
              </div>
              {submissions.length > 0 && (
                <Button
                  onClick={exportSubmissionsToCSV}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No submissions yet</p>
                <p className="text-sm text-muted-foreground">
                  Submissions will appear here once students start filling the
                  form
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission: any) => (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {submission.submittedBy?.name}
                          </CardTitle>
                          <CardDescription>
                            {submission.submittedBy?.email} •{" "}
                            {submission.submittedBy?.enrollmentNumber || "N/A"}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {format(
                            new Date(submission.submittedAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedForm?.formData?.fields?.map((field: any) => (
                          <div key={field.name} className="space-y-1">
                            <Label className="text-sm font-medium">
                              {field.label}
                            </Label>
                            <div className="p-2 bg-muted rounded-md text-sm">
                              {submission.submissionData?.[field.name] || (
                                <span className="text-muted-foreground italic">
                                  No data
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewSubmissionsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
