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
import {
  dataService,
  Notice,
  NoticeType,
  NoticeScope,
} from "@/services/dataService";
import {
  Plus,
  FileText,
  AlertCircle,
  Bell,
  Calendar,
  Eye,
  Trash2,
  Edit,
  Users,
  Globe,
  Building,
  GraduationCap,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface NoticeFormData {
  title: string;
  content: string;
  type: NoticeType;
  scope: NoticeScope;
  targetYears: string[];
  targetDepartments: string[];
  targetRoles: string[];
  expiresAt?: string;
}

export default function FacultyNotices() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [myNotices, setMyNotices] = useState<Notice[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NoticeFormData>({
    title: "",
    content: "",
    type: "general",
    scope: "GLOBAL",
    targetYears: [],
    targetDepartments: [],
    targetRoles: [],
    expiresAt: undefined,
  });

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const [all, mine] = await Promise.all([
        dataService.getNotices(),
        api.getMyNotices(),
      ]);
      setAllNotices(all);
      if (mine.success && mine.data) {
        setMyNotices(mine.data as Notice[]);
      }
    } catch (error) {
      console.error("Error loading notices:", error);
      toast({
        title: "Error",
        description: "Failed to load notices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.createNotice(formData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Notice created and published successfully",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        loadNotices();
      } else {
        throw new Error(response.message || "Failed to create notice");
      }
    } catch (error: any) {
      console.error("Error creating notice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create notice",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      scope: notice.scope,
      targetYears: notice.targetYears || [],
      targetDepartments: notice.targetDepartments || [],
      targetRoles: notice.targetRoles || [],
      expiresAt: notice.expiresAt
        ? new Date(notice.expiresAt).toISOString().slice(0, 16)
        : undefined,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateNotice = async () => {
    if (!editingNotice || !formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.updateNotice(editingNotice.id, formData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Notice updated successfully",
        });
        setIsEditDialogOpen(false);
        setEditingNotice(null);
        resetForm();
        loadNotices();
      } else {
        throw new Error(response.message || "Failed to update notice");
      }
    } catch (error: any) {
      console.error("Error updating notice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update notice",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) {
      return;
    }

    try {
      const response = await api.deleteNotice(noticeId);

      if (response.success) {
        toast({
          title: "Success",
          description: "Notice deleted successfully",
        });
        loadNotices();
      } else {
        throw new Error(response.message || "Failed to delete notice");
      }
    } catch (error: any) {
      console.error("Error deleting notice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete notice",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "general",
      scope: "GLOBAL",
      targetYears: [],
      targetDepartments: [],
      targetRoles: [],
      expiresAt: undefined,
    });
  };

  const getTypeIcon = (type: NoticeType) => {
    switch (type) {
      case "urgent":
        return <AlertCircle className="h-4 w-4" />;
      case "important":
        return <Bell className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: NoticeType) => {
    switch (type) {
      case "urgent":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "important":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  const getScopeIcon = (scope: NoticeScope) => {
    switch (scope) {
      case "GLOBAL":
        return <Globe className="h-3 w-3" />;
      case "DEPARTMENT":
        return <Building className="h-3 w-3" />;
      case "YEAR":
        return <GraduationCap className="h-3 w-3" />;
    }
  };

  const NoticeCard = ({
    notice,
    showActions = false,
  }: {
    notice: Notice;
    showActions?: boolean;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getTypeColor(notice.type)}>
                {getTypeIcon(notice.type)}
                <span className="ml-1 capitalize">{notice.type}</span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getScopeIcon(notice.scope)}
                <span className="ml-1">{notice.scope}</span>
              </Badge>
              {notice.isRead !== undefined && (
                <Badge
                  variant={notice.isRead ? "secondary" : "default"}
                  className="text-xs"
                >
                  {notice.isRead ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {notice.isRead ? "Read" : "Unread"}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight">
              {notice.title}
            </CardTitle>
          </div>
          {showActions && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEditNotice(notice)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                onClick={() => handleDeleteNotice(notice.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {notice.content}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {notice.createdBy || notice.createdByEmail}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(notice.publishedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          {notice.expiresAt && (
            <span className="flex items-center gap-1 text-orange-600">
              <Clock className="h-3 w-3" />
              Expires{" "}
              {formatDistanceToNow(new Date(notice.expiresAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-blue-600" />
            Notice Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage campus-wide notices and announcements
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Notice
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="all" className="gap-2">
            <Globe className="h-4 w-4" />
            All Notices
            {!loading && <Badge variant="secondary">{allNotices.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="mine" className="gap-2">
            <FileText className="h-4 w-4" />
            My Notices
            {!loading && <Badge variant="secondary">{myNotices.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allNotices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No notices available</p>
                <p className="text-sm text-muted-foreground">
                  Check back later for new announcements
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {allNotices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myNotices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  You haven't created any notices yet
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Click "Create Notice" to publish your first announcement
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Notice
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myNotices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} showActions />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Notice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Create New Notice
            </DialogTitle>
            <DialogDescription>
              Create and publish a notice for students and faculty
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter notice title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter notice content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={6}
              />
            </div>

            {/* Type and Scope */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Notice Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as NoticeType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        General
                      </div>
                    </SelectItem>
                    <SelectItem value="important">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Important
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Urgent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Scope *</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value) =>
                    setFormData({ ...formData, scope: value as NoticeScope })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GLOBAL">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Global (All Users)
                      </div>
                    </SelectItem>
                    <SelectItem value="DEPARTMENT">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Department
                      </div>
                    </SelectItem>
                    <SelectItem value="YEAR">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Academic Year
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formData.expiresAt || ""}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for notices that don't expire
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNotice}
              disabled={
                isSubmitting ||
                !formData.title.trim() ||
                !formData.content.trim()
              }
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Publish Notice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Notice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Notice
            </DialogTitle>
            <DialogDescription>Update the notice details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="Enter notice title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                placeholder="Enter notice content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={6}
              />
            </div>

            {/* Type and Scope */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Notice Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as NoticeType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        General
                      </div>
                    </SelectItem>
                    <SelectItem value="important">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Important
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Urgent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-scope">Scope *</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value) =>
                    setFormData({ ...formData, scope: value as NoticeScope })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GLOBAL">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Global (All Users)
                      </div>
                    </SelectItem>
                    <SelectItem value="DEPARTMENT">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Department
                      </div>
                    </SelectItem>
                    <SelectItem value="YEAR">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Academic Year
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="edit-expiresAt">Expiration Date (Optional)</Label>
              <Input
                id="edit-expiresAt"
                type="datetime-local"
                value={formData.expiresAt || ""}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for notices that don't expire
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingNotice(null);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateNotice}
              disabled={
                isSubmitting ||
                !formData.title.trim() ||
                !formData.content.trim()
              }
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Update Notice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
