import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Filter } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { useAuthStore } from "@/stores/auth-store";
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

export default function Notices() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const canCreateNotice = user?.role && ["FACULTY", "HOD", "DEAN", "ADMIN"].includes(user.role);

  const notices = [
    {
      id: "1",
      title: "Mid-Semester Examination Schedule Released",
      content: "The schedule for mid-semester examinations has been released. Please check your respective department notice boards for detailed timings.",
      createdBy: "Dr. Sarah Johnson",
      status: "approved" as const,
      scope: "GLOBAL",
      publishedAt: "2024-01-15",
      isRead: false,
    },
    {
      id: "2",
      title: "Library Timings Extended for Exam Week",
      content: "The central library will remain open from 7 AM to 11 PM during the examination week to facilitate student preparation.",
      createdBy: "Library Administration",
      status: "approved" as const,
      scope: "GLOBAL",
      publishedAt: "2024-01-14",
      isRead: false,
    },
    {
      id: "3",
      title: "Guest Lecture on AI and Machine Learning",
      content: "A special guest lecture will be conducted by Prof. Michael Chen from MIT on the latest trends in AI research.",
      createdBy: "Prof. David Williams",
      status: "approved" as const,
      scope: "DEPARTMENT",
      publishedAt: "2024-01-13",
      isRead: true,
    },
    {
      id: "4",
      title: "Sports Day Registration Open",
      content: "Annual sports day registration is now open. Students can register for various events through the student portal.",
      createdBy: "Sports Committee",
      status: "pending" as const,
      scope: "GLOBAL",
      publishedAt: "2024-01-12",
      isRead: true,
    },
  ];

  const handleCreateNotice = () => {
    console.log("Creating notice");
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Notices</h1>
          <p className="text-muted-foreground">Stay updated with campus announcements</p>
        </div>
        {canCreateNotice && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-notice">
                <Plus className="h-4 w-4 mr-2" />
                Create Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Notice</DialogTitle>
                <DialogDescription>
                  Create a notice to be published to students and faculty
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Notice title" data-testid="input-notice-title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Notice content"
                    rows={5}
                    data-testid="input-notice-content"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scope">Scope</Label>
                  <Select defaultValue="GLOBAL">
                    <SelectTrigger data-testid="select-notice-scope">
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GLOBAL">Global</SelectItem>
                      <SelectItem value="DEPARTMENT">Department</SelectItem>
                      <SelectItem value="YEAR">Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNotice} data-testid="button-submit-notice">
                  Create Notice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-notices"
              />
            </div>
            <Button variant="outline" data-testid="button-filter">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="unread" data-testid="tab-unread">
            Unread
            <Badge variant="secondary" className="ml-2">3</Badge>
          </TabsTrigger>
          {canCreateNotice && (
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending Approval
              <Badge variant="secondary" className="ml-2">1</Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notices.map((notice) => (
            <Card
              key={notice.id}
              className="hover-elevate cursor-pointer"
              data-testid={`notice-card-${notice.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{notice.title}</CardTitle>
                      {!notice.isRead && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <CardDescription>{notice.content}</CardDescription>
                  </div>
                  <StatusBadge status={notice.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>By {notice.createdBy}</span>
                  <span>•</span>
                  <span>{new Date(notice.publishedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <Badge variant="outline">{notice.scope}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {notices.filter(n => !n.isRead).map((notice) => (
            <Card
              key={notice.id}
              className="hover-elevate cursor-pointer"
              data-testid={`notice-card-${notice.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{notice.title}</CardTitle>
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <CardDescription>{notice.content}</CardDescription>
                  </div>
                  <StatusBadge status={notice.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>By {notice.createdBy}</span>
                  <span>•</span>
                  <span>{new Date(notice.publishedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <Badge variant="outline">{notice.scope}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {canCreateNotice && (
          <TabsContent value="pending" className="space-y-4">
            {notices.filter(n => n.status === "pending").map((notice) => (
              <Card key={notice.id} data-testid={`notice-card-${notice.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{notice.title}</CardTitle>
                      <CardDescription className="mt-2">{notice.content}</CardDescription>
                    </div>
                    <StatusBadge status={notice.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>By {notice.createdBy}</span>
                      <span>•</span>
                      <span>{new Date(notice.publishedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <Badge variant="outline">{notice.scope}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid="button-reject">
                        Reject
                      </Button>
                      <Button size="sm" data-testid="button-approve">
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
