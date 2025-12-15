import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { api, Department, AcademicYear } from "@/services/api";
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
  ArrowLeft,
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
  status?: "ACTIVE" | "INACTIVE" | "DRAFT";
}

export default function FacultyForms() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [myForms, setMyForms] = useState<Form[]>([]);
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [activeForms, setActiveForms] = useState<Form[]>([]);
  const [draftForms, setDraftForms] = useState<Form[]>([]);
  const [facultyForms, setFacultyForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

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
    status: "DRAFT",
  });

  // Temporary field being added
  const [tempField, setTempField] = useState<FormField>({
    name: "",
    label: "",
    type: "text",
    required: false,
  });

  // Track which field is being edited
  const [isEditingFieldIndex, setIsEditingFieldIndex] = useState<number | null>(
    null
  );

  // Track whether the Add New Field card is visible
  const [isAddFieldVisible, setIsAddFieldVisible] = useState<boolean>(false);

  // Track form details dialog
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [viewingForm, setViewingForm] = useState<Form | null>(null);

  useEffect(() => {
    loadForms();
    loadDepartments();
    loadAcademicYears();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const [myFormsRes, allFormsRes] = await Promise.all([
        api.getMyForms(),
        api.getForms(),
      ]);

      if (myFormsRes.success && myFormsRes.data) {
        const forms = myFormsRes.data as Form[];
        setMyForms(forms);

        // Filter forms created by this faculty by status
        setActiveForms(forms.filter((form) => form.status === "ACTIVE"));
        setDraftForms(forms.filter((form) => form.status === "DRAFT"));
      }
      if (allFormsRes.success && allFormsRes.data) {
        const forms = allFormsRes.data as Form[];
        setAllForms(forms);

        // Filter forms targeted to faculty role
        setFacultyForms(
          forms.filter((form) => {
            // Must be targeted to faculty role
            const hasFacultyRole =
              form.targetRoles && form.targetRoles.includes("FACULTY");

            // Must be for all departments OR match faculty's department
            const departmentMatch =
              !form.targetDepartments ||
              form.targetDepartments.length === 0 ||
              (user?.departmentId &&
                form.targetDepartments.includes(user.departmentId));

            return hasFacultyRole && departmentMatch;
          })
        );
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

  const loadDepartments = async () => {
    try {
      const response = await api.getDepartments();
      if (response.success && response.data) {
        setDepartments(response.data as Department[]);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const loadAcademicYears = async () => {
    try {
      const response = await api.getAcademicYears();
      if (response.success && response.data) {
        setAcademicYears(response.data as AcademicYear[]);
      }
    } catch (error) {
      console.error("Error loading academic years:", error);
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

    // Ensure required field is explicitly set
    const fieldToSave: FormField = {
      name: tempField.name,
      label: tempField.label,
      type: tempField.type,
      placeholder: tempField.placeholder,
      required: tempField.required === true, // Explicitly convert to boolean
      options: tempField.options,
    };

    if (isEditingFieldIndex !== null) {
      // Update existing field
      const newFields = [...formData.formData.fields];
      newFields[isEditingFieldIndex] = fieldToSave;
      setFormData({
        ...formData,
        formData: { fields: newFields },
      });
      setIsEditingFieldIndex(null);
    } else {
      // Add new field
      setFormData({
        ...formData,
        formData: {
          fields: [...formData.formData.fields, fieldToSave],
        },
      });
      // Hide the add field card after adding
      setIsAddFieldVisible(false);
    }

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
    // If we were editing this field, reset
    if (isEditingFieldIndex === index) {
      setIsEditingFieldIndex(null);
      setTempField({
        name: "",
        label: "",
        type: "text",
        required: false,
      });
    }
  };

  const handleEditField = (index: number) => {
    const field = formData.formData.fields[index];
    setTempField({ ...field });
    setIsEditingFieldIndex(index);
  };

  const handleCreateForm = async () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.deadline ||
      formData.formData.fields.length === 0 ||
      !formData.targetRoles ||
      formData.targetRoles.length === 0 ||
      !formData.targetYears ||
      formData.targetYears.length === 0
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields, add at least one form field, and select target roles and years",
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
      status: "DRAFT",
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
            <CardTitle
              className="text-lg leading-tight cursor-pointer hover:text-primary transition-colors"
              onClick={() => {
                setViewingForm(form);
                setIsViewDetailsDialogOpen(true);
              }}
            >
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
    <div className="p-4 md:p-6 space-y-6 max-w-9xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              Forms Management
            </h1>
          </div>
        </div>
        <div>
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
      </div>

      {/* Create Form Button */}
      <div className="flex justify-center md:justify-end w-full max-w-9xl mx-auto md:w-full">
        <Button
          onClick={() => {
            setIsCreateDialogOpen(true);
            // Auto-select faculty's department if they're faculty
            if (user?.role === "FACULTY" && user?.departmentId) {
              setFormData((prev) => ({
                ...prev,
                targetDepartments: [user.departmentId as string],
              }));
            }
          }}
          className="w-full"
        >
          Create New Form
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active-forms" className="space-y-4">
        <TabsList className="w-full inline-flex md:flex h-auto overflow-x-auto md:overflow-x-visible overflow-y-hidden justify-start md:justify-around gap-2 p-1">
          <TabsTrigger
            value="active-forms"
            className="gap-2 flex-shrink-0 md:flex-1"
          >
            <CheckCircle2 className="h-4 w-4" />
            Active
            <Badge variant="secondary">{activeForms.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="draft-forms"
            className="gap-2 flex-shrink-0 md:flex-1"
          >
            <FileText className="h-4 w-4" />
            Draft
            <Badge variant="secondary">{draftForms.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="faculty-forms"
            className="gap-2 flex-shrink-0 md:flex-1"
          >
            <Users className="h-4 w-4" />
            Faculty Forms
            <Badge variant="secondary">{facultyForms.length}</Badge>
          </TabsTrigger>
          {user?.role === "HOD" && (
            <TabsTrigger
              value="all-forms"
              className="gap-2 flex-shrink-0 md:flex-1"
            >
              <FileText className="h-4 w-4" />
              All Forms
              <Badge variant="secondary">{allForms.length}</Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="active-forms" className="space-y-4">
          {activeForms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No active forms</p>
                <p className="text-sm text-muted-foreground">
                  Forms with ACTIVE status will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeForms.map((form) => (
                <FormCard key={form.id} form={form} showActions />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft-forms" className="space-y-4">
          {draftForms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No draft forms</p>
                <p className="text-sm text-muted-foreground">
                  Forms with DRAFT status will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {draftForms.map((form) => (
                <FormCard key={form.id} form={form} showActions />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="faculty-forms" className="space-y-4">
          {facultyForms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  No faculty forms available
                </p>
                <p className="text-sm text-muted-foreground">
                  Forms targeted to FACULTY role will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {facultyForms.map((form) => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>
          )}
        </TabsContent>

        {user?.role === "HOD" && (
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
        )}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Form Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({
                      ...formData,
                      status: value as "ACTIVE" | "INACTIVE" | "DRAFT",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Draft forms are hidden from users until activated
                </p>
              </div>
              <div className="space-y-2">
                <Label>Form Options</Label>
                <div className="flex flex-col gap-2">
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
              </div>
            </div>

            {/* Target Settings */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Target Audience</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Roles *</Label>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      // Filter roles based on current user's role
                      let availableRoles: string[] = [];
                      if (user?.role === "FACULTY") {
                        availableRoles = ["STUDENT", "FACULTY"];
                      } else if (user?.role === "HOD") {
                        availableRoles = ["STUDENT", "FACULTY", "HOD"];
                      } else {
                        availableRoles = ["STUDENT", "FACULTY", "HOD"];
                      }
                      return availableRoles.map((role) => (
                        <label
                          key={role}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData.targetRoles?.includes(role) || false
                            }
                            onChange={(e) => {
                              const roles = formData.targetRoles || [];
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  targetRoles: [...roles, role],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  targetRoles: roles.filter((r) => r !== role),
                                });
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">{role}</span>
                        </label>
                      ));
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select which user roles can access this form
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Target Years *</Label>
                  <div className="flex flex-wrap gap-2">
                    {academicYears.map((year) => (
                      <label
                        key={year.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.targetYears?.includes(year.name) || false
                          }
                          onChange={(e) => {
                            const years = formData.targetYears || [];
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                targetYears: [...years, year.name],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                targetYears: years.filter(
                                  (y) => y !== year.name
                                ),
                              });
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{year.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select at least one year
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Target Departments (Optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      // Filter departments based on user role
                      let availableDepartments = departments;
                      if (user?.role === "FACULTY" && user?.departmentId) {
                        // Faculty can only see their own department
                        availableDepartments = departments.filter(
                          (dept) => dept.id === user.departmentId
                        );
                      }
                      // HOD can see all departments
                      return availableDepartments.map((dept) => (
                        <label
                          key={dept.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData.targetDepartments?.includes(dept.id) ||
                              false
                            }
                            onChange={(e) => {
                              const depts = formData.targetDepartments || [];
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  targetDepartments: [...depts, dept.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  targetDepartments: depts.filter(
                                    (d) => d !== dept.id
                                  ),
                                });
                              }
                            }}
                            disabled={user?.role === "FACULTY"}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">{dept.name}</span>
                        </label>
                      ));
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {user?.role === "FACULTY"
                      ? "Your department is automatically selected"
                      : "Leave empty to target all departments"}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields Builder */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Form Fields</h3>

              {/* Current Fields */}
              {formData.formData.fields.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.formData.fields.map((field, index) => (
                    <Card key={index}>
                      {isEditingFieldIndex === index ? (
                        // Expanded edit mode
                        <CardContent className="pt-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Field Name (identifier)</Label>
                              <Input
                                value={tempField.name}
                                onChange={(e) =>
                                  setTempField({
                                    ...tempField,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="e.g., studentName"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Field Label (display)</Label>
                              <Input
                                value={tempField.label}
                                onChange={(e) =>
                                  setTempField({
                                    ...tempField,
                                    label: e.target.value,
                                  })
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
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="select">
                                    Dropdown
                                  </SelectItem>
                                  <SelectItem value="checkbox">
                                    Checkbox
                                  </SelectItem>
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
                            tempField.type === "checkbox") && (
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
                          <div className="flex gap-2">
                            <Button onClick={handleAddField} className="flex-1">
                              <Edit className="h-4 w-4 mr-2" />
                              Update Field
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditingFieldIndex(null);
                                setTempField({
                                  name: "",
                                  label: "",
                                  type: "text",
                                  required: false,
                                });
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      ) : (
                        // Collapsed view
                        <CardContent className="flex items-center gap-2 p-3">
                          <div className="flex-1">
                            <div className="font-medium">{field.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {field.type} • {field.name}
                              {field.required && " • Required"}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditField(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveField(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {/* Add New Field */}
              {!isAddFieldVisible ? (
                <Button
                  variant="outline"
                  onClick={() => setIsAddFieldVisible(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Field
                </Button>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Add New Field</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsAddFieldVisible(false);
                          setTempField({
                            name: "",
                            label: "",
                            type: "text",
                            required: false,
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
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
                            setTempField({
                              ...tempField,
                              label: e.target.value,
                            })
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
                      tempField.type === "checkbox") && (
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
              )}
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

      {/* View Form Details Dialog */}
      <Dialog
        open={isViewDetailsDialogOpen}
        onOpenChange={setIsViewDetailsDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{viewingForm?.title}</DialogTitle>
            <DialogDescription className="text-base mt-2">
              {viewingForm?.description}
            </DialogDescription>
          </DialogHeader>

          {viewingForm && (
            <div className="space-y-6 py-4">
              {/* Form Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Status
                  </div>
                  <Badge
                    variant={
                      viewingForm.status === "ACTIVE" ? "default" : "secondary"
                    }
                  >
                    {viewingForm.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Deadline
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(
                        new Date(viewingForm.deadline),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Created
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(viewingForm.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                {viewingForm.createdBy && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      Created By
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{viewingForm.createdBy}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Form Fields</h3>
                  <Badge variant="outline">
                    {viewingForm.formData?.fields?.length || 0} fields
                  </Badge>
                </div>

                {viewingForm.formData?.fields &&
                viewingForm.formData.fields.length > 0 ? (
                  <div className="space-y-3">
                    {viewingForm.formData.fields.map(
                      (field: FormField, index: number) => (
                        <Card
                          key={index}
                          className="overflow-hidden border-l-4 border-l-primary"
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-semibold text-base">
                                      {field.label}
                                    </h4>
                                    {field.required && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs px-1.5 py-0"
                                      >
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground font-mono">
                                    {field.name}
                                  </p>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="capitalize"
                                >
                                  {field.type}
                                </Badge>
                              </div>

                              {field.placeholder && (
                                <div className="pt-2 border-t">
                                  <span className="text-xs text-muted-foreground">
                                    Placeholder:{" "}
                                  </span>
                                  <span className="text-sm italic">
                                    {field.placeholder}
                                  </span>
                                </div>
                              )}

                              {field.options && field.options.length > 0 && (
                                <div className="pt-2 border-t">
                                  <span className="text-xs text-muted-foreground mb-2 block">
                                    Options:
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {field.options.map((option, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {option}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No fields defined for this form
                  </div>
                )}
              </div>

              {/* Target Information */}
              {(viewingForm.targetRoles ||
                viewingForm.targetYears ||
                viewingForm.targetDepartments) && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Target Audience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {viewingForm.targetRoles &&
                      viewingForm.targetRoles.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Roles
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {viewingForm.targetRoles.map((role, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="capitalize"
                              >
                                {role.toLowerCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    {viewingForm.targetYears &&
                      viewingForm.targetYears.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Academic Years
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {viewingForm.targetYears.map((year, idx) => (
                              <Badge key={idx} variant="outline">
                                {year}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    {viewingForm.targetDepartments &&
                      viewingForm.targetDepartments.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Departments
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {viewingForm.targetDepartments.map((dept, idx) => (
                              <Badge key={idx} variant="outline">
                                {departments.find((d) => d.id === dept)?.name ||
                                  dept}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Additional Settings */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    {viewingForm.allowMultipleSubmissions ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Allow Multiple Submissions</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    {viewingForm.requiresApproval ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Requires Approval</span>
                  </div>
                  {viewingForm.maxSubmissions && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Max Submissions: {viewingForm.maxSubmissions}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
