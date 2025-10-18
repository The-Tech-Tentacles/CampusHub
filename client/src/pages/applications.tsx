import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth-store";

export default function Applications() {
  const { user } = useAuthStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const canReview = user?.role && ["FACULTY", "HOD", "DEAN", "ADMIN"].includes(user.role);

  const applications = [
    {
      id: "1",
      type: "LEAVE",
      title: "Medical Leave Application",
      body: "Requesting leave due to medical reasons from Jan 20-25, 2024.",
      status: "pending" as const,
      submittedAt: "2024-01-15",
      submittedBy: "Alex Johnson",
    },
    {
      id: "2",
      type: "PERMISSION",
      title: "Permission to Attend Workshop",
      body: "Requesting permission to attend AI/ML workshop at IIT Delhi.",
      status: "approved" as const,
      submittedAt: "2024-01-10",
      decidedAt: "2024-01-12",
      submittedBy: "Sarah Williams",
    },
    {
      id: "3",
      type: "OTHER",
      title: "Request for Letter of Recommendation",
      body: "Requesting LOR for graduate school application.",
      status: "rejected" as const,
      submittedAt: "2024-01-08",
      decidedAt: "2024-01-09",
      submittedBy: "Michael Chen",
    },
  ];

  const handleCreateApplication = () => {
    console.log("Creating application");
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Applications</h1>
          <p className="text-muted-foreground">Submit and track your applications</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-application">
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>New Application</DialogTitle>
              <DialogDescription>
                Submit a new application for approval
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Application Type</Label>
                <Select defaultValue="LEAVE">
                  <SelectTrigger data-testid="select-application-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEAVE">Leave</SelectItem>
                    <SelectItem value="PERMISSION">Permission</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief title for your application"
                  data-testid="input-application-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Description</Label>
                <Textarea
                  id="body"
                  placeholder="Detailed description of your request"
                  rows={5}
                  data-testid="input-application-body"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documents">Supporting Documents</Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  data-testid="input-application-documents"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateApplication} data-testid="button-submit-application">
                Submit Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-applications" data-testid="tab-my-applications">
            My Applications
          </TabsTrigger>
          {canReview && (
            <TabsTrigger value="pending-review" data-testid="tab-pending-review">
              Pending Review
              <Badge variant="secondary" className="ml-2">2</Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-applications" className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} data-testid={`application-card-${application.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{application.title}</CardTitle>
                      <Badge variant="outline">{application.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{application.body}</p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</span>
                  {application.decidedAt && (
                    <>
                      <span>•</span>
                      <span>Decided: {new Date(application.decidedAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {canReview && (
          <TabsContent value="pending-review" className="space-y-4">
            {applications
              .filter((app) => app.status === "pending")
              .map((application) => (
                <Card key={application.id} data-testid={`review-card-${application.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{application.title}</CardTitle>
                          <Badge variant="outline">{application.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{application.body}</p>
                        <p className="text-sm text-muted-foreground">
                          By: {application.submittedBy}
                        </p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="text-sm text-muted-foreground">
                        Submitted: {new Date(application.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-reject-${application.id}`}
                        >
                          Reject
                        </Button>
                        <Button size="sm" data-testid={`button-approve-${application.id}`}>
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
